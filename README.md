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

| Command                 | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `yarn dev`              | Run with nodemon (auto-reload)                            |
| `yarn start`            | Production start (`NODE_ENV=production`)                  |
| `yarn test`             | **Drops every table** in the test DB, migrates, runs Jest |
| `yarn db:migrate`       | Run pending Sequelize migrations                          |
| `yarn db:seed`          | Run all seeders                                           |
| `yarn db:job`           | Migrate + run `startup/` ingestion (used by Render cron)  |
| `yarn db:migrate:reset` | **Drops every table**, re-migrates, re-seeds              |

### Destructive commands

`yarn test` and `yarn db:migrate:reset` both begin with `db:migrate:undo:all`, which runs
every migration's `down()` and drops the entire schema. Which database that hits is decided
by `NODE_ENV` plus the environment, so it is easy to get wrong — pointing at production is a
one-variable mistake.

Two things prevent that:

- The `test` config reads **`TEST_DB_URL` only**. It does not fall back to `DB_URL`, so a
  production `DB_URL` in your `.env` can never become the target of `yarn test`.
- Both commands run `scripts/assert-local-db.js` first, which resolves the connection they
  are about to use and aborts unless it is a disposable database on this machine: every
  candidate host (URL authority and any `?host=`) must be loopback or a unix socket, and
  under `NODE_ENV=test` the database name must contain `test`. Under `NODE_ENV=production`
  they are refused outright, with no override.

To override, set `ALLOW_DESTRUCTIVE_DB` to the **exact** database name, e.g.
`ALLOW_DESTRUCTIVE_DB=imagineriotest yarn test`. A bare `=1` deliberately does nothing, so
the variable cannot be blanket-set and quietly cover a later change of `DB_URL`. It is read
from the real environment only — a line in `.env` is ignored, so an override cannot become
ambient configuration — and it always prints a warning naming the database it is about to
destroy.

One limit worth knowing: the guard checks where the connection _points_, not what answers.
A port-forward or SSH tunnel listening on localhost that proxies to production will pass the
host check. The `test` config not falling back to `DB_URL` is the defence that does not
depend on this heuristic.

Forward-only `yarn db:migrate` and `yarn db:job` are **not** guarded — Render runs them
against production on every deploy and weekly, respectively.

## Environment

See `.env.example` for the full list. The most commonly missed:

- `DB_URL` — required outside dev (no default in `production`)
- `STARTUP=1` — turns on the ingestion pipeline at boot
- `MAPPING` — selects the site config (e.g. `rio`); used by seeders and `utils/mapProperties.js`
- `ARCGIS_API_KEY` — API key for the imagineRio_GDB FeatureServer; consumed by the seeders via `utils/arcgisClient.js`

## Rate limiting

Every request is rate limited per IP — `RATE_LIMIT_PER_MIN` requests per minute
(default 300), after which the API returns `429`. A static build of the
imagineRio site fans out far more than that in under a minute, so it needs a way
around the limit.

Set `RATE_LIMIT_BYPASS_TOKEN` on the API and have the build send the same value
as the `x-ratelimit-bypass` request header. Matching requests skip the limiter
entirely and are never counted. The comparison is constant-time, and with no
token configured no request can bypass — the limiter is unchanged. Keep the
token secret: anyone who has it can sidestep the limit.

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
utils/         # ArcGIS client, encoding fixers, property mapping
migrations/    # Sequelize migrations (28+)
seeders/       # Sequelize seeders that pull from ArcGIS feature services
startup/       # ingestion runner invoked when STARTUP env is set
tests/         # cross-cutting tests (route tests live next to their routes)
.devcontainer/ # VS Code dev container with PostGIS
render.yaml    # Render web + cron service definitions
```

## Deployment

Pushed to `main` triggers Render. Preview environments are enabled (`previewsEnabled: true` in `render.yaml`) — every PR gets a deploy. Health check path: `/health`.
