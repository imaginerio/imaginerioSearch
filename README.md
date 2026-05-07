# imaginerioSearch

REST API powering search, document/feature lookup, thematic layers, and animations for [imagineRio](https://imaginerio.org). Express 4 + Sequelize 6 on PostgreSQL/PostGIS, deployed on Render.

## Stack

- **Runtime:** Node.js 20 LTS
- **Web:** Express 4
- **ORM:** Sequelize 6 (`pg` driver, PostGIS-aware models)
- **Tests:** Jest + supertest
- **Deploy:** Render (`render.yaml`) — web service + scheduled cron seeder

## Quick start

```bash
nvm use                  # picks up .nvmrc → Node 20
yarn install
cp .env.example .env     # then fill in DB_URL etc.
yarn db:migrate
yarn dev                 # nodemon on http://localhost:5000
```

A Postgres+PostGIS database is required. The `.devcontainer/` directory ships a working setup (VS Code Remote Containers): open the repo in a container and the DB is provisioned automatically.

## Scripts

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `yarn dev`              | Run with nodemon (auto-reload)                           |
| `yarn start`            | Production start (`NODE_ENV=production`)                 |
| `yarn test`             | Reset test DB, migrate, run Jest                         |
| `yarn db:migrate`       | Run pending Sequelize migrations                         |
| `yarn db:seed`          | Run all seeders                                          |
| `yarn db:job`           | Migrate + run `startup/` ingestion (used by Render cron) |
| `yarn db:migrate:reset` | Drop, re-migrate, re-seed                                |

## Environment

See `.env.example` for the full list. The most commonly missed:

- `DB_URL` — required outside dev (no default in `production`)
- `STARTUP=1` — turns on the ingestion pipeline at boot
- `MAPPING` — selects the site config (e.g. `rio`); used by seeders and `utils/mapProperties.js`
- `CLIENT_ID` / `USERNAME` / `PASSWORD` — credentials for the ArcGIS OAuth flow in `utils/auth.js`

## API surface

All routes are GET. Wired up via `server.js` auto-loading every directory under `routes/`.

| Route                        | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `/health`                    | Liveness + DB ping                          |
| `/search?text=&year=&lang=`  | Full-text search across layer features      |
| `/document/:id`              | One document as GeoJSON `FeatureCollection` |
| `/documents`                 | Document list/filter                        |
| `/feature/:id`               | Single feature lookup                       |
| `/layers`                    | Layer listing                               |
| `/metadata/:id`              | Per-image metadata                          |
| `/probe/:type/:location`     | Spatial probe                               |
| `/animations`                | Animation frame metadata                    |
| `/thematic`, `/thematic/:id` | Thematic layer data                         |

## Project layout

```
config/        # config.js (Sequelize), mappings, thematic + animation site configs
models/        # Sequelize models
routes/        # one folder per HTTP route, auto-loaded by server.js
utils/         # auth, encoding fixers, axios error helper, property mapping
migrations/    # Sequelize migrations (28+)
seeders/       # Sequelize seeders that pull from ArcGIS feature services
startup/       # ingestion runner invoked when STARTUP env is set
tests/         # cross-cutting tests (route tests live next to their routes)
.devcontainer/ # VS Code dev container with PostGIS
render.yaml    # Render web + cron service definitions
```

## Deployment

Pushed to `main` triggers Render. Preview environments are enabled (`previewsEnabled: true` in `render.yaml`) — every PR gets a deploy. Health check path: `/health`.
