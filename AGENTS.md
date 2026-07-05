# BiteTrack — Agent Guide

You are working on **BiteTrack**: a location-based app for discovering and tracking mobile food vendors.

**Tagline:** Track your next bite.

## Read first

| Document | Purpose |
|----------|---------|
| [`docs/BITETRACK_PRODUCT.md`](docs/BITETRACK_PRODUCT.md) | Full product spec, scope, terminology, architecture |
| [`README.md`](README.md) | API setup, scripts, env vars |

## Repos

| Repo | Role |
|------|------|
| **bitetrack-api** (this repo) | Node/TS/Express/Prisma/PostGIS backend |
| **bitetrack-mobile** | Flutter BLoC app (sibling repo) |

## Product truths (do not re-derive each session)

- **Business**, not vendor profile — one user can own **many businesses**.
- No `VENDOR` user role — seller = user with `businessCount > 0`.
- **Go live** = start selling / share location (`/me/businesses/:id/selling/*`). Requires **VERIFIED** business.
- Customers find live sellers via **nearby** + **discover map** (PostGIS + OSM/flutter_map).
- **Media:** S3 presigned uploads only (`STORAGE_DRIVER=s3`). No local storage driver.
- **Maps on mobile:** OpenStreetMap + `flutter_map` — not Google Maps.

## Architecture

Clean Architecture + DDD per module:

`domain/` → `application/` → `infrastructure/` → `presentation/`

Use existing patterns: tsyringe DI, Zod validators, Prisma repos, structured errors.

## When implementing

1. Match BRD intent in `docs/BITETRACK_PRODUCT.md`.
2. Mark future-scope features (payments, AI, SSO) as roadmap unless explicitly requested.
3. Keep diffs minimal; follow existing conventions in the touched module.
4. Do not commit secrets (`.env`, AWS keys).

## MCP / future

This doc + `docs/BITETRACK_PRODUCT.md` + `.cursor/rules/bitetrack-product.mdc` are the canonical context sources. Prefer updating these over re-attaching the original `.docx`.
