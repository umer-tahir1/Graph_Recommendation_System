**Graph-Based Recommendation System**

Production-style storefront that blends graph-driven recommendations, FastAPI services, and a React/Vite experience with dedicated user and admin portals.

## Repo Map

- `Backend/` – FastAPI app, SQLite schema, CRUD/data access, recommender logic, analytics endpoints, pytest suite.
- `Frontend/` – React + Vite client with protected shopping experience, graph visualizations, and full admin workspace.

## Backend

```powershell
cd Backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1   # optional but recommended
pip install -r Requirements.txt
python -c "from app import sample_data; sample_data.populate_full()"   # seed baseline data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Key endpoints

- `/products`, `/categories`, `/recommend/{user_id}` – shopper APIs used by the Products page.
- `/graph/recommendations` – Supabase-protected weighted-graph recommendations with optional debug payloads.
- `/interactions` – secure interaction logging that emits audit metadata and returns refreshed scores.
- `/admin/products`, `/admin/categories`, `/admin/interactions`, `/admin/graph/export` – CRUD + analytics powering the admin portal.

Tests

```powershell
cd Backend
pytest tests
```

### Supabase admin mocking

The admin dashboard normally calls Supabase’s service-role APIs to enumerate/manage users. During local development you can avoid those remote calls (and the need for `SUPABASE_SERVICE_ROLE_KEY`) by enabling the mock layer:

```powershell
cd Backend
$env:MOCK_SUPABASE=1
uvicorn app.main:app --reload
```

When `MOCK_SUPABASE=1` **or** `SUPABASE_SERVICE_ROLE_KEY` is unset, `/admin/users` and related endpoints return deterministic in-memory records so you can exercise the UI without touching your Supabase project. Deployments with valid credentials leave the mock disabled automatically.

## Frontend

```powershell
cd Frontend
npm install
npm run dev     # http://localhost:3000
npm run test:run
```

Highlights

- **Protected shopping flow** – users authenticate via Supabase, browse curated categories, cart items, and visualize their recommendation graphs.
- **Smart caching** – React Query caches per-product recommendations, supports optimistic likes/add-to-cart actions, and keeps UI responsive while FastAPI completes writes.
- **Admin workspace** – `/admin/*` routes gated by `AdminRoute`, featuring sidebar navigation, CRUD modals, inline product editing, reorderable categories, live interaction feed, and graph analytics/dashboard views.
- **Graph telemetry** – Admin analytics + the new graph debug panel surface interaction counts, weighted paths (Dijkstra), and top recommendations with live edge diagnostics.

## Graph Recommendations API

````powershell
curl -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>" ^
		 "http://localhost:8000/graph/recommendations?product_id=101&k=5"
````

Response

```json
{
	"product_id": 101,
	"user_id": "13ff9ef2-...",
	"requested_k": 5,
	"generated_at": "2025-11-16T18:45:12Z",
	"recommendations": [
		{
			"id": 108,
			"name": "Vertex Mechanical Keyboard",
			"category": "Accessories",
			"price": 149.0,
			"score": 1.82,
			"distance": 0.9
		}
	],
	"context": {
		"totals": { "products": 42, "edges": 118, "interactions": 624 },
		"popularity_leaders": [ { "id": 105, "name": "Helix Laptop", "score": 240 } ]
	}
}
```

Append `&debug=true` to include each recommendation’s shortest path + edge weights (admin-only). POST `/interactions` accepts `{ "product_id": 108, "action": "like" }`, stores the event, emits an audit log, and returns a short list of refreshed recommendations for optimistic UI updates.

## Recommendation Stack

- Bipartite graphs (user ↔ product) and adjacency maps for traversal.
- Collaborative filtering via Jaccard similarity + weighted interactions.
- Graph exports for visualization and admin telemetry.

Feel free to extend the schema, tune the recommender, or plug in real authentication/commerce providers—the new structure is designed for incremental production-hardening.
