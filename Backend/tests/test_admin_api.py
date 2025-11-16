import pytest
from fastapi.testclient import TestClient

from ..app import crud, db_init
from ..app.main import app
from ..app.auth import require_admin, AdminAuthContext


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / 'admin.db'
    db_init.init_db(str(db_path))
    monkeypatch.setattr(crud, 'DB_PATH', str(db_path))
    admin_ctx = AdminAuthContext(
        user_id='test-admin',
        email='admin@example.com',
        roles=['admin'],
        token='test-token',
        profile={'id': 'test-admin', 'email': 'admin@example.com'}
    )
    app.dependency_overrides[require_admin] = lambda: admin_ctx
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.pop(require_admin, None)


def seed_category(name: str):
    return crud.upsert_category(name)


def seed_product(category: str):
    payload = {
        'name': 'Test Device',
        'category': category,
        'description': 'Spec sheet',
        'price': 123.45,
        'image_url': 'https://example.com/device.png',
        'inventory': 5,
    }
    return crud.add_product(payload), payload


def test_admin_product_crud_flow(client):
    cat_id = seed_category('Headphones')
    assert cat_id > 0
    payload = {
        'name': 'Graph Sonic',
        'category': 'Headphones',
        'description': 'Immersive audio',
        'price': 249.99,
        'image_url': 'https://example.com/headphones.png',
        'inventory': 15
    }

    create_resp = client.post('/admin/products', json=payload)
    assert create_resp.status_code == 200
    product_id = create_resp.json()['id']

    update_payload = {**payload, 'id': product_id, 'price': 199.0}
    update_resp = client.put(f'/admin/products/{product_id}', json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()['price'] == 199.0

    delete_resp = client.delete(f'/admin/products/{product_id}')
    assert delete_resp.status_code == 200

    remaining = client.get('/products').json()
    assert all(p['id'] != product_id for p in remaining)

    audit_payload = client.get('/admin/audit').json()
    actions = [entry['action'] for entry in audit_payload['items']]
    assert 'product.create' in actions
    assert 'product.update' in actions
    assert 'product.delete' in actions


def test_category_reorder(client):
    ids = [seed_category(name) for name in ['Headphones', 'Mobiles', 'Computers']]
    cats_before = client.get('/categories').json()
    assert [c['name'] for c in cats_before] == ['Headphones', 'Mobiles', 'Computers']

    reorder_payload = {'ids': ids[::-1]}
    cats_after = client.put('/admin/categories/order', json=reorder_payload).json()
    assert [c['name'] for c in cats_after] == ['Computers', 'Mobiles', 'Headphones']
    assert [c['position'] for c in cats_after] == [1, 2, 3]

    audit_payload = client.get('/admin/audit').json()
    assert any(entry['action'] == 'category.reorder' for entry in audit_payload['items'])


def test_admin_graph_endpoints(client):
    seed_category('Headphones')
    pid, payload = seed_product('Headphones')
    uid = crud.add_user('Alice')
    crud.add_interaction(uid, pid, 'view', 1.0)
    crud.add_interaction(uid, pid, 'add_to_cart', 1.6)

    interactions_resp = client.get('/admin/interactions?limit=20')
    assert interactions_resp.status_code == 200
    data = interactions_resp.json()
    assert len(data) >= 2
    assert data[0]['product_name'] == payload['name']

    graph_resp = client.get('/admin/graph/export')
    assert graph_resp.status_code == 200
    graph = graph_resp.json()
    assert graph['totals']['interactions'] >= 2
    assert len(graph['nodes']) >= 2
    assert any(product['product_id'] == pid for product in graph['top_products'])
