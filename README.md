# Bolero Dashboard Backend (starter)

Minimal TypeScript Node backend that polls a Riedel Bolero device REST endpoints and merges beltpack config + runtime information into a single view suitable for a dashboard.

## Quickstart
1. Copy `.env.example` to `.env` and set `BOLERO_HOST`, `BOLERO_USER`, `BOLERO_PASS`.
2. npm install
3. npm run dev
4. GET `http://localhost:3000/api/status`

The server also starts a Socket.IO WebSocket server. Clients can connect and listen for `bolero:update` events which emit the latest merged beltpack view array.

If `BOLERO_HOST` is not set, the backend will run in **dev mode** and use the sample JSON files in `src/sampleData/` so you can run the server and see socket events without a live Bolero device.

Example client (browser):

```js
const socket = io('http://localhost:3000');
socket.on('bolero:update', (data) => console.log('update', data));
```

Environment variables:
- `POLL_FAST_MS` (ms) — fast poll interval, defaults to 5000
- `POLL_SLOW_MS` (ms) — slow poll interval, defaults to 30000
- `CACHE_TTL_MS` (ms) — cached data TTL for in-memory/Redis cache, defaults to 10000
- `REDIS_URL` — optional URL to use Redis as cache backend (if not set, in-memory cache is used)

Frontend (basic React dashboard)

1. cd frontend && npm install
2. npm run dev
3. Open `http://localhost:5173` (Vite) — UI proxies `/api` to backend on `localhost:3000` and receives `bolero:update` via Socket.IO.

## CLI
- `npm run cli` will run a single fetch and print merged beltpack views.

## Notes
- Uses Basic auth to the Bolero device; keep credentials secure and use environment variables or a vault.
- `/rest/bp` contains configs; `/rest/nodeStatus` contains runtime battery/signal and which node a BP is attached to; `/rest/nodeConfig` contains antenna metadata.

## Development
- Tests: `npm test` (Jest + ts-jest)
- Build: `npm run build`
- Docker: `docker-compose up --build` (set environment variables)

## CI
A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push / PR against `main` and:
- Installs backend deps, builds TypeScript, and runs backend tests
- Builds the frontend

You can customize the workflow to publish artifacts, run E2E tests, or deploy to a hosting provider.

## Frontend deployment
- The frontend is a Vite React app in `frontend/` that proxies `/api` to `http://localhost:3000` during development.
- To build for production: `cd frontend && npm run build` — output is in `frontend/dist`.
- Serve the built frontend with any static server or integrate via a reverse proxy (nginx) to proxy API requests to the backend.

## Health & monitoring
- The backend exposes `/health` which returns a JSON with `status: 'ok'`, `lastUpdate` (timestamp of last successful poll), and `lastError` (if any).
- The poller implements retry/backoff and logs warnings on retry attempts; add a logging/metrics stack (prometheus, Grafana) for production observability.

## End-to-end tests (Playwright)
- E2E tests live in `tests/e2e/` and assert the backend emits `bolero:update` and the minimal frontend page receives it.
- Run locally: `npm ci && npx playwright install --with-deps && npm run e2e`.
- CI: the workflow installs playwright browsers and runs `npm run e2e` after backend + frontend build.

## Security notes
- Keep `BOLERO_USER` / `BOLERO_PASS` and any `REDIS_URL` secrets out of source control. Use environment variables, Docker secrets, or a secrets manager.
- If you want, I can add an example `docker-compose.prod.yml` that demonstrates running the backend + a static frontend with environment variables loaded from a `.env` file.
