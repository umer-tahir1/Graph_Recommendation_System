Frontend (React + Vite)

Run locally:

```powershell
cd frontend
npm install
# Tailwind's postinstall will build styles; if not, run:
# npx tailwindcss -i ./src/input.css -o ./src/styles.css --watch
npm run dev
```

Notes:
- The frontend expects the backend API at `http://localhost:8000` by default. To change, set `VITE_API_URL` in your environment before running (e.g. `setx VITE_API_URL "http://backend:8000"`).
- Quick interactions require selecting a user in the Users panel before buying — the UI now wires product interactions to the selected user.
