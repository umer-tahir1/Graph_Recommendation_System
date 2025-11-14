import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'app.db')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

SCHEMA = '''
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT
);

CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
'''


def init_db(path=None):
    db_file = path or DB_PATH
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    cur.executescript(SCHEMA)
    conn.commit()
    conn.close()


if __name__ == '__main__':
    print('Initializing DB at', DB_PATH)
    init_db()
