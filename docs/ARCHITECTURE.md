# Architecture

## Overview

FoodChain is deployed as a single Linux VM workload:
- Spring Boot serves:
  - `/api/**` REST API
  - `/api/stream/**` SSE streams
  - static UI assets (React build) at `/`
- MySQL 8 runs locally on the same VM
- Nginx proxies `:80` to app `:8080`

## Realtime design

MVP realtime uses SSE + in-memory event fanout (`REALTIME_BUS=inmemory`).

This is appropriate for:
- local development
- single-instance VM deployments

If you move to multi-instance later, use a shared bus implementation (for example Redis Pub/Sub) so events fan out across instances.

## Security

- JWT Bearer tokens for API calls
- SSE currently accepts `?token=...` because browser `EventSource` cannot send custom Authorization headers

## Matching

`MatchingService` attempts matches on each donation/request creation:
- category must match
- distance must be within configurable radius
- nearest match wins
- creates a Delivery task lifecycle:
  - `CREATED -> CLAIMED -> PICKED_UP -> DELIVERED`

## Authorization

Delivery detail endpoints and delivery SSE streams are protected so only donor, recipient, assigned driver, or admin can access them.

## Optional notifications

- SMS via Twilio
- Web Push via Firebase Cloud Messaging
