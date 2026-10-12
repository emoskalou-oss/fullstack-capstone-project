# GiftLink

**Live demo:** https://giftlink-frontend-jml3.onrender.com

GiftLink helps people discover household items shared by their community and lets signed-in members offer gifts and comment on listings.

## Technology

- Frontend: React 18, React Router, Bootstrap and Vite.
- API: Node.js, Express and MongoDB.
- Authentication: bcryptjs password hashing and expiring JWTs.
- Sentiment service: Express and the `natural` library (AFINN lexicon).
- Validation: Mocha, Supertest, Vitest and React Testing Library.
- Automation: Docker Compose and GitHub Actions.

## Project layout

- `giftlink-frontend/` — React application and static assets.
- `giftlink-backend/` — Gift and search APIs, authentication, MongoDB model and data importer.
- `giftlink-backend/util/import-mongo/gifts.json` — the 16 starter gift records.
- `sentiment/` — standalone sentiment-analysis HTTP service.
- `docker-compose.yml` — local container stack.
- `.github/ISSUE_TEMPLATE/user-story.md` — GitHub user-story issue template.

## Requirements

- Node.js 22.12 or newer and npm.
- MongoDB 6 or newer for local non-Docker development, or Docker Desktop for the full container stack.

## Configure and run locally with PowerShell

Start MongoDB using your local installation or a MongoDB service you control. The application does not create a database account or supply a hosted database URI.

In the backend terminal, from the repository root:

```powershell
cd giftlink-backend
Copy-Item .env.sample .env
```

Edit `giftlink-backend\.env` and replace the MongoDB and JWT placeholders. `MONGO_URL` must be the URI for your MongoDB instance. `JWT_SECRET` must be a randomly generated secret of at least 32 characters; the backend refuses to start if it is missing, too short, or a recognized example value. Generate a private 32-byte (64-character hexadecimal) secret in PowerShell with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into your local `giftlink-backend\.env` only. Do not paste it into source files, commits, issues, logs, or this README.

Install, import the 16 starter gifts, and start the API:

```powershell
npm.cmd install
npm.cmd run seed
npm.cmd start
```

The API listens on port `3060` by default. The importer upserts records by gift ID, creates a unique index, and can be rerun without duplicating the starter gifts. It preserves records already in MongoDB; it does not delete data. `npm run seed` fails explicitly if the JSON does not contain exactly 16 records or if MongoDB is unavailable.

In another terminal, from the repository root, configure and start the frontend:

```powershell
cd giftlink-frontend
Copy-Item .env.sample .env
npm.cmd install
npm.cmd start
```

The frontend runs at `http://localhost:5173` by default. `VITE_BACKEND_URL` in `giftlink-frontend\.env` points to the API; restart the development server after changing it. The backend's `CORS_ORIGIN` should include `http://localhost:5173` for local development. When `VITE_BACKEND_URL` is unset, the frontend uses the deployed GiftLink backend at `https://giftlink-backend-9171.onrender.com`. Set `VITE_BACKEND_URL` to the API origin before building if deploying to a different backend; this value is embedded in the frontend build.

To run the sentiment service separately, from the repository root:

```powershell
cd sentiment
npm.cmd install
npm.cmd start
```

It listens on port `3000` by default; set `$env:PORT = '3001'` first if the React development server is using port 3000.

## API overview

- `GET /health` — API liveness check.
- `GET /api/gifts` — list gifts.
- `GET /api/gifts/:id` — fetch one gift by its string ID.
- `GET /api/search` and `GET /api/gifts/search?category=Living&name=lamp&condition=New&age_years=5` — filter gifts. Every filter is optional.
- `POST /api/gifts` — create a gift; requires `Authorization: Bearer <token>`.
- `POST /api/gifts/:id/comments` — add a comment; requires a token.
- `POST /api/auth/register` and `POST /api/auth/login` — create an account and obtain a JWT.
- `GET /api/auth/me` and `PUT /api/auth/update` — read/update the signed-in profile.
- `POST /sentiment` on the standalone service, with JSON such as `{"sentence":"This is wonderful"}`.

Registration passwords must contain at least 8 characters and no more than 72 UTF-8 bytes, matching the effective input limit of `bcryptjs`. Login remains unchanged so existing password hashes continue to work.

The sentiment endpoint is a small lexicon-based polarity estimate, not a nuanced or reliable understanding of context, sarcasm, or every language.

## Environment variables

Backend (`giftlink-backend/.env`):

- `MONGO_URL` — MongoDB connection URI for the `giftdb` database.
- `JWT_SECRET` — private random signing secret; never commit it.
- `PORT` — optional API port (default `3060`).
- `CORS_ORIGIN` — comma-separated frontend origins (default `http://localhost:3000`).

Frontend (`giftlink-frontend/.env`):

- `VITE_BACKEND_URL` — API origin, e.g. your local API origin. It can be empty when a reverse proxy serves `/api` on the same origin.

Sentiment (`sentiment/.env`):

- `PORT` — optional service port (default `3000`).

Keep real `.env` files and variants such as `.env.production`, `.env.development`, and `.env.test` out of Git and Docker build contexts. The ignore rules explicitly preserve `.env.sample`; the checked-in examples contain placeholders only.

## Tests and production build

Run each package's tests from the repository root:

```powershell
cd giftlink-backend
npm.cmd test
```

```powershell
cd sentiment
npm.cmd test
```

```powershell
cd giftlink-frontend
npm.cmd test -- --watchAll=false
npm.cmd run build
```

The backend route and validation tests do not require a live database. Importing starter data, registering users, publishing gifts, and other database-backed operations require MongoDB.

## Docker Compose

With Docker Desktop running, from the repository root set a private secret in the current PowerShell session and start the stack:

```powershell
$env:JWT_SECRET = node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
docker compose up --build
```

The web app is available at `http://localhost`, the API at `http://localhost:3060`, and the sentiment service at `http://localhost:3001`. The frontend container proxies `/api` requests to the backend. The MongoDB container stores its data in the named `giftlink-mongo-data` volume. Seed starter gifts in a separate terminal with:

```powershell
docker compose exec backend npm run seed
```

Do not remove the named volume if you need to preserve its data.

## CI

The GitHub Actions workflow runs backend and sentiment tests, frontend tests, and a frontend production build on pushes to `main` and pull requests. It does not require MongoDB for its current automated test set. The workflow must run in GitHub after changes are pushed; no CI result is implied by local edits.

## Deployment

The application is deployed on Render.

- Frontend: https://giftlink-frontend-jml3.onrender.com
- Backend: https://giftlink-backend-9171.onrender.com
- Database: MongoDB Atlas

Note: Render's free plan puts the services to sleep, so the first load can take 30 to 60 seconds.

## GitHub user stories

The repository issue template is `.github/ISSUE_TEMPLATE/user-story.md`. The eight prepared GiftLink user stories are tracked as issues #1–#8 in the public repository, each labeled `backlog`.
