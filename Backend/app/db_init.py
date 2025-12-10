import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'app.db')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

SCHEMA = '''
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    external_id TEXT UNIQUE,
    email TEXT,
    email_opt_in INTEGER DEFAULT 0,
    email_opt_in_at DATETIME
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT
);

CREATE TABLE IF NOT EXISTS product_details (
    product_id INTEGER PRIMARY KEY,
    description TEXT,
    price REAL DEFAULT 0,
    image_url TEXT,
    inventory INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    UNIQUE(product_id, size),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    interaction_type TEXT DEFAULT 'view',
    weight REAL DEFAULT 1,
    rating INTEGER DEFAULT 1,
    metadata TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL,
    admin_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    target_display TEXT,
    before_state TEXT,
    after_state TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
'''


def init_db(path=None):
    db_file = path or DB_PATH
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    cur.executescript(SCHEMA)
    # Lightweight migrations for older SQLite files
    alters = [
        "ALTER TABLE interactions ADD COLUMN interaction_type TEXT DEFAULT 'view'",
        "ALTER TABLE interactions ADD COLUMN weight REAL DEFAULT 1",
        "ALTER TABLE interactions ADD COLUMN metadata TEXT",
        "ALTER TABLE interactions ADD COLUMN rating INTEGER DEFAULT 1",
        "ALTER TABLE categories ADD COLUMN position INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN external_id TEXT",
        "ALTER TABLE users ADD COLUMN email TEXT",
        "ALTER TABLE users ADD COLUMN email_opt_in INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN email_opt_in_at DATETIME"
    ]
    for stmt in alters:
        try:
            cur.execute(stmt)
        except sqlite3.OperationalError:
            # Column already exists
            continue
    try:
        cur.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id)')
    except sqlite3.OperationalError:
        # Column may not exist yet if prior schema missing; skip until next run
        pass
    cur.execute('''
        UPDATE categories SET position = id
        WHERE position IS NULL OR position = 0
    ''')
    conn.commit()
    conn.close()


if __name__ == '__main__':
    print('Initializing DB at', DB_PATH)
    init_db()
