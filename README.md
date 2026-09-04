# Decision Queue

**Built by Muneeb Khan**

Decision Queue is a lightweight product-request prioritization tool for reviewing incoming requests, assessing urgency and expected impact, and recording clear product decisions.

## Features

- Create and persist product requests
- Search, filter, and sort the request queue
- Accept, defer, or decline requests with required decision reasons
- Review-progress tracking
- Light and dark mode
- PostgreSQL + Prisma persistence
- Dockerized app and database
- Automated API workflow tests

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Docker / Docker Compose
- Vitest

## Quick Start

Make sure Docker Desktop is running:

`docker compose up --build`

Then open `http://localhost:3000`.

To stop the stack:

`docker compose down`

## Local Development

Run these commands:

`npm install`

`docker compose up -d db`

`npx prisma migrate deploy`

`npm run dev`

Then open `http://localhost:3000`.

## Tests

Run:

`npm test`

The test suite covers valid request creation, required-field validation, urgency validation, valid decision submission, invalid decisions, and required decision reasons.

## Database Reset

Run:

`docker compose down -v`

`docker compose up -d db`

`npx prisma migrate deploy`

## Key Decisions

### PostgreSQL + Prisma
PostgreSQL provides persistent storage, while Prisma provides a typed and maintainable database layer.

### Server-side filtering
Queue filters are represented in URL parameters and handled server-side so views remain reproducible after refresh.

### Required decision reasons
Final decisions require written context so teammates can understand why a request was accepted, deferred, or declined.

## Known Gaps

Possible future improvements include authentication, team assignments, pagination, audit history, and richer analytics.

## AI Usage

AI-assisted development tools were used during implementation. Details are documented in `AI_USE.md`.

## Focused Development Time

Final focused development time is recorded in `SUBMISSION.md`.
