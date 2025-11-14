Frontend (React + Vite)

Run locally:

```powershell
cd frontend
npm install
npm run dev
```

Notes:
- The frontend expects the backend API at `http://localhost:8000` by default. To change, set `VITE_API_URL` in your environment before running (e.g. `setx VITE_API_URL "http://backend:8000"`).
- Quick interactions use a placeholder user id (1) for demo; you should wire proper user selection in product cards.
