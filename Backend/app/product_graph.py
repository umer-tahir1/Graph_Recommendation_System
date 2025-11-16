"""Weighted product graph utilities for recommendation experiments.

This module keeps the implementation standalone so it can be imported by
FastAPI routers, CLI scripts, or interactive notebooks.  It models
products as graph nodes with weighted edges that capture similarity or
interaction strength, and exposes classic graph traversals plus a
small recommendation helper.
"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from heapq import heappush, heappop
from typing import Deque, Dict, Iterable, List, Optional, Tuple


@dataclass(frozen=True)
class Product:
    """Represents a single product node in the graph."""

    id: int
    name: str
    category: str
    price: float


class ProductGraph:
    """Weighted, undirected graph of products."""

    def __init__(self, products: Optional[Iterable[Product]] = None) -> None:
        self._products: Dict[int, Product] = {}
        self._adjacency: Dict[int, Dict[int, float]] = defaultdict(dict)
        if products:
            for product in products:
                self.add_product(product)

    # ------------------------------------------------------------------
    # Graph construction helpers
    # ------------------------------------------------------------------
    def add_product(self, product: Product) -> None:
        self._products[product.id] = product
        self._adjacency.setdefault(product.id, {})

    def add_edge(self, a: int, b: int, weight: float, bidirectional: bool = True) -> None:
        if a not in self._products or b not in self._products:
            raise ValueError("Both products must be registered before adding edges")
        if weight <= 0:
            raise ValueError("Edge weight must be positive")
        self._adjacency[a][b] = weight
        if bidirectional:
            self._adjacency[b][a] = weight

    def neighbors(self, product_id: int) -> Dict[int, float]:
        return self._adjacency.get(product_id, {})

    def product(self, product_id: int) -> Product:
        return self._products[product_id]

    def products(self) -> Iterable[Product]:
        return self._products.values()

    # ------------------------------------------------------------------
    # Traversal algorithms
    # ------------------------------------------------------------------
    def dfs(self, start_id: int, max_depth: Optional[int] = None) -> List[int]:
        """Depth-first traversal (returns product ids)."""

        visited: List[int] = []
        stack: List[Tuple[int, int]] = [(start_id, 0)]
        seen = {start_id}

        while stack:
            node, depth = stack.pop()
            visited.append(node)
            if max_depth is not None and depth >= max_depth:
                continue
            for nb in sorted(self.neighbors(node), reverse=True):
                if nb not in seen:
                    seen.add(nb)
                    stack.append((nb, depth + 1))
        return visited

    def bfs(self, start_id: int, max_depth: Optional[int] = None) -> List[int]:
        """Breadth-first traversal (returns product ids)."""

        order: List[int] = []
        queue: Deque[Tuple[int, int]] = deque([(start_id, 0)])
        seen = {start_id}

        while queue:
            node, depth = queue.popleft()
            order.append(node)
            if max_depth is not None and depth >= max_depth:
                continue
            for nb in sorted(self.neighbors(node)):
                if nb not in seen:
                    seen.add(nb)
                    queue.append((nb, depth + 1))
        return order

    def dijkstra(self, start_id: int) -> Dict[int, Tuple[float, List[int]]]:
        """Shortest weighted paths from start to every reachable product."""

        distances: Dict[int, float] = {start_id: 0.0}
        parents: Dict[int, Optional[int]] = {start_id: None}
        heap: List[Tuple[float, int]] = [(0.0, start_id)]

        while heap:
            distance, node = heappop(heap)
            if distance > distances.get(node, float("inf")):
                continue
            for neighbor, weight in self.neighbors(node).items():
                next_distance = distance + weight
                if next_distance < distances.get(neighbor, float("inf")):
                    distances[neighbor] = next_distance
                    parents[neighbor] = node
                    heappush(heap, (next_distance, neighbor))

        paths: Dict[int, List[int]] = {}
        for node in distances:
            path: List[int] = []
            current: Optional[int] = node
            while current is not None:
                path.append(current)
                current = parents[current]
            paths[node] = list(reversed(path))

        return {node: (distances[node], paths[node]) for node in distances}

    # ------------------------------------------------------------------
    # Recommendation helper
    # ------------------------------------------------------------------
    def recommend_top_k(
        self,
        seed_product: int,
        k: int = 5,
        popularity: Optional[Dict[int, int]] = None,
    ) -> List[Tuple[Product, float]]:
        """Score reachable products using inverse distance + popularity."""

        shortest_paths = self.dijkstra(seed_product)
        if popularity is None:
            popularity = defaultdict(int)

        max_pop = max(popularity.values(), default=1)
        scores: List[Tuple[float, Product]] = []

        for product_id, (distance, _path) in shortest_paths.items():
            if product_id == seed_product:
                continue
            inverse_distance = 1.0 / (1.0 + distance)
            popularity_bonus = 1.0 + (popularity.get(product_id, 0) / max_pop)
            edge_weight_sum = sum(self.neighbors(product_id).values()) or 1.0
            score = inverse_distance * popularity_bonus * edge_weight_sum
            scores.append((score, self.product(product_id)))

        scores.sort(key=lambda item: item[0], reverse=True)
        return [(product, score) for score, product in scores[:k]]


# ----------------------------------------------------------------------
# Sample dataset + utility
# ----------------------------------------------------------------------

def build_sample_graph() -> Tuple[ProductGraph, Dict[int, int]]:
    products = [
        Product(101, "Aurora Headphones", "Audio", 199.0),
        Product(102, "Pulse Earbuds", "Audio", 129.0),
        Product(103, "Nebula Smartwatch", "Wearables", 249.0),
        Product(104, "Lumen Fitness Band", "Wearables", 149.0),
        Product(105, "Helix Laptop", "Computing", 1399.0),
        Product(106, "Photon Ultrabook", "Computing", 1699.0),
        Product(107, "Orbit Gaming Mouse", "Accessories", 89.0),
        Product(108, "Vertex Mechanical Keyboard", "Accessories", 149.0),
    ]

    edges = [
        (101, 102, 0.4),
        (101, 103, 0.8),
        (101, 104, 0.7),
        (102, 104, 0.5),
        (103, 104, 0.3),
        (103, 105, 1.2),
        (104, 107, 0.6),
        (105, 106, 0.9),
        (105, 108, 0.4),
        (106, 108, 0.7),
        (107, 108, 0.5),
    ]

    popularity = {
        101: 240,
        102: 180,
        103: 320,
        104: 210,
        105: 150,
        106: 120,
        107: 260,
        108: 280,
    }

    graph = ProductGraph(products)
    for src, dst, weight in edges:
        graph.add_edge(src, dst, weight)

    return graph, popularity


def _demo() -> None:
    graph, popularity = build_sample_graph()
    seed = 101

    print("DFS from 101:", graph.dfs(seed))
    print("BFS from 101:", graph.bfs(seed))
    distances = graph.dijkstra(seed)
    print("Shortest paths (distance, path):")
    for pid, (dist, path) in distances.items():
        print(f"  -> {pid}: dist={dist:.2f}, path={path}")

    print("\nTop-5 related products: ")
    for product, score in graph.recommend_top_k(seed_product=seed, k=5, popularity=popularity):
        print(f"  {product.name:28s} score={score:.3f}")


if __name__ == "__main__":
    _demo()
