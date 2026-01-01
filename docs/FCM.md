# Firebase Cloud Messaging (Web Push)

FoodChain v2 supports optional Web Push notifications using Firebase Cloud Messaging (FCM).

## Frontend setup

1) Create a Firebase project and add a **Web App**.
2) Copy the Web App config values into `frontend/.env` (see `frontend/.env.example`).
3) In Firebase console:
   - Go to **Cloud Messaging**
   - Generate a **Web Push certificate** (VAPID key)
   - Put the public key into `VITE_FIREBASE_VAPID_KEY`

### Service worker config

The file `frontend/public/firebase-messaging-sw.js` initializes Firebase in the service worker context.

For production, you should either:

- **Option A (simple):** paste the same Firebase config values into `firebase.initializeApp({...})` in the service worker file, or
- **Option B (recommended):** inject values at build/deploy time (e.g. replace placeholders in CI).

## Backend setup (FCM sender)

1) Create a Firebase/Google Cloud **service account** key JSON (Project Settings → Service accounts).
2) Base64 encode it:

```bash
base64 -i serviceAccount.json | tr -d '\n'
```

3) Set backend env vars:

- `FCM_ENABLED=true`
- `FCM_SERVICE_ACCOUNT_BASE64=<base64-json>`

## What gets notified

- Drivers: **new delivery created** (available to claim)
- Donor/recipient/driver: **status changes** (CLAIMED / PICKED_UP / DELIVERED)
