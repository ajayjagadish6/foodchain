# Firebase Cloud Messaging (Web Push)

FoodChain supports optional Web Push notifications using Firebase Cloud Messaging (FCM).

## Frontend setup

1) Create a Firebase project and add a Web App.
2) Put Firebase web config values into frontend env (see `frontend/.env.example`).
3) In Firebase Console > Cloud Messaging, generate a Web Push VAPID key and set `VITE_FIREBASE_VAPID_KEY`.

## Backend setup

1) Create a Firebase service account JSON.
2) Base64-encode it:

```bash
base64 -i serviceAccount.json | tr -d '\n'
```

3) Set backend env values (VM deploy path: `/etc/foodchain/foodchain.env`):

- `FCM_ENABLED=true`
- `FCM_SERVICE_ACCOUNT_BASE64=<base64-json>`

## Notification events

- Drivers: new delivery created
- Donor/recipient/driver: delivery status updates (`CLAIMED`, `PICKED_UP`, `DELIVERED`)
