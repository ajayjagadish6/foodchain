# Deploying FoodChain to Google Cloud Run (MySQL on Cloud SQL)

## Your values
- Project: `confident-pen-482921-b3`
- Region: `us-west1`
- Service: `foodchain`
- Cloud SQL: `confident-pen-482921-b3:us-west1:foodchain-db`
- DB: `foodchain-db`


This guide assumes:
- You have a GCP project and billing enabled
- You will use **Cloud SQL for MySQL** (recommended) and connect from Cloud Run

## 1) Create Cloud SQL MySQL instance
- Create a Cloud SQL MySQL instance
- Create database: `foodchain`
- Create user: `foodchain`

## 2) Build and push container image
Using Artifact Registry:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com

gcloud artifacts repositories create foodchain --repository-format=docker --location=us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/foodchain/foodchain:latest .
```

## 3) Deploy to Cloud Run
```bash
gcloud run deploy foodchain   --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/foodchain/foodchain:latest   --region us-central1   --allow-unauthenticated   --set-env-vars JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32CHARS_MIN"   --set-env-vars DB_USER="foodchain",DB_PASSWORD="YOUR_DB_PASSWORD"   --set-env-vars DB_URL="jdbc:mysql:///<DB_NAME>?cloudSqlInstance=YOUR_PROJECT_ID:us-central1:YOUR_INSTANCE&socketFactory=com.google.cloud.sql.mysql.SocketFactory&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"   --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:YOUR_INSTANCE
```

### Cloud SQL socket factory dependency
If you prefer the Cloud SQL socket factory method above, add the dependency in `backend/pom.xml`:
- `com.google.cloud.sql:mysql-socket-factory-connector-j-8`

For a simple first deploy, you can also use a **public IP** on Cloud SQL and set `DB_URL` to standard JDBC (be careful with network security).

## 4) Visit the service URL
Open the Cloud Run URL. The UI is served from the same service.

## 5) Configure cleanup schedule
Set:
- `DAILY_CLEANUP_CRON` (default is 23:59 daily)
- Configure timezone for JVM if needed via `JAVA_OPTS`, e.g. `-Duser.timezone=America/Los_Angeles`


## Realtime on Cloud Run (Redis)

v2 uses Redis Pub/Sub for realtime delivery tracking across Cloud Run instances.

Recommended options:
- **Cloud Memorystore for Redis** (managed Redis)
- Or replace Redis with **Google Pub/Sub** if you prefer fully-managed messaging.

Set env vars on your Cloud Run service:
- `REDIS_HOST=<memorystore-host>`
- `REDIS_PORT=6379`



## Optional Web Push (FCM)

To enable push notifications:
- Create a Firebase project and a Web App
- Generate a service account JSON in Firebase/Google Cloud console
- Set Cloud Run env vars:
  - `FCM_ENABLED=true`
  - `FCM_SERVICE_ACCOUNT_BASE64=<base64 of service account json>`



## Realtime fanout with Pub/Sub (multi-instance Cloud Run)

FoodChain uses SSE for realtime updates. For a single instance, no shared bus is needed.

For multi-instance deployments, set:

- `REALTIME_BUS=pubsub`
- `GCP_PROJECT_ID=<your-project>`
- Optional:
  - `PUBSUB_TOPIC_ID=foodchain-events`
  - `PUBSUB_SUB_PREFIX=foodchain-events-sub`

### Provision Pub/Sub resources
Create a topic (once):

```bash
gcloud pubsub topics create foodchain-events
```

FoodChain creates a **per-instance subscription** at startup using `HOSTNAME` in the name to ensure each instance receives all events.
It sets an expiration policy to auto-delete inactive subscriptions.

### IAM permissions for the Cloud Run service account
Grant the Cloud Run runtime service account:

- Publish to the topic:
```bash
gcloud pubsub topics add-iam-policy-binding foodchain-events \
  --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/pubsub.publisher"
```

- Create/delete subscriptions:
```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/pubsub.editor"
```

For tighter permissions, you can grant `roles/pubsub.subscriber` + `pubsub.subscriptions.create/delete` via a custom role.

> If you cannot grant subscription-create permissions, a simpler alternative is to run the service with `max instances = 1`
> or keep using a shared Redis (Memorystore) bus.

## SMS (Twilio) on Cloud Run
See `docs/SMS.md`. At minimum set:

- `SMS_ENABLED=true`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_FROM_NUMBER=+14155550123`


## Cloud SQL connection (Cloud Run)

Use Spring profile `cloudrun`.

Environment variables:
- `SPRING_PROFILES_ACTIVE=cloudrun`
- `DB_NAME=foodchain-db`
- `CLOUD_SQL_CONNECTION_NAME=PROJECT:REGION:INSTANCE`
- `DB_USER`, `DB_PASSWORD`

The JDBC URL defaults to:
`jdbc:mysql:///${DB_NAME}?unix_socket=/cloudsql/${CLOUD_SQL_CONNECTION_NAME}&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

See `backend/src/main/resources/application-cloudrun.yml`.