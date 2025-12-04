import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional, Sequence, Tuple

from .db_init import DB_PATH


def _current_timestamp() -> str:
    return datetime.utcnow().isoformat(timespec='seconds')


def get_conn(path: str | None = None):
    db = path or DB_PATH
    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    return conn


# -------------------- Users -------------------- #

def add_user(name: str, external_id: Optional[str] = None, *, email: Optional[str] = None, email_opt_in: Optional[bool] = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    opt_flag = 1 if email_opt_in else 0
    opt_timestamp = _current_timestamp() if email_opt_in else None
    cur.execute(
        'INSERT INTO users (name, external_id, email, email_opt_in, email_opt_in_at) VALUES (?, ?, ?, ?, ?)',
        (name, external_id, email, opt_flag, opt_timestamp)
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    return user_id


def list_users() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, external_id, email, email_opt_in, email_opt_in_at FROM users ORDER BY id')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, external_id, email, email_opt_in, email_opt_in_at FROM users WHERE id = ?', (user_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_external_id(external_id: str) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, external_id, email, email_opt_in, email_opt_in_at FROM users WHERE external_id = ?', (external_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def update_user_fields_by_external(
    external_id: str,
    *,
    name: Optional[str] = None,
    email: Optional[str] = None,
    email_opt_in: Optional[bool] = None,
) -> None:
    clauses = []
    params: List[Any] = []
    if name is not None:
        clauses.append('name = ?')
        params.append(name)
    if email is not None:
        clauses.append('email = ?')
        params.append(email)
    if email_opt_in is not None:
        clauses.append('email_opt_in = ?')
        params.append(1 if email_opt_in else 0)
        clauses.append('email_opt_in_at = ?')
        params.append(_current_timestamp() if email_opt_in else None)
    if not clauses:
        return
    params.append(external_id)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"UPDATE users SET {', '.join(clauses)} WHERE external_id = ?", params)
    conn.commit()
    conn.close()


def ensure_user_from_external(
    external_id: str,
    *,
    fallback_name: Optional[str] = None,
    email: Optional[str] = None,
    email_opt_in: Optional[bool] = None,
) -> Dict[str, Any]:
    existing = get_user_by_external_id(external_id)
    if existing:
        updates = {}
        if email and email != existing.get('email'):
            updates['email'] = email
        if email_opt_in is not None:
            current_flag = bool(existing.get('email_opt_in'))
            if current_flag != bool(email_opt_in):
                updates['email_opt_in'] = email_opt_in
        if updates:
            update_user_fields_by_external(external_id, **updates)
            existing = get_user_by_external_id(external_id) or existing
        return existing

    name = fallback_name or f'User {external_id[:8]}'
    user_id = add_user(name, external_id=external_id, email=email, email_opt_in=email_opt_in)
    created = get_user(user_id)
    return created or {'id': user_id, 'name': name, 'external_id': external_id, 'email': email, 'email_opt_in': int(bool(email_opt_in))}


def update_user_opt_in(user_id: int, email_opt_in: bool) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'UPDATE users SET email_opt_in = ?, email_opt_in_at = ? WHERE id = ?',
        (1 if email_opt_in else 0, _current_timestamp() if email_opt_in else None, user_id)
    )
    conn.commit()
    conn.close()


def list_opted_in_users() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, email, external_id FROM users WHERE email_opt_in = 1 AND email IS NOT NULL')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_contact(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, email, email_opt_in FROM users WHERE id = ?', (user_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


# -------------------- Categories -------------------- #

def upsert_category(name: str, category_id: Optional[int] = None, position: Optional[int] = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    if category_id:
        if position is not None:
            cur.execute('UPDATE categories SET name = ?, position = ? WHERE id = ?', (name, position, category_id))
        else:
            cur.execute('UPDATE categories SET name = ? WHERE id = ?', (name, category_id))
        cat_id = category_id
    else:
        if position is None:
            cur.execute('SELECT COALESCE(MAX(position), 0) + 1 FROM categories')
            position = cur.fetchone()[0]
        cur.execute('INSERT INTO categories (name, position) VALUES (?, ?)', (name, position))
        cat_id = cur.lastrowid
    conn.commit()
    conn.close()
    return cat_id


def list_categories() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, position FROM categories ORDER BY position, name')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_category(category_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, position FROM categories WHERE id = ?', (category_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_category(category_id: int) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM categories WHERE id = ?', (category_id,))
    conn.commit()
    conn.close()


def user_category_overview() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        SELECT c.id, c.name, c.position,
               COUNT(p.id) AS product_count,
               MAX(CASE WHEN d.image_url IS NOT NULL AND d.image_url != '' THEN d.image_url END) AS hero_image
        FROM categories c
        LEFT JOIN products p ON LOWER(p.category) = LOWER(c.name)
        LEFT JOIN product_details d ON d.product_id = p.id
        GROUP BY c.id, c.name, c.position
        ORDER BY c.position, c.name
        '''
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# -------------------- Products -------------------- #

def add_product(payload: Dict[str, Any]) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO products (name, category) VALUES (?, ?)', (payload['name'], payload.get('category')))
    pid = cur.lastrowid
    cur.execute(
        'INSERT OR REPLACE INTO product_details (product_id, description, price, image_url, inventory) VALUES (?, ?, ?, ?, ?)',
        (pid, payload.get('description'), payload.get('price', 0), payload.get('image_url'), payload.get('inventory', 0))
    )
    conn.commit()
    conn.close()
    return pid


def update_product(product_id: int, payload: Dict[str, Any]) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('UPDATE products SET name = ?, category = ? WHERE id = ?', (payload['name'], payload.get('category'), product_id))
    cur.execute(
        '''
        INSERT INTO product_details (product_id, description, price, image_url, inventory) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
            description=excluded.description,
            price=excluded.price,
            image_url=excluded.image_url,
            inventory=excluded.inventory
        ''',
        (product_id, payload.get('description'), payload.get('price', 0), payload.get('image_url'), payload.get('inventory', 0))
    )
    conn.commit()
    conn.close()


def delete_product(product_id: int) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()


def list_products(category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    clauses = []
    params: List[Any] = []
    if category:
        clauses.append('p.category = ?')
        params.append(category)
    if search:
        clauses.append('LOWER(p.name) LIKE ?')
        params.append(f"%{search.lower()}%")
    where_clause = f"WHERE {' AND '.join(clauses)}" if clauses else ''
    query = f'''
        SELECT p.id, p.name, p.category, d.description, d.price, d.image_url, d.inventory
        FROM products p
        LEFT JOIN product_details d ON d.product_id = p.id
        {where_clause}
        ORDER BY p.name
    '''
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_product(product_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT p.id, p.name, p.category, d.description, d.price, d.image_url, d.inventory
        FROM products p
        LEFT JOIN product_details d ON d.product_id = p.id
        WHERE p.id = ?
    ''', (product_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def list_product_sizes(product_id: int) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'SELECT id, product_id, size, quantity FROM product_sizes WHERE product_id = ? ORDER BY size',
        (product_id,)
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def replace_product_sizes(product_id: int, size_inventory: Dict[str, int]) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM product_sizes WHERE product_id = ?', (product_id,))
    for size, quantity in size_inventory.items():
        cur.execute(
            'INSERT INTO product_sizes (product_id, size, quantity) VALUES (?, ?, ?)',
            (product_id, size, quantity)
        )
    conn.commit()
    conn.close()


def category_product_highlights(category: str, limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        SELECT p.id, p.name, p.category,
               d.description, d.price, d.image_url, d.inventory,
               IFNULL(rv.avg_rating, 0) AS average_rating,
               IFNULL(rv.total_reviews, 0) AS total_reviews,
               IFNULL(iv.total_interactions, 0) AS total_interactions
        FROM products p
        LEFT JOIN product_details d ON d.product_id = p.id
        LEFT JOIN (
            SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
            FROM reviews
            GROUP BY product_id
        ) rv ON rv.product_id = p.id
        LEFT JOIN (
            SELECT product_id, COUNT(*) AS total_interactions
            FROM interactions
            GROUP BY product_id
        ) iv ON iv.product_id = p.id
        WHERE p.category = ?
        ORDER BY COALESCE(d.price, 0) DESC, p.name
        LIMIT ?
        ''',
        (category, limit)
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def product_review_summary(product_id: int) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'SELECT IFNULL(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE product_id = ?',
        (product_id,)
    )
    row = cur.fetchone() or {'average_rating': 0, 'total_reviews': 0}
    conn.close()
    return dict(row)


def product_interaction_summary(product_id: int) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN interaction_type = 'view' THEN 1 ELSE 0 END) AS views,
            SUM(CASE WHEN interaction_type = 'like' THEN 1 ELSE 0 END) AS likes,
            SUM(CASE WHEN interaction_type = 'add_to_cart' THEN 1 ELSE 0 END) AS adds,
            MAX(timestamp) AS last_interaction_at
        FROM interactions
        WHERE product_id = ?
        ''',
        (product_id,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return {'total': 0, 'views': 0, 'likes': 0, 'adds': 0, 'last_interaction_at': None}
    as_dict = dict(row)
    for key in ('total', 'views', 'likes', 'adds'):
        as_dict[key] = int(as_dict.get(key) or 0)
    return as_dict


def product_detail_payload(product_id: int) -> Optional[Dict[str, Any]]:
    product = get_product(product_id)
    if not product:
        return None
    sizes = list_product_sizes(product_id)
    review_summary = product_review_summary(product_id)
    reviews = list_reviews(product_id)
    interactions = product_interaction_summary(product_id)
    return {
        'product': product,
        'sizes': sizes,
        'review_summary': review_summary,
        'reviews': reviews,
        'interaction_summary': interactions,
    }


def reserve_product_inventory(product_id: int, quantity: int, size: Optional[str] = None) -> Dict[str, Any]:
    if quantity <= 0:
        raise ValueError('quantity_must_be_positive')

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute('BEGIN IMMEDIATE')
        cur.execute('SELECT inventory FROM product_details WHERE product_id = ?', (product_id,))
        detail = cur.fetchone()
        if not detail:
            raise ValueError('product_not_found')
        current_inventory = int(detail['inventory'] or 0)
        if current_inventory < quantity:
            raise ValueError('insufficient_inventory')

        new_inventory = current_inventory - quantity
        cur.execute('UPDATE product_details SET inventory = ? WHERE product_id = ?', (new_inventory, product_id))

        size_record: Optional[Dict[str, Any]] = None
        if size:
            cur.execute('SELECT quantity FROM product_sizes WHERE product_id = ? AND size = ?', (product_id, size))
            row = cur.fetchone()
            if not row:
                raise ValueError('size_not_found')
            size_inventory = int(row['quantity'] or 0)
            if size_inventory < quantity:
                raise ValueError('insufficient_size_inventory')
            updated_size_inventory = size_inventory - quantity
            cur.execute(
                'UPDATE product_sizes SET quantity = ? WHERE product_id = ? AND size = ?',
                (updated_size_inventory, product_id, size)
            )
            size_record = {'size': size, 'quantity': updated_size_inventory}

        cur.execute('SELECT size, quantity FROM product_sizes WHERE product_id = ? ORDER BY size', (product_id,))
        sizes = [dict(row) for row in cur.fetchall()]
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    return {
        'inventory': new_inventory,
        'sizes': sizes,
        'updated_size': size_record,
    }


# -------------------- Reviews -------------------- #

def add_review(user_id: int, product_id: int, rating: int, comment: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)', (user_id, product_id, rating, comment))
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid


def list_reviews(product_id: int) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, user_id, product_id, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC', (product_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# -------------------- Cart -------------------- #

def add_cart_item(user_id: int, product_id: int, quantity: int = 1) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', (user_id, product_id))
    existing = cur.fetchone()
    if existing:
        new_qty = existing['quantity'] + quantity
        cur.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', (new_qty, existing['id']))
        item_id = existing['id']
    else:
        cur.execute('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', (user_id, product_id, quantity))
        item_id = cur.lastrowid
    conn.commit()
    conn.close()
    return item_id


def list_cart_items(user_id: int) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT ci.id, ci.user_id, ci.product_id, ci.quantity,
               p.name as product_name, d.price, d.image_url
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN product_details d ON d.product_id = p.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
    ''', (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_cart_item(item_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT ci.id, ci.user_id, ci.product_id, ci.quantity,
               p.name as product_name, d.price, d.image_url
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN product_details d ON d.product_id = p.id
        WHERE ci.id = ?
    ''', (item_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_cart_item(item_id: int) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM cart_items WHERE id = ?', (item_id,))
    conn.commit()
    conn.close()


# -------------------- Interactions -------------------- #

def add_interaction(user_id: int, product_id: int, interaction_type: str = 'view', weight: float = 1.0, rating: int = 1, metadata: Optional[str] = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO interactions (user_id, product_id, interaction_type, weight, rating, metadata) VALUES (?, ?, ?, ?, ?, ?)',
        (user_id, product_id, interaction_type, weight, rating, metadata)
    )
    conn.commit()
    iid = cur.lastrowid
    conn.close()
    return iid


def get_interactions() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT user_id, product_id, interaction_type, weight, rating, metadata, timestamp FROM interactions')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def list_interactions_for_graph() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT id, user_id, product_id, interaction_type, weight, metadata, timestamp
        FROM interactions
        ORDER BY timestamp DESC
    ''')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def list_interactions_detailed(limit: int = 200) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT i.id, i.user_id, u.name AS user_name,
               i.product_id, p.name AS product_name, p.category,
               i.interaction_type, i.weight, i.metadata, i.timestamp
        FROM interactions i
        LEFT JOIN users u ON u.id = i.user_id
        LEFT JOIN products p ON p.id = i.product_id
        ORDER BY i.timestamp DESC
        LIMIT ?
    ''', (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def reorder_categories(order: Sequence[int]) -> None:
    conn = get_conn()
    cur = conn.cursor()
    for idx, cat_id in enumerate(order, start=1):
        cur.execute('UPDATE categories SET position = ? WHERE id = ?', (idx, cat_id))
    conn.commit()
    conn.close()


def interaction_counts_by_product(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT p.id AS product_id,
               p.name AS product_name,
               p.category,
               COUNT(i.id) AS interactions,
               IFNULL(SUM(i.weight), 0) AS weight_sum
        FROM products p
        LEFT JOIN interactions i ON i.product_id = p.id
        GROUP BY p.id, p.name, p.category
        ORDER BY interactions DESC, weight_sum DESC
        LIMIT ?
    ''', (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def graph_export_snapshot(limit_nodes: int = 1000) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT i.id, i.user_id, u.name AS user_name,
               i.product_id, p.name AS product_name, p.category,
               i.interaction_type, i.weight
        FROM interactions i
        LEFT JOIN users u ON u.id = i.user_id
        LEFT JOIN products p ON p.id = i.product_id
        ORDER BY i.timestamp DESC
        LIMIT ?
    ''', (limit_nodes,))
    rows = cur.fetchall()
    conn.close()

    user_nodes = {}
    product_nodes = {}
    edges = []

    for row in rows:
        row = dict(row)
        uid = row['user_id']
        pid = row['product_id']
        if uid not in user_nodes:
            user_nodes[uid] = {
                'id': f'user:{uid}',
                'label': row.get('user_name') or f'User {uid}',
                'group': 'user'
            }
        if pid not in product_nodes:
            product_nodes[pid] = {
                'id': f'product:{pid}',
                'label': row.get('product_name') or f'Product {pid}',
                'group': 'product',
                'meta': {'category': row.get('category')}
            }
        edges.append({
            'id': f"edge:{row['id']}",
            'from': f'user:{uid}',
            'to': f'product:{pid}',
            'weight': row.get('weight', 1.0),
            'label': row.get('interaction_type', 'view')
        })

    totals = {
        'users': len(user_nodes),
        'products': len(product_nodes),
        'interactions': len(edges)
    }

    top_products = interaction_counts_by_product(limit=8)

    nodes = list(user_nodes.values()) + list(product_nodes.values())
    return {
        'totals': totals,
        'top_products': top_products,
        'nodes': nodes,
        'edges': edges
    }


# -------------------- Analytics Helpers -------------------- #

def product_popularity(product_id: int) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) as count FROM interactions WHERE product_id = ?', (product_id,))
    count = cur.fetchone()['count']
    cur.execute('SELECT IFNULL(AVG(rating), 0) as avg_rating FROM reviews WHERE product_id = ?', (product_id,))
    avg_rating = cur.fetchone()['avg_rating']
    conn.close()
    return {'interaction_count': count, 'average_rating': avg_rating}


def category_snapshot() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT p.category as name, COUNT(p.id) as total_products
        FROM products p
        GROUP BY p.category
        ORDER BY p.category
    ''')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# -------------------- Seeding -------------------- #

def bulk_insert_products(items: List[Dict[str, Any]]) -> None:
    conn = get_conn()
    cur = conn.cursor()
    for item in items:
        cur.execute('INSERT INTO products (name, category) VALUES (?, ?)', (item['name'], item['category']))
        pid = cur.lastrowid
        cur.execute('INSERT INTO product_details (product_id, description, price, image_url, inventory) VALUES (?, ?, ?, ?, ?)',
                    (pid, item.get('description'), item.get('price', 0), item.get('image_url'), item.get('inventory', 0)))
    conn.commit()
    conn.close()


# -------------------- Admin Audit Logs -------------------- #

def insert_admin_audit_log(entry: Dict[str, Any]) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        INSERT INTO admin_audit_logs (admin_id, admin_email, action, target_type, target_id, target_display, before_state, after_state, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            entry.get('admin_id'),
            entry.get('admin_email'),
            entry.get('action'),
            entry.get('target_type'),
            entry.get('target_id'),
            entry.get('target_display'),
            json.dumps(entry.get('before_state')) if entry.get('before_state') is not None else None,
            json.dumps(entry.get('after_state')) if entry.get('after_state') is not None else None,
            json.dumps(entry.get('metadata')) if entry.get('metadata') is not None else None,
        )
    )
    conn.commit()
    log_id = cur.lastrowid
    conn.close()
    return log_id


def list_admin_audit_logs(
    page: int = 1,
    per_page: int = 50,
    *,
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    admin_id: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    conn = get_conn()
    cur = conn.cursor()
    clauses: List[str] = []
    params: List[Any] = []

    if action:
        clauses.append('action = ?')
        params.append(action)
    if target_type:
        clauses.append('target_type = ?')
        params.append(target_type)
    if admin_id:
        clauses.append('admin_id = ?')
        params.append(admin_id)
    if start_date:
        clauses.append('created_at >= ?')
        params.append(start_date)
    if end_date:
        clauses.append('created_at <= ?')
        params.append(end_date)
    if search:
        like = f'%{search.lower()}%'
        clauses.append('(LOWER(target_display) LIKE ? OR LOWER(action) LIKE ? OR LOWER(target_type) LIKE ? OR LOWER(admin_email) LIKE ? )')
        params.extend([like, like, like, like])

    where_clause = f"WHERE {' AND '.join(clauses)}" if clauses else ''
    offset = (page - 1) * per_page

    query = f'''
        SELECT id, admin_id, admin_email, action, target_type, target_id, target_display,
               before_state, after_state, metadata, created_at
        FROM admin_audit_logs
        {where_clause}
        ORDER BY datetime(created_at) DESC
        LIMIT ? OFFSET ?
    '''
    cur.execute(query, (*params, per_page, offset))
    rows = cur.fetchall()

    count_query = f'SELECT COUNT(*) AS total FROM admin_audit_logs {where_clause}'
    cur.execute(count_query, params)
    total = cur.fetchone()['total']
    conn.close()

    records = [
        {
            **dict(row),
            'before_state': json.loads(row['before_state']) if row['before_state'] else None,
            'after_state': json.loads(row['after_state']) if row['after_state'] else None,
            'metadata': json.loads(row['metadata']) if row['metadata'] else None,
        }
        for row in rows
    ]
    return records, total


def get_admin_audit_log(log_id: int) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        SELECT id, admin_id, admin_email, action, target_type, target_id, target_display,
               before_state, after_state, metadata, created_at
        FROM admin_audit_logs
        WHERE id = ?
        ''',
        (log_id,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    data['before_state'] = json.loads(data['before_state']) if data.get('before_state') else None
    data['after_state'] = json.loads(data['after_state']) if data.get('after_state') else None
    data['metadata'] = json.loads(data['metadata']) if data.get('metadata') else None
    return data
