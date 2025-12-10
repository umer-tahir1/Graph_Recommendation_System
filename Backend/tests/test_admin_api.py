import pytest
from fastapi.testclient import TestClient

from ..app import crud, db_init, email_service
from ..app.main import app
from ..app.auth import require_admin, require_user, AdminAuthContext, UserAuthContext


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
    user_ctx = UserAuthContext(
        user_id='test-user',
        email='user@example.com',
        roles=['user'],
        token='user-token',
        profile={'id': 'test-user', 'email': 'user@example.com'}
    )
    app.dependency_overrides[require_admin] = lambda: admin_ctx
    app.dependency_overrides[require_user] = lambda: user_ctx
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.pop(require_admin, None)
    app.dependency_overrides.pop(require_user, None)


def seed_category(name: str):
    return crud.upsert_category(name)

# Seed categories specifies
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

# Crud Operations check
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

# Reordering operation check
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

# Graph endpoints check
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


def test_email_preference_flow(client):
    initial = client.get('/me/email-preference')
    assert initial.status_code == 200
    assert initial.json()['email_opt_in'] is False

    update = client.put('/me/email-preference', json={'email_opt_in': True})
    assert update.status_code == 200
    assert update.json()['email_opt_in'] is True

    refreshed = client.get('/me/email-preference')
    assert refreshed.status_code == 200
    assert refreshed.json()['email_opt_in'] is True

# email endpoints check
def test_admin_marketing_email_broadcast(client, monkeypatch):
    alice_id = crud.add_user('Alice', email='alice@example.com', email_opt_in=True)
    captured = {}

    def fake_broadcast(subject, content, *, target_user_ids=None):
        captured['subject'] = subject
        captured['content'] = content
        captured['targets'] = target_user_ids
        return {'sent': 1, 'mocked': 0, 'skipped': 0, 'failed': 0, 'total': 1}

    monkeypatch.setattr(email_service, 'broadcast_marketing_email', fake_broadcast)

    resp = client.post(
        '/admin/marketing/email',
        json={'subject': 'Winter Sale', 'content': 'Up to 50% off', 'user_ids': [alice_id]},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert payload['summary']['sent'] == 1
    assert captured['subject'] == 'Winter Sale'
    assert captured['targets'] == [alice_id]

    audit_payload = client.get('/admin/audit').json()
    assert any(entry['action'] == 'marketing.email' for entry in audit_payload['items'])

# test_admin_recommendation_email_broadcast check
def test_admin_recommendation_email_broadcast(client, monkeypatch):
    seed_category('Accessories')
    pid_anchor = crud.add_product({
        'name': 'Anchor Phone',
        'category': 'Accessories',
        'description': 'Flagship device',
        'price': 799.0,
        'image_url': 'https://example.com/anchor.png',
        'inventory': 10,
    })
    pid_alt = crud.add_product({
        'name': 'Graph Earbuds',
        'category': 'Accessories',
        'description': 'Wireless audio',
        'price': 199.0,
        'image_url': 'https://example.com/earbuds.png',
        'inventory': 25,
    })
    pid_extra = crud.add_product({
        'name': 'Neon Charger',
        'category': 'Accessories',
        'description': 'Fast charging',
        'price': 49.0,
        'image_url': 'https://example.com/charger.png',
        'inventory': 50,
    })

    target_id = crud.add_user('Target User', email='target@example.com', email_opt_in=True)
    peer_one = crud.add_user('Peer One', email='peer1@example.com', email_opt_in=True)
    peer_two = crud.add_user('Peer Two', email='peer2@example.com', email_opt_in=True)

    crud.add_interaction(target_id, pid_anchor, 'view', 1.0)
    crud.add_interaction(peer_one, pid_anchor, 'view', 1.0)
    crud.add_interaction(peer_one, pid_alt, 'view', 1.0)
    crud.add_interaction(peer_two, pid_anchor, 'view', 1.0)
    crud.add_interaction(peer_two, pid_extra, 'view', 1.0)

    sent_messages = []

    def fake_deliver(recipient, subject, content):
        sent_messages.append({'recipient': recipient, 'subject': subject, 'content': content})

    monkeypatch.setattr(email_service, '_deliver_email', fake_deliver)
    monkeypatch.setattr(email_service, 'SMTP_HOST', 'localhost')
    monkeypatch.setattr(email_service, 'SMTP_FROM', 'noreply@example.com')
    monkeypatch.setattr(email_service, 'SMTP_USE_TLS', False)

    resp = client.post(
        '/admin/marketing/recommendations',
        json={'user_ids': [target_id], 'limit': 2},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert payload['summary']['sent'] == 1
    assert sent_messages, 'expected at least one email'
    assert 'Graph Earbuds' in sent_messages[0]['content'] or 'Neon Charger' in sent_messages[0]['content']

    audit_payload = client.get('/admin/audit').json()
    assert any(entry['action'] == 'marketing.email.recommendations' for entry in audit_payload['items'])

# Portal Flow check
def test_user_portal_category_and_detail_flow(client):
    head_cat = seed_category('Headphones')
    assert head_cat > 0
    pid, payload = seed_product('Headphones')
    crud.replace_product_sizes(pid, {'M': 3, 'L': 2})
    reviewer = crud.add_user('Listener')
    crud.add_review(reviewer, pid, 5, 'Immersive soundscape')
    crud.add_interaction(reviewer, pid, 'view', 1.0)

    categories_resp = client.get('/user/categories')
    assert categories_resp.status_code == 200
    categories = categories_resp.json()
    assert any(cat['slug'] == 'headphones' and cat['product_count'] == 1 for cat in categories)

    listing_resp = client.get('/user/categories/headphones')
    assert listing_resp.status_code == 200
    listing = listing_resp.json()
    assert listing['category'] == 'Headphones'
    assert len(listing['products']) == 1
    assert listing['products'][0]['name'] == payload['name']

    detail_resp = client.get(f'/user/products/{pid}/detail')
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail['product']['name'] == payload['name']
    assert detail['review_summary']['total_reviews'] == 1
    assert detail['interaction_summary']['views'] >= 1
    assert any(size['size'] == 'M' for size in detail['sizes'])
    assert detail['graph']['nodes'], 'expected product graph to include at least the seed node'
