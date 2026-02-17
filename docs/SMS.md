# SMS (Twilio) Setup

FoodChain can send SMS for:
- Phone verification (mandatory during registration / when phone changes)
- Delivery status notifications (donor/recipient/driver once verified)
- Optional driver new-task alerts (`SMS_NOTIFY_DRIVERS_NEW_TASKS=true`)

## 1) Create a Twilio project

You need:
- Account SID
- Auth Token
- Twilio phone number in E.164 format (for example `+14155550123`)

## 2) Configure backend environment

Set in your runtime env file (for VM deploy: `/etc/foodchain/foodchain.env`):

- `SMS_ENABLED=true`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_FROM_NUMBER=+14155550123`

Optional:
- `SMS_NOTIFY_DRIVERS_NEW_TASKS=false` (default)

If disabled, FoodChain logs SMS payloads instead of sending.

## Notes

- Phone numbers must be E.164, for example `+14155552671`.
- SMS failures are best-effort and will not block delivery workflow.
