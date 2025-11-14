import sqlite3
from typing import List, Dict, Any
from pathlib import Path
from .db_init import DB_PATH


def get_conn(path: str | None = None):
    db = path or DB_PATH
    return sqlite3.connect(db)


def add_user(name: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO users (name) VALUES (?)', (name,))
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    return user_id


def add_product(name: str, category: str | None = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO products (name, category) VALUES (?, ?)', (name, category))
    conn.commit()
    pid = cur.lastrowid
    conn.close()
    return pid


def add_interaction(user_id: int, product_id: int, rating: int = 1) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO interactions (user_id, product_id, rating) VALUES (?, ?, ?)', (user_id, product_id, rating))
    conn.commit()
    iid = cur.lastrowid
    conn.close()
    return iid


def list_users() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name FROM users')
    rows = cur.fetchall()
    conn.close()
    return [{'id': r[0], 'name': r[1]} for r in rows]


def list_products() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id, name, category FROM products')
    rows = cur.fetchall()
    conn.close()
    return [{'id': r[0], 'name': r[1], 'category': r[2]} for r in rows]


def get_interactions() -> List[Dict[str, int]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT user_id, product_id, rating FROM interactions')
    rows = cur.fetchall()
    conn.close()
    return [{'user_id': r[0], 'product_id': r[1], 'rating': r[2]} for r in rows]


def get_user_interactions(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT product_id FROM interactions WHERE user_id = ?', (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [r[0] for r in rows]
