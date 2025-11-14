**Graph-Based Recommendation System**

This workspace contains a prototype e-commerce recommendation system that demonstrates core DSA techniques applied to recommender design (graphs, traversal, hashing, priority queues, sorting, and collaborative filtering using Jaccard similarity).

Structure:
- `backend/` - FastAPI backend, SQLite DB, recommender algorithms, sample-data and tests
- `frontend/` - Minimal React frontend stub to demo API calls

Quick start (backend):
1. Open a PowerShell terminal.
2. (Optional) Create and activate a Python 3.10+ virtual environment:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

3. Install backend dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

4. Initialize the SQLite DB and populate small sample data:

```powershell
python -c "from app import sample_data; sample_data.populate_small()"
```

5. Run the API server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Try the main endpoints with your browser or `curl`:
- `GET http://localhost:8000/`  (root)
- `GET http://localhost:8000/users`
- `GET http://localhost:8000/products`
- `GET http://localhost:8000/recommend/1?k=5`

Notes:
- The recommender implements:
	- Graph adjacency lists (user->products, product->users)
	- BFS traversal on product graph for related items
	- Hashing via Python `dict` and `set` for fast membership ops
	- Priority queue (`heapq`) and sorting for top-K selection
	- Collaborative filtering using Jaccard similarity
- Tests are in `backend/tests` (run with `pytest backend/tests`).
