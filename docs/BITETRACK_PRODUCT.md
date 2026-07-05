# BiteTrack — Product Specification (AI Reference)

> **Canonical source of truth** for product intent, scope, and architecture.  
> Converted from the Business Requirements Document. Use this instead of re-reading the `.docx` in every session.  
> **Last updated:** 2026-07-05

---

## 1. Product identity

| Field | Value |
|-------|--------|
| **Name** | BiteTrack (working title was *Vendor Tracker Platform*) |
| **Tagline** | Track your next bite. |
| **Vision** | Leading real-time discovery and tracking platform for mobile vendors across Southeast Asia. |
| **Origin problem** | Mobile vendors (e.g. taho sellers shouting “Taho!”) are hard to find. Customers miss them; vendors miss sales. No centralized discovery or reputation layer exists. |

---

## 2. Business objectives

### Primary

- Digitize mobile vendor discovery.
- Increase vendor sales opportunities.
- Improve customer convenience.
- Build a location-based marketplace for mobile vendors.
- Scale to millions of users.

### Secondary

- Vendor reputation (reviews/ratings).
- Route optimization and analytics.
- Data-driven insights.
- Future monetization (subscriptions, ads).

---

## 3. Problem statement

Mobile vendors rely on physical announcements and proximity. Customers often hear vendors too late, cannot determine location, and have no way to see reputation or history. Vendors cannot reach customers efficiently.

---

## 4. Stakeholders

| Internal | External |
|----------|----------|
| Product Owner | Vendors (sellers) |
| Engineering | Customers |
| Operations | Advertisers (future) |
| Customer Support | Business Partners (future) |
| Marketing | |

---

## 5. User personas

### Customer

**Goals:** Find nearby vendors, track in real time, receive notifications, view ratings/reviews, discover new vendors.

### Vendor / Seller

**Goals:** Broadcast location, increase reach, build reputation, receive feedback, manage profile and products.

> **Implementation note:** There is no separate `VENDOR` user role. A user becomes a seller by **owning one or more businesses** (`businessCount > 0`). Seller features live under **My businesses**.

### Administrator

**Goals:** Manage platform, moderate content, handle disputes, monitor analytics, verify businesses.

---

## 6. Success metrics (KPIs)

| Area | Metrics |
|------|---------|
| **Customer** | MAU, DAU, retention, avg session duration |
| **Vendor** | Active vendors, location broadcast sessions, revenue growth, engagement |
| **Platform** | Location update latency, uptime, API response time, map load time |

**Targets (from BRD):**

- Availability: **99.95%**
- API response: **< 200 ms**
- Real-time location delay: **< 3 s**

---

## 7. Scope

### In scope (product)

#### Customer

- Registration / login (email, social, SSO roadmap)
- Browse vendors/businesses
- Map view + real-time tracking
- Search (vendor, product, category)
- Reviews & ratings
- Favorites
- Notifications (nearby, favorites, promotions)
- Vendor/business profiles, ETA (future), history, photo gallery

#### Vendor / Seller

- Business registration (multi-business per account)
- Identity verification
- Real-time location sharing (**Go live** / stop selling)
- Route tracking (future)
- Profile & product catalog
- Reviews & analytics (future)

#### Admin

- User management
- Business verification
- Moderation, analytics, monitoring

### Future scope (not MVP)

- In-app ordering, payments, e-wallet
- Loyalty programs, vendor subscriptions
- AI demand prediction, route recommendations, dynamic ETA
- Delivery, advertising platform, marketplace promotions

---

## 8. MVP (Phase 1) — target features

| Actor | MVP features |
|-------|----------------|
| **Customer** | Register/login, live vendor map, search, follow/favorites, notifications, reviews |
| **Vendor** | Register business, live location sharing, profile, basic analytics |
| **Admin** | User management, vendor verification, reporting |

**Estimated timeline (BRD):** 4–6 months.

---

## 9. Core feature requirements

### 9.1 Authentication

| Method | Customer | Vendor/Seller |
|--------|----------|---------------|
| Email/password | ✓ | ✓ |
| OTP | Roadmap | Roadmap |
| Google | ✓ (mobile) | ✓ |
| Apple / Facebook | Roadmap | Roadmap |
| Enterprise SSO (SAML/OIDC/OAuth2) | Roadmap | Roadmap |

**Current:** JWT access + refresh tokens, register/login/logout/me, Google sign-in on mobile.

### 9.2 Real-time location broadcasting

**Seller flow (implemented as “Go live”):**

1. Start shift → share GPS → status `AVAILABLE` (or live statuses)
2. Periodic location pings while live
3. Stop shift → status `OFFLINE`

**Customer flow:**

- Live map with nearby businesses
- Real-time movement (Socket.IO roadmap; REST nearby for MVP)

**Business status enum:** `OFFLINE`, `ONLINE`, `ON_ROUTE`, `AVAILABLE`, `BUSY`

**Verification:** Only **VERIFIED** businesses may go live.

### 9.3 Discovery & map

**Filters (roadmap):** category, distance, rating, popularity, availability.

**Search (roadmap):** vendor name, product name, category.

**Map UX inspiration:** Airbnb, Uber, Grab, Waze.

**Features:** live pins, clustering, route trails, ETA, heatmaps, nearby list.

**Current:** OpenStreetMap via `flutter_map` (not Google Maps). Nearby query uses PostGIS.

### 9.4 Reviews & ratings

Customers rate, upload photos, leave reviews, report. Vendors respond. *(Schema exists; full UI roadmap.)*

### 9.5 Notifications

Push: vendor near me, favorite nearby, promotions, shift started/ended. Channels: push, email, SMS. *(FCM roadmap.)*

---

## 10. Domain model (implementation)

| BRD term | Current implementation |
|----------|------------------------|
| Vendor | **Business** — one user can own **many** businesses |
| Vendor registration | `POST /me/businesses` |
| Vendor verification | `Business.verificationStatus`: `PENDING`, `VERIFIED`, `REJECTED` |
| Location ping | `BusinessLocationPing` + `lastLocation` on business |
| Active selling session | `BusinessShift` (ACTIVE) + `isLive` on API responses |
| User roles | `CUSTOMER`, `ADMIN` only — seller = has businesses |

---

## 11. API surface (implemented highlights)

| Area | Endpoints |
|------|-----------|
| Auth | `/auth/register`, `/login`, `/refresh`, `/logout`, `/me` |
| Businesses (owner) | `GET/POST /me/businesses`, `PATCH /me/businesses/:id` |
| Products | `/me/businesses/:id/products` CRUD |
| **Go live** | `POST .../selling/start`, `.../stop`, `.../location`, `GET .../selling` |
| Public | `GET /businesses`, `/businesses/nearby`, `/categories` |
| Media | S3 presigned upload sessions (`STORAGE_DRIVER=s3`) |

**Nearby rule:** Returns **VERIFIED** businesses with **live status** and **location** set.

---

## 12. Mobile app (implementation)

| Area | Stack / status |
|------|----------------|
| Framework | Flutter, BLoC, Clean Architecture |
| DI | get_it + injectable |
| Network | Dio |
| Routing | go_router |
| Map | flutter_map + OSM tiles + geolocator |
| Seller UX | Settings → **My businesses** → business detail → **Go live** |
| Storage uploads | S3 presigned PUT via API session |

**Routes:** `/discover`, `/discover/map`, `/businesses`, `/businesses/new`, `/businesses/:id`, `/settings`, `/profile`

---

## 13. Architecture standards (from BRD)

### Mobile — Clean Architecture

```
lib/
├── core/
├── features/
│   └── {feature}/
│       ├── data/        # DTOs, API, repo impl
│       ├── domain/      # entities, contracts
│       └── presentation/ # pages, widgets, bloc
```

- **State:** BLoC
- **DI:** get_it, injectable
- **Network:** Dio (interceptors, token refresh, errors)
- **Local cache:** Hive / SharedPreferences
- **Testing target:** 80% coverage (aspirational)

### Backend — Clean Architecture + DDD

```
src/modules/{module}/
├── domain/          # entities, repository interfaces
├── application/     # use cases
├── infrastructure/  # Prisma repos, adapters
└── presentation/    # routes, controllers, validators
```

- **Runtime:** Node.js LTS, TypeScript, Express
- **ORM:** Prisma
- **DB:** PostgreSQL + PostGIS (+ pgvector, pg_trgm roadmap)
- **Cache:** Redis
- **Realtime:** Socket.IO (scaffold)
- **DI:** tsyringe
- **Validation:** Zod

### Infrastructure (target / roadmap)

| Concern | BRD recommendation | Current |
|---------|-------------------|---------|
| Cloud | AWS (EKS, RDS, ElastiCache, S3, CloudFront) | Local Docker dev |
| Object storage | S3 + CloudFront | S3 presigned uploads |
| Search | Elasticsearch / OpenSearch | Postgres + PostGIS |
| Queue | Kafka / RabbitMQ | Roadmap |
| CI/CD | GitHub Actions | Roadmap |
| Monitoring | OpenSearch, Prometheus, Sentry, OTel | Roadmap |

---

## 14. Security & compliance (target)

- JWT access + refresh, OAuth2/OIDC/SAML roadmap
- RBAC, MFA, rate limiting, WAF
- Encryption at rest and in transit
- Compliance-ready: GDPR, SOC2, ISO27001

---

## 15. Scalability targets

| Horizon | Users | Vendors |
|---------|-------|---------|
| Year 1 | 10,000 | 1,000 |
| Year 3 | 500,000 | 50,000 |
| Year 5 | 5,000,000+ | 500,000+ |

---

## 16. Monetization (phased)

1. Free platform
2. Premium vendor subscription
3. Sponsored listings
4. In-app advertising
5. Marketplace transactions
6. Delivery commissions

---

## 17. AI / MCP usage guide

When implementing features, agents should:

1. **Check this doc first** for scope and terminology.
2. **Prefer “business” over “vendor”** in code and UX unless quoting legacy BRD text.
3. **Seller capabilities** attach to business ownership, not a user role.
4. **Map stack:** OSM / flutter_map on mobile — do not add Google Maps unless explicitly requested.
5. **Media:** S3 presigned uploads only — no local file storage driver.
6. **Go live:** Requires verified business + GPS permission; customers see seller via nearby/map.
7. **MVP first:** Mark future-scope items clearly; do not over-build ordering, payments, or AI until requested.

### Terminology map

| User-facing | Internal / API |
|-------------|----------------|
| Go live | `POST .../selling/start` |
| Stop selling | `POST .../selling/stop` |
| Live on map | `isLive: true`, status in `ONLINE\|AVAILABLE\|ON_ROUTE\|BUSY` |
| My businesses | `/me/businesses` |
| Seller / vendor | User with `businessCount > 0` |

---

## 18. Engineering documentation requirements (from BRD)

Every repo must maintain:

- `README.md` — setup, stack, scripts, troubleshooting
- `AGENTS.md` — AI agent orientation (this workspace)
- `docs/BITETRACK_PRODUCT.md` — this file
- `.cursor/rules/` — persistent Cursor rules

---

## 19. Repositories

| Repo | Purpose |
|------|---------|
| `bitetrack-api` | Backend API, Prisma, PostGIS, media uploads |
| `bitetrack-mobile` | Flutter customer + seller app |

---

*Source: BiteTrack Business Requirements Document (.docx). Maintained as living spec — update when product decisions change.*
