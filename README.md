# FoodChain

FoodChain is a web-based platform for community nonprofits that reduces edible food waste by matching surplus food donations to nearby requests and coordinating volunteer delivery with live tracking.

## Tech stack

- **Backend:** Java 21 + Spring Boot (REST API, JWT auth, Flyway migrations)
- **Database:** MySQL (local via Docker Compose; production via Cloud SQL for MySQL)
- **Frontend:** React + Vite + Material UI (role-based dashboards)
- **Hosting:** Google Cloud Run (single container serving both API and UI)
- **Repo:** GitHub-ready (CI workflow included)

## What’s included (MVP)

### Roles + dashboards
- Donor: post donations, view donation status
- Recipient: post requests, view request status
- Driver: see available delivery tasks, accept and complete them, send location updates

### Core workflow
1. Donor posts donation
2. Recipient posts request
3. Backend attempts to match (category + distance) and creates a Delivery task
4. Driver accepts the task, marks picked up, then delivered
5. Recipient/Donor can view delivery status and live location on the delivery screen

### Realtime updates (MVP)
- Uses **Server-Sent Events (SSE)** for delivery status + driver location updates.
- Uses SSE to notify drivers when new delivery tasks are created.
- Notes for production scaling are in `docs/ARCHITECTURE.md` (Cloud Run multi-instance requires a shared pub/sub bus).

### Daily reset
- `DailyCleanupJob` clears data that is not for the current day (configurable cron).

## v2.1 Enhancements

### Phone number required + SMS verification (2FA code)
- Every user (Donor/Recipient/Driver/Admin) has a **mandatory** mobile number (E.164 format, e.g. `+14155552671`).
- New accounts must **verify** their phone number via a 6-digit SMS code before they can log in.
- If a user changes their phone number in Profile, they must re-verify.

### Notifications: Push + SMS
- Push notifications via FCM (optional; see `docs/FCM.md`)
- SMS notifications via Twilio (recommended for production; see `docs/SMS.md`)
  - Delivery status updates can be sent via SMS once the phone is verified
  - Driver “new task” SMS can be enabled/disabled via env var

### Google Maps enhancements
- Route polyline + distance + ETA (Google Maps JS API key)
- **ETA logic depends on status:**
  - Before pickup: **Driver → Pickup** (if driver location available)
  - After pickup: **Pickup → Dropoff**
- **Directions caching (frontend)**: results are cached in sessionStorage (10 min TTL) to reduce Google calls.

### Realtime scaling on Cloud Run
- SSE is used for realtime client updates.
- Cross-instance fanout uses an EventBus:
  - `REALTIME_BUS=inmemory` (default local)
  - `REALTIME_BUS=pubsub` (Cloud Run multi-instance; uses Pub/Sub with per-instance subscriptions)
- See `docs/CLOUDRUN.md` for provisioning + IAM.

## Local development

### 1) Start MySQL
```bash
docker compose up -d
```

### 2) Run backend
```bash
cd backend
export DB_URL="jdbc:mysql://localhost:3306/foodchain?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USER="foodchain"
export DB_PASSWORD="foodchain"
export JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32CHARS_MIN"
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

OpenAPI:
- `http://localhost:8080/swagger-ui/index.html`

### 3) Run frontend (optional, for hot reload)
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:5173` and proxies `/api` to `localhost:8080`.

### Demo users
Password for all: `demo1234`

- Donor: `donor@example.com`
- Recipient: `recipient@example.com`
- Driver: `driver@example.com`
- Admin: `admin@example.com`

## Building a production container (Cloud Run)
```bash
docker build -t foodchain .
docker run --rm -p 8080:8080   -e DB_URL="jdbc:mysql://host.docker.internal:3306/foodchain?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"   -e DB_USER="foodchain"   -e DB_PASSWORD="foodchain"   -e JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32CHARS_MIN"   foodchain
```

## Deploy to Google Cloud Run

See: `docs/CLOUDRUN.md`

## Project layout

```
.
├── backend/                 # Spring Boot API
├── frontend/                # React UI
├── Dockerfile               # Multi-stage build (frontend → backend)
├── docker-compose.yml       # Local MySQL
└── .github/workflows/ci.yml # CI (backend test + frontend build)
```

## Next steps (recommended)

- Enforce row-level authorization for delivery streams (SSE currently validates only that the token is valid).
- Replace in-memory SSE hub with Redis Pub/Sub or Google Pub/Sub for Cloud Run multi-instance scaling.
- Add real geocoding (address → lat/lng) and Directions API for ETA (current MVP uses lightweight map embed).
- Add push notifications (FCM) for drivers and recipients.
- Add an “admin” dashboard to see all activity and manage users.

## License
MIT


## Configuration

### Google Maps (frontend)

Set in `frontend/.env` (see `frontend/.env.example`):

- `VITE_GOOGLE_MAPS_API_KEY`

### Firebase Web Push (optional)

Frontend `.env`:
- `VITE_FIREBASE_*` values from your Firebase Web App settings
- `VITE_FIREBASE_VAPID_KEY` from Cloud Messaging > Web push certificates

Backend env vars:
- `FCM_ENABLED=true`
- `FCM_SERVICE_ACCOUNT_BASE64=<base64 of Firebase service account JSON>`

> Tip: you can base64 encode the JSON with: `base64 -i serviceAccount.json | tr -d '\n'`



## Remote dev on GCP
This repo is pre-wired for your Cloud Run service in `us-west1` and Cloud SQL DB `foodchain-db`.
- API base: `https://foodchain-469834444174.us-west1.run.app`
See `docs/REMOTE_DEV_GCP.md`.
