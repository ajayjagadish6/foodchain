# FoodChain

FoodChain is a web platform that matches surplus food donations to nearby requests and coordinates volunteer delivery with live status updates.

## Tech stack

- Backend: Java 21 + Spring Boot (REST API, JWT auth, Flyway)
- Database: MySQL 8 (local MySQL server on Linux VM)
- Frontend: React + Vite + Material UI
- Hosting target: Oracle Cloud Infrastructure (OCI) Linux VM (Ubuntu 24 or Oracle Linux)

## Production deployment target

This repository is now optimized for a single Linux VM deployment pattern:
- MySQL runs locally on the VM (`mysql` on Ubuntu, `mysqld` on Oracle Linux)
- Spring Boot app runs as a `systemd` service
- Nginx reverse-proxies port `80` to the app on `127.0.0.1:8080`

Deployment assets are in `deploy/ubuntu-vm` (Ubuntu-first) and `deploy/oracle-vm` (compatible).

## Quick start (local dev)

1) Start MySQL:
```bash
docker compose up -d
```

2) Run backend:
```bash
cd backend
export DB_URL="jdbc:mysql://localhost:3306/foodchain?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USER="foodchain"
export DB_PASSWORD="foodchain"
export JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32CHARS_MIN"
mvn spring-boot:run
```

Backend: `http://localhost:8080`
Swagger: `http://localhost:8080/swagger-ui/index.html`

3) Run frontend (optional, hot reload):
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173` (proxies `/api` to backend)

## Deploy on Oracle Cloud VM

See `docs/ORACLE_VM.md`.

Minimal flow after cloning the repo on your VM:

```bash
cd /path/to/foodchain
export MYSQL_APP_PASSWORD='replace-this-db-password'
export JWT_SECRET='replace-this-with-a-long-random-secret'
sudo -E bash deploy/ubuntu-vm/deploy.sh
```

For push-to-deploy from GitHub, use `.github/workflows/deploy-oracle-vm.yml` and set the required repository secrets documented in `docs/ORACLE_VM.md`.
This workflow builds the jar in GitHub Actions and deploys the prebuilt artifact to the VM, so VM-side npm/maven build time is avoided.

## Demo users

Password for all: `demo1234`

- Donor: `donor@example.com`
- Recipient: `recipient@example.com`
- Driver: `driver@example.com`
- Admin: `admin@example.com`

## Key environment variables

- `PORT` (default `8080`)
- `DB_URL` (default local MySQL URL)
- `DB_USER` / `DB_PASSWORD`
- `JWT_SECRET`
- `SMS_ENABLED`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `FCM_ENABLED`, `FCM_SERVICE_ACCOUNT_BASE64`
- `REALTIME_BUS` (default `inmemory`)

Example runtime env file: `deploy/ubuntu-vm/foodchain.env.example`

## Project layout

```text
.
├── backend/
├── frontend/
├── docker-compose.yml
├── deploy/ubuntu-vm/
└── docs/
```

## License

MIT
