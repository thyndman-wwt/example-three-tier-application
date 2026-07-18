# Contributing

Thank you for your interest in contributing to this project!

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### Running Locally

To start all services (PostgreSQL, API, and web frontend):

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Making Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test them locally with `docker compose up --build`

3. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "Brief description of your changes"
   ```

## Opening a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the [repository on GitHub](https://github.com/thyndman-wwt/example-three-tier-application)

3. Click the **"New pull request"** button

4. Select your branch and provide:
   - A clear title describing your changes
   - A description of what you changed and why

5. Submit the pull request for review

## Project Structure

- **`src/web/`** — Next.js frontend
- **`src/api/`** — Express REST API
- **`src/db/`** — Database migrations
- **`src/infrastructure/`** — Terraform configuration for GCP deployment

For more details, see [README.md](README.md).
