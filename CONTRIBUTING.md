# Contributing

Thank you for your interest in contributing to this project! This guide will help you get the application running locally, understand the codebase structure, and follow our contribution guidelines.

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors and maintainers.

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- Git
- Node.js 22+ (for local development without Docker)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/example-three-tier-application.git
   cd example-three-tier-application
   ```

3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/thyndman-wwt/example-three-tier-application.git
   ```

4. **Start the application stack:**
   ```bash
   docker compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432 (internal only)
   - Express API on port 3001 (internal only)
   - Next.js frontend on port 3000 (http://localhost:3000)

5. **Verify the setup** by opening http://localhost:3000 in your browser

### Stopping the Application

```bash
# Stop containers (keeps the database volume)
docker compose down

# Stop and delete all data
docker compose down -v
```

## Development Workflow

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines (see below)

3. **Test your changes:**
   - Rebuild the application: `docker compose up --build`
   - Test manually in the browser
   - Run unit tests (see Testing section)

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: description of what you changed"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with a clear title and description

### Rebuilding After Code Changes

```bash
docker compose up --build
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f api
docker compose logs -f postgres
```

## Code Style Guidelines

### JavaScript/TypeScript

- Use **2-space indentation**
- Use **const** by default, **let** when reassignment is needed
- Use **arrow functions** for callbacks
- Add **JSDoc comments** to all exported functions
- Use **meaningful variable names**
- Keep functions small and focused

### JSDoc Comments

All exported functions must have JSDoc comments. Example:

```javascript
/**
 * Creates a new task
 * 
 * @param {string} title - The task title
 * @returns {Promise<Task>} The created task
 * @throws {Error} If title is invalid
 */
export async function createTask(title) {
  // implementation
}
```

### Input Validation

All API route handlers must validate their inputs:

```javascript
// ✓ Good
if (!title || typeof title !== 'string') {
  return res.status(400).json({ error: 'title must be a string' });
}

// ✗ Avoid
const title = req.body.title; // No validation
```

## Testing

### Running Tests

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

### Writing Tests

- Write unit tests for all new functions
- Test both success and error cases
- Use descriptive test names
- Aim for at least 80% code coverage

Example test:

```javascript
describe('createTask', () => {
  test('should create a task with valid title', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test');
  });

  test('should reject empty title', async () => {
    const res = await request(app).post('/tasks').send({ title: '' });
    expect(res.status).toBe(400);
  });
});
```

## Database Migrations

Migrations are managed using [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) and are located in `src/db/migrations/`.

### Creating a New Migration

```bash
cd src/db
npx node-pg-migrate create <migration_name>
```

This creates a new migration file in `src/db/migrations/` with `up` and `down` functions.

### Running Migrations

When using Docker Compose, migrations run automatically during startup. To run manually:

```bash
cd src/db
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up
```

### Migration Guidelines

- Write both `up` and `down` functions
- Use descriptive migration names
- Keep migrations small and focused
- Test migrations thoroughly

Example migration:

```javascript
exports.up = (pgm) => {
  pgm.createTable('tasks', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(500)', notNull: true },
    completed: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tasks');
};
```

## Project Structure

```
src/
├── api/            # Express REST API
│   ├── index.js    # Route handlers and middleware
│   ├── db.js       # PostgreSQL connection pool
│   ├── index.test.js    # Unit tests
│   ├── db.test.js       # Unit tests
│   └── Dockerfile
├── db/             # Database migrations
│   ├── migrations/ # Migration files
│   └── Dockerfile
├── web/            # Next.js frontend
│   ├── app/        # App Router pages and components
│   │   ├── actions.ts       # Server actions
│   │   ├── actions.test.ts  # Unit tests
│   │   ├── page.tsx         # Home page
│   │   └── layout.tsx       # Root layout
│   └── Dockerfile
└── infrastructure/ # Terraform for GCP deployment
```

## Commit Message Guidelines

Write clear, descriptive commit messages:

- Use the imperative mood ("Add feature" not "Added feature")
- Start with a capital letter
- Keep the first line under 50 characters
- Add a blank line before the body
- Explain what and why, not how

Example:

```
Add input validation to POST /tasks endpoint

- Validate title is a non-empty string
- Validate title does not exceed 500 characters
- Return 400 Bad Request with descriptive error messages
```

## Pull Request Process

1. **Update your branch** with the latest changes from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues
   - Screenshots or examples if applicable

4. **Respond to feedback** and make requested changes

5. **Ensure all checks pass** (tests, linting, etc.)

## Documentation

- Update the [README.md](README.md) if you change API endpoints or architecture
- Update the [CHANGELOG.md](CHANGELOG.md) with your changes
- Add JSDoc comments to all exported functions
- Keep comments clear and up-to-date

## Reporting Issues

When reporting bugs, please include:

- A clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Docker version, etc.)
- Screenshots or error messages if applicable

## Feature Requests

When suggesting features, please include:

- A clear description of the feature
- Why it would be useful
- Possible implementation approach
- Any potential drawbacks

## Questions?

- Check the [README.md](README.md) for general information
- Check the [API Documentation](README.md#api-documentation) for API details
- Open an issue to ask questions

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
