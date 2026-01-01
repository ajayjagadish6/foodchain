# SMS (Twilio) Setup

FoodChain can send SMS for:
- **Phone verification** (mandatory during registration / when phone changes)
- **Delivery status notifications** (donor/recipient/driver once verified)
- Optional: **Driver new-task alerts** (`SMS_NOTIFY_DRIVERS_NEW_TASKS=true`)

## 1) Create a Twilio project
You need:
- Account SID
- Auth Token
- A Twilio phone number (E.164) to send from (e.g. `+14155550123`)

## 2) Configure environment variables

### Backend (Cloud Run)
Set these Cloud Run env vars:

- `SMS_ENABLED=true`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_FROM_NUMBER=+14155550123`

Optional:
- `SMS_NOTIFY_DRIVERS_NEW_TASKS=false` (default)

### Local dev
You can leave SMS disabled:
- `SMS_ENABLED=false` (default)

When disabled, FoodChain logs SMS payloads to the console (so dev still works).

## Notes
- Phone numbers must be provided in **E.164** format, for example `+14155552671`.
- SMS sends are best-effort; failures won’t block core delivery workflow.
