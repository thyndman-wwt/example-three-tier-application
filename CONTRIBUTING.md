# Contributing

Thank you for your interest in contributing to this project! This guide will help you get the application running locally and understand how to work with database migrations.

## Running the App Locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### Start the Application

To start all services (PostgreSQL, API, and web frontend):

```bash
docker compose up --build
```

This command will:
1. Start a PostgreSQL 17 database
2. Run database migrations automatically
3. Start the Express API on port 3001 (internal only)
4. Start the Next.js frontend on port 3000

Once running, open [http://localhost:3000](http://localhost:3000) in your browser.

### Stop the Application

```bash
# Stop containers (keeps the database volume)
docker compose down

# Stop and delete all data
docker compose down -v
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

## Database Migrations

Migrations are managed using [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) and are located in `src/db/migrations/`.

### Running Migrations

When using Docker Compose, migrations run automatically during startup via the `migrate` service. However, you can also run them manually:

```bash
# Apply all pending migrations
cd src/db
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up

# Roll back the last migration
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate down
```

### Creating a New Migration

To create a new migration file:

```bash
cd src/db
npx node-pg-migrate create <migration_name>
```

This will create a new migration file in `src/db/migrations/` that you can edit to define your schema changes.

## Project Structure

- **`src/web/`** — Next.js frontend (React 19, Tailwind CSS)
- **`src/api/`** — Express REST API
- **`src/db/`** — Database migrations
- **`src/infrastructure/`** — Terraform configuration for GCP deployment

## Questions?

Refer to the [README.md](README.md) for more detailed information about the architecture, API endpoints, and deployment to GCP.
