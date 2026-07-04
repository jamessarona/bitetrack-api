# BiteTrack API

**Track your next bite.** Real-time mobile vendor discovery and tracking platform backend.

Built with **Node.js (LTS)**, **TypeScript**, **Express**, **Prisma ORM**, **PostgreSQL + PostGIS**, **Redis**, and **Socket.IO** — following **Clean Architecture**, **DDD**, and **modular monolith** patterns that stay microservice-ready.

---

## Features (MVP scope)

| Area | Capabilities |
|------|-------------|
| **Auth** | Register, login, JWT access + rotating refresh tokens, `/me` |
| **Health** | Liveness + readiness (DB + Redis) |
| **Realtime** | Socket.IO scaffold at `/realtime` |
| **Data model** | Users, vendors, categories, shifts, geospatial pings, products, reviews, favorites, notifications |

---

## Tech stack

- **Runtime:** Node.js 22, TypeScript (strict)
- **HTTP:** Express 5, Helmet, CORS, compression, rate limiting
- **ORM:** Prisma 7 + `@prisma/adapter-pg`
- **Database:** PostgreSQL 16 + PostGIS, pgvector, pg_trgm, citext
- **Cache:** Redis 7 (sessions, rate limits, live location cache)
- **Realtime:** Socket.IO
- **Auth:** Argon2, JWT
- **DI:** tsyringe
- **Validation:** Zod
- **Logging:** Pino
- **Testing:** Jest
- **Lint/format:** ESLint (flat) + Prettier

---

## Prerequisites

- [Node.js 22+](https://nodejs.org/) (see `.nvmrc`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres + Redis — no local DB install needed)
- Git

---

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> bitetrack-api
cd bitetrack-api
npm ci
cp .env.sample .env.development
```

### 2. Environment

Copy the sample file for the environment you want to run:

```bash
cp .env.sample .env.development
# optional local overrides (also git-ignored)
cp .env.sample .env
```

| File | Purpose |
|------|---------|
| `.env.sample` | Template with all variables documented (committed) |
| `.env.development` | Local dev — copy from sample (git-ignored) |
| `.env.staging` | Staging — copy from sample; secrets injected at deploy (git-ignored) |
| `.env.production` | Production — copy from sample; secrets injected at deploy (git-ignored) |

> **Postgres host port:** defaults to **5433** on your machine (container stays on 5432) to avoid clashing with other local Postgres instances.

### 3. Start infrastructure (Docker)

```bash
# Postgres + Redis only (recommended for local dev)
docker compose up -d

# Optional DB/Redis web UIs
docker compose --profile tools up -d

# Full stack including API in a container (hot reload)
docker compose --profile app up -d
```

### 4. Database migrate + seed

```bash
npm run prisma:generate
npm run prisma:deploy    # or: npm run prisma:migrate
npm run prisma:seed
```

### 5. Run the API

```bash
npm run dev
```

API: `http://localhost:4000/api/v1`

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Liveness |
| `GET /health/ready` | Readiness (DB + Redis) |
| `GET /api/v1/` | API info |
| `POST /api/v1/auth/register` | Register |
| `POST /api/v1/auth/login` | Login |
| `POST /api/v1/auth/refresh` | Refresh tokens |
| `POST /api/v1/auth/logout` | Logout |
| `GET /api/v1/auth/me` | Current user (Bearer token) |

**Seed accounts** (password: `ChangeMe123!`):

- `admin@bitetrack.app` — ADMIN
- `vendor@bitetrack.app` — VENDOR (Mang Juan's Taho)

---

## Project structure

```
src/
├── config/              # Typed env + app config (Zod)
├── core/                # Cross-cutting: errors, HTTP helpers, middleware, logger
├── infrastructure/      # DB, cache, DI, realtime adapters
├── modules/             # Feature modules (Clean Architecture per module)
│   ├── auth/
│   │   ├── domain/          # Entities + repository contracts
│   │   ├── application/     # Use-cases, DTOs, ports
│   │   ├── infrastructure/  # Prisma repos, JWT, Argon2
│   │   └── presentation/    # Routes, controllers, validators
│   └── health/
├── routes/              # API router aggregator
├── app.ts               # Express factory (testable)
├── server.ts            # Boot + graceful shutdown
└── main.ts              # Entry point
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm test` | Jest unit tests |
| `npm run prisma:studio` | Prisma Studio GUI |
| `npm run db:reset` | Reset DB + re-seed |

---

## Docker images

| File | Use |
|------|-----|
| `Dockerfile.development` | Hot reload, bind-mounted source |
| `Dockerfile.staging` | Multi-stage, lean, non-root |
| `Dockerfile.production` | Same as staging, `NODE_ENV=production` |

Build production image:

```bash
docker build -f Dockerfile.production -t bitetrack/api:latest .
```

---

## Environment variables

See [`.env.sample`](.env.sample) for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` \| `test` \| `staging` \| `production` |
| `PORT` | HTTP port (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |

---

## Testing

```bash
npm test
npm run test:cov
```

Coverage targets are configured in `jest.config.ts` (70% minimum for MVP).

---

## Git commit convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add login endpoint
fix(db): publish Postgres on port 5433
chore: initialize project tooling
```

Each feature or logical change gets its own commit for a clean history.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Postgres port conflict | Change `POSTGRES_PORT` in `.env.development` (default `5433`) |
| Redis connection refused | `docker compose up -d redis` |
| Prisma client out of date | `npm run prisma:generate` |
| Migration drift | `npm run db:reset` (dev only — destroys data) |

---

## License

Proprietary — BiteTrack Engineering.
