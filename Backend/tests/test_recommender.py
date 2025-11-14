import pytest
from ..app import recommender


def test_jaccard():
    a = {1, 2, 3}
    b = {2, 3, 4}
    assert abs(recommender.jaccard_similarity(a, b) - 0.5) < 1e-9


def test_recommend_small():
    interactions = [
        {'user_id': 1, 'product_id': 1},
        {'user_id': 1, 'product_id': 2},
        {'user_id': 2, 'product_id': 2},
        {'user_id': 2, 'product_id': 3},
    ]
    recs = recommender.recommend_by_collab(1, interactions, top_k=5)
    # Expect product 3 recommended from user 2
    assert any(r[0] == 3 for r in recs)


def test_bfs_related():
    product_to_users = {1: {1, 2}, 2: {1}, 3: {2}}
    prod_graph = recommender.build_product_graph(product_to_users)
    rel = recommender.bfs_related_products(1, prod_graph, max_depth=2)
    assert 2 in rel or 3 in rel
