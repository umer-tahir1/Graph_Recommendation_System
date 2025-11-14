import random
import time
import os
import csv
from pathlib import Path

from recommender import recommend_by_collab, build_bipartite_graph, build_product_graph, bfs_related_products, measure_runtime


RESULTS_DIR = Path(__file__).resolve().parents[0] / '..' / 'benchmarks'
RESULTS_DIR = RESULTS_DIR.resolve()
os.makedirs(RESULTS_DIR, exist_ok=True)


def generate_synthetic_interactions(num_users: int, num_products: int, num_interactions: int, seed: int = 42):
    random.seed(seed)
    interactions = []
    for _ in range(num_interactions):
        u = random.randint(1, num_users)
        p = random.randint(1, num_products)
        interactions.append({'user_id': u, 'product_id': p, 'rating': 1})
    return interactions


def run_benchmarks(sizes=(10**3, 10**4, 10**5), runs=3):
    # We'll use roughly: num_users = N/10, num_products = N/10, interactions = N
    rows = []
    for N in sizes:
        num_interactions = int(N)
        num_users = max(10, N // 10)
        num_products = max(10, N // 10)

        print(f"\nBenchmarking N={N} (users={num_users}, products={num_products}, interactions={num_interactions})")
        interactions = generate_synthetic_interactions(num_users, num_products, num_interactions, seed=123)

        # measure building bipartite graph
        t_build_bip, tb_times = measure_runtime(build_bipartite_graph, args=(interactions,), runs=runs)

        # prepare product_to_users for product graph build
        user_to_products, product_to_users = build_bipartite_graph(interactions)

        t_build_prodgraph, tp_times = measure_runtime(build_product_graph, args=(product_to_users,), runs=runs)

        # pick a sample user and product for recommendation and BFS
        sample_user = random.randint(1, num_users)
        sample_product = random.randint(1, num_products)

        # recommend_by_collab runtime
        t_reco, tr_times = measure_runtime(recommend_by_collab, args=(sample_user, interactions, 10), runs=runs)

        # bfs_related_products runtime (using product graph)
        prod_graph = build_product_graph(product_to_users)
        t_bfs, tbfs_times = measure_runtime(bfs_related_products, args=(sample_product, prod_graph, 2), runs=runs)

        row = {
            'N': N,
            'num_users': num_users,
            'num_products': num_products,
            'interactions': num_interactions,
            'build_bip_avg_s': t_build_bip,
            'build_product_graph_avg_s': t_build_prodgraph,
            'recommend_by_collab_avg_s': t_reco,
            'bfs_related_products_avg_s': t_bfs,
        }
        rows.append(row)
        print(f"Results N={N}: build_bip_avg={t_build_bip:.6f}s, build_prodgraph_avg={t_build_prodgraph:.6f}s, recommend_avg={t_reco:.6f}s, bfs_avg={t_bfs:.6f}s")

    # write CSV
    out_file = RESULTS_DIR / f"results_{int(time.time())}.csv"
    with open(out_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print('\nBenchmark complete. Results written to:', out_file)
    return out_file


if __name__ == '__main__':
    # default sizes are smaller on developer machines — but course requires N up to 1e5 where applicable
    sizes = (10**3, 10**4, 10**5)
    run_benchmarks(sizes=sizes, runs=3)
