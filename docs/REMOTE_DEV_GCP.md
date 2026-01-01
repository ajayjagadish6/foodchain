# Remote development on GCP (Cloud Run + Cloud SQL)

This repo supports a workflow where you **edit code locally**, but the backend runs on **Cloud Run** and the database is **Cloud SQL MySQL** (no localhost MySQL / no local Java server).

## Your setup (single service: dev=prod)
- Cloud Run region: `us-west1`
- Cloud Run service: `foodchain`
- Cloud Run URL: `https://foodchain-469834444174.us-west1.run.app`
- Cloud SQL connection name: `confident-pen-482921-b3:us-west1:foodchain-db`
- Database name: `foodchain-db`
- DB user: `foodchain`

> Because you’re using **one service (dev=prod)**, any schema migrations or test data will affect your production environment. Consider keeping demo seeds off and using feature flags in `application-cloudrun.yml` if you want safer iteration.

## 1) Cloud Run runtime config

Set Cloud Run environment variables (example names; adjust to your values):

- `SPRING_PROFILES_ACTIVE=cloudrun`
- `DB_NAME=foodchain-db`
- `DB_USER=<cloudsql-user>`
- `DB_PASSWORD=<cloudsql-password>`
- `CLOUD_SQL_CONNECTION_NAME=<PROJECT:REGION:INSTANCE>`
- `JWT_SECRET=<long-random-secret>`
- `SMS_ENABLED=true/false` (optional; see `docs/SMS.md`)
- `REALTIME_BUS=pubsub` (optional; see `docs/CLOUDRUN.md`)

The `cloudrun` Spring profile uses the Cloud Run integrated Cloud SQL Auth Proxy via unix socket:
`/cloudsql/<CLOUD_SQL_CONNECTION_NAME>` (see `backend/src/main/resources/application-cloudrun.yml`).

## 2) Deploy from your machine (one-time / manual)

From repo root:

```bash
gcloud run deploy foodchain-dev \
  --region us-central1 \
  --source . \
  --allow-unauthenticated \
  --add-cloudsql-instances "$CLOUD_SQL_CONNECTION_NAME" \
  --set-env-vars SPRING_PROFILES_ACTIVE=cloudrun,DB_NAME=foodchain-db,DB_USER=$DB_USER,DB_PASSWORD=$DB_PASSWORD,CLOUD_SQL_CONNECTION_NAME=$CLOUD_SQL_CONNECTION_NAME,JWT_SECRET=$JWT_SECRET
```

## 3) Deploy automatically from GitHub (recommended)

Use `.github/workflows/deploy-cloudrun.yml`.

You will need GitHub repo secrets:
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `CLOUD_RUN_SERVICE`
- `CLOUD_SQL_CONNECTION_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `GCP_SA_KEY` (service account JSON key)

Then push to `main` and it will deploy.

## 4) Local frontend editing (optional)

Option A (simplest): build UI and serve via Spring Boot (Cloud Run serves everything).

Option B (fast UI iteration): run Vite locally and point it to the remote API:

1) Set `frontend/.env.local`:
```env
VITE_API_BASE=https://<your-cloud-run-url>
```
2) Run:
```bash
cd frontend
npm install
npm run dev
```

CORS is permissive by default for dev.



## 3) GitHub Actions (pre-wired)
This repo includes a ready-to-run workflow at `.github/workflows/deploy-cloudrun.yml` with your project/region/service pre-filled.

Create these GitHub repo secrets:
- `GCP_SA_KEY` (your service account JSON)
- `DB_PASSWORD`
- `JWT_SECRET`

Then push to `main` and it will deploy to Cloud Run.
