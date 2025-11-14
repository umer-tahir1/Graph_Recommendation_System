from collections import defaultdict, deque
from typing import Dict, Set, List, Tuple
import heapq
import time

# Algorithms used:
# - Graph represented as adjacency lists (dict of sets)
# - BFS traversal on product graph
# - Hashing via dicts/sets for fast membership
# - Priority queue (heapq) to select top-K
# - Sorting for final ranking
# - Collaborative filtering using Jaccard similarity


def build_bipartite_graph(interactions: List[Dict[str, int]]):
    user_to_products: Dict[int, Set[int]] = defaultdict(set)
    product_to_users: Dict[int, Set[int]] = defaultdict(set)
    for it in interactions:
        u = it['user_id']
        p = it['product_id']
        user_to_products[u].add(p)
        product_to_users[p].add(u)
    return user_to_products, product_to_users


def jaccard_similarity(set_a: Set[int], set_b: Set[int]) -> float:
    if not set_a and not set_b:
        return 0.0
    inter = len(set_a & set_b)
    union = len(set_a | set_b)
    return inter / union if union else 0.0


def recommend_by_collab(user_id: int, interactions: List[Dict[str, int]], top_k: int = 10) -> List[Tuple[int, float]]:
    user_to_products, product_to_users = build_bipartite_graph(interactions)
    target_products = user_to_products.get(user_id, set())

    scores: Dict[int, float] = defaultdict(float)

    # For each other user, compute Jaccard against target user
    for other_user, other_products in user_to_products.items():
        if other_user == user_id:
            continue
        sim = jaccard_similarity(target_products, other_products)
        if sim <= 0:
            continue
        # For each product the other user has that target doesn't, add sim
        for prod in other_products:
            if prod not in target_products:
                scores[prod] += sim

    # Use heapq to get top_k
    heap = []
    for prod, sc in scores.items():
        heapq.heappush(heap, (-sc, prod))

    top = []
    while heap and len(top) < top_k:
        sc, prod = heapq.heappop(heap)
        top.append((prod, -sc))

    # Sort final list by score desc, product id asc for tie-breaking
    top.sort(key=lambda x: (-x[1], x[0]))
    return top


def build_product_graph(product_to_users: Dict[int, Set[int]]) -> Dict[int, Set[int]]:
    # Build product graph: connect products that share at least one user
    prod_graph: Dict[int, Set[int]] = defaultdict(set)
    products = list(product_to_users.keys())
    for p in products:
        users = product_to_users[p]
        for u in users:
            # for all other products that user purchased, add edge
            for q in product_to_users:
                if q == p:
                    continue
                if u in product_to_users[q]:
                    prod_graph[p].add(q)
    return prod_graph


def bfs_related_products(start_prod: int, product_graph: Dict[int, Set[int]], max_depth: int = 2) -> List[int]:
    visited = set([start_prod])
    q = deque([(start_prod, 0)])
    related = []
    while q:
        node, depth = q.popleft()
        if depth >= 1:
            related.append(node)
        if depth >= max_depth:
            continue
        for nb in product_graph.get(node, set()):
            if nb not in visited:
                visited.add(nb)
                q.append((nb, depth + 1))
    return related


def measure_runtime(func, args=(), runs=3):
    times = []
    for _ in range(runs):
        t0 = time.perf_counter()
        func(*args)
        t1 = time.perf_counter()
        times.append(t1 - t0)
    avg = sum(times) / len(times)
    return avg, times
