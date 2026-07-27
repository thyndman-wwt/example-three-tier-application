# example-three-tier-application

A reference implementation of a three-tier web application: a Next.js frontend, an Express REST API, and a PostgreSQL database. It runs locally with Docker Compose and deploys to Google Cloud Platform (Cloud Run + Cloud SQL) via Terraform.

## Architecture

```
Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL
```

| Layer | Technology | Location |
|-------|-----------|----------|
| Frontend | Next.js 16, React 19, Tailwind CSS | `src/web/` |
| API | Express 5, Node.js 22 | `src/api/` |
| Database | PostgreSQL 17 | managed by Docker / Cloud SQL |
| Migrations | node-pg-migrate | `src/db/` |
| Infrastructure | Terraform (GCP) | `src/infrastructure/` |

The app is a simple task manager (to-do list) that demonstrates how the three tiers communicate.

## Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- Git

### Getting started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/thyndman-wwt/example-three-tier-application.git
   cd example-three-tier-application
   ```

2. **Start the application stack** with Docker Compose:
   ```bash
   docker compose up --build
   ```

   This command builds and starts four services:
   - **postgres** — PostgreSQL 17 database (port 5432, internal only)
   - **migrate** — runs `node-pg-migrate up` to apply schema migrations, then exits
   - **api** — Express API on port 3001 (internal only)
   - **web** — Next.js frontend on port 3000 (exposed to host)

3. **Open the application** in your browser:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the task manager application

4. **Stop the stack** when done:
   ```bash
   docker compose down
   ```

### Development workflow

**Rebuild after code changes:**
```bash
docker compose up --build
```

**View logs from all services:**
```bash
docker compose logs -f
```

**View logs from a specific service:**
```bash
docker compose logs -f web
docker compose logs -f api
docker compose logs -f postgres
```

**Stop the application** (keeps the database volume):
```bash
docker compose down
```

**Stop and delete all data** (including the database):
```bash
docker compose down -v
```

## API Documentation

The REST API provides endpoints for managing tasks. All endpoints return JSON responses.

### Base URL

- **Local development:** `http://localhost:3001`
- **Production:** Configured via `API_URL` environment variable

### Response Format

All successful responses return JSON with the requested data. Error responses include an `error` field with a descriptive message.

#### Success Response (2xx)
```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false,
  "created_at": "2024-06-15T10:30:00Z"
}
```

#### Error Response (4xx, 5xx)
```json
{
  "error": "Descriptive error message"
}
```

### Endpoints

#### Health Check

**GET** `/health`

Returns the health status of the API.

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

#### List All Tasks

**GET** `/tasks`

Retrieves all tasks from the database, ordered by creation date (oldest first).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Buy milk",
    "completed": false,
    "created_at": "2024-06-15T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Walk the dog",
    "completed": true,
    "created_at": "2024-06-15T11:00:00Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3001/tasks
```

---

#### Create a Task

**POST** `/tasks`

Creates a new task with the provided title.

**Request Body:**
```json
{
  "title": "Buy milk"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `title` | string | Yes | Non-empty, max 500 characters |

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false,
  "created_at": "2024-06-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — If `title` is missing, not a string, empty, or exceeds 500 characters
- `500 Internal Server Error` — If database operation fails

**Example:**
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk"}'
```

---

#### Update a Task

**PATCH** `/tasks/:id`

Updates a task's completion status and/or title.

**URL Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Positive integer, must exist |

**Request Body:**
```json
{
  "completed": true,
  "title": "Buy milk and eggs"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `completed` | boolean | No | Must be a boolean if provided |
| `title` | string | No | Non-empty, max 500 characters if provided |

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Buy milk and eggs",
  "completed": true,
  "created_at": "2024-06-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — If `id` is invalid, or if `completed`/`title` have invalid types
- `404 Not Found` — If task with given ID does not exist
- `500 Internal Server Error` — If database operation fails

**Examples:**

Mark task as completed:
```bash
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Update task title:
```bash
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk and eggs"}'
```

Update both:
```bash
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "title": "Buy milk and eggs"}'
```

---

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — Request succeeded |
| 201 | Created — Resource created successfully |
| 400 | Bad Request — Invalid input or validation error |
| 404 | Not Found — Resource does not exist |
| 500 | Internal Server Error — Server error |

### Input Validation

The API validates all inputs and returns descriptive error messages:

- **title** must be a non-empty string with a maximum of 500 characters
- **id** must be a positive integer
- **completed** must be a boolean value
- All fields are trimmed of leading/trailing whitespace

### Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider adding rate limiting middleware.

## Project structure

```
src/
├── api/            # Express REST API
│   ├── index.js    # Route handlers and middleware
│   ├── db.js       # PostgreSQL connection pool
│   ├── index.test.js    # Unit tests for routes
│   ├── db.test.js       # Unit tests for database module
│   └── Dockerfile
├── db/             # Database migrations
│   ├── migrations/ # node-pg-migrate migration files
│   └── Dockerfile
├── web/            # Next.js frontend
│   ├── app/        # App Router pages and components
│   │   ├── actions.ts       # Server actions
│   │   ├── actions.test.ts  # Unit tests for actions
│   │   ├── page.tsx         # Home page
│   │   └── layout.tsx       # Root layout
│   └── Dockerfile
└── infrastructure/ # Terraform for GCP deployment
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

## Testing

### Running Tests

Tests are configured for each module. To run tests locally:

**API tests:**
```bash
cd src/api
npm install
npm test
```

**Web tests:**
```bash
cd src/web
npm install
npm test
```

**Database tests:**
```bash
cd src/db
npm install
npm test
```

### Test Coverage

- **API routes:** Input validation, error handling, HTTP status codes
- **Database module:** Connection pool configuration and methods
- **Web actions:** Server action functionality, error handling, API integration

## Deploying to GCP

The `src/infrastructure/` directory contains Terraform that provisions:

- VPC network and subnet
- Cloud SQL PostgreSQL 17 instance (private IP)
- Cloud Run services for the API and web frontend
- Secret Manager secret for the database URL
- Service accounts and IAM bindings

### Required variables

| Variable | Description |
|----------|-------------|
| `project_id` | GCP project ID |
| `api_image` | Container image URI for the API (e.g. `gcr.io/PROJECT/api:TAG`) |
| `web_image` | Container image URI for the web frontend |
| `region` | GCP region (default: `us-central1`) |
| `environment` | `dev`, `staging`, or `prod` (default: `dev`) |

```bash
cd src/infrastructure
terraform init
terraform apply -var="project_id=my-project" \
                -var="api_image=gcr.io/my-project/api:latest" \
                -var="web_image=gcr.io/my-project/web:latest"
```

After apply, `terraform output web_url` gives the public URL.

## Database migrations

Migrations live in `src/db/migrations/` and use [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

```bash
# Apply all pending migrations (run inside the db container or with DATABASE_URL set)
cd src/db
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up

# Roll back the last migration
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate down
```

When running via Docker Compose the `migrate` service handles migrations automatically.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes and releases.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
