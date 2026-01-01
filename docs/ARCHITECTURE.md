# Architecture

## Overview

FoodChain is shipped as a **single Cloud Run container**:
- Spring Boot serves:
  - `/api/**` REST API
  - `/api/stream/**` SSE streams (status/location/task notifications)
  - static UI assets (React build) at `/`

## Realtime design

MVP uses in-memory `RealtimeHub` and SSE. This works great:
- locally
- in a single-instance Cloud Run service

For multi-instance Cloud Run scaling:
- in-memory hubs won't broadcast across instances
- you should replace the hub with a shared bus:
  - Google Cloud Pub/Sub (per-instance subscriptions) OR in-memory for single instance
  - Google Pub/Sub
  - or a managed websocket gateway

## Security
- JWT Bearer tokens for API calls
- For SSE, the browser `EventSource` can’t set headers, so the MVP accepts `?token=...` query param.
  - Recommended upgrade: cookie-based session OR SSE-over-fetch with Authorization header.

## Matching
`MatchingService` attempts matches on each donation/request creation:
- category must match
- distance must be within configurable radius
- nearest match wins
- creates a Delivery task with lifecycle:
  - CREATED → CLAIMED → PICKED_UP → DELIVERED

## Row-level authorization
Delivery detail and delivery SSE streams are protected so only the donor, recipient, assigned driver, or an admin can access them.

## Push notifications (FCM)
Optional Web Push notifications are sent via Firebase Cloud Messaging when enabled on the backend.
