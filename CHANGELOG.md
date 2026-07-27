# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive JSDoc comments for all exported functions
- Enhanced input validation for all API route handlers
- Unit test files for each module (API, database, web actions)
- Full API documentation in README with examples and status codes
- Comprehensive CONTRIBUTING.md with development guidelines
- CHANGELOG.md for tracking changes and releases

### Changed
- Improved error messages for API validation failures
- Enhanced POST /tasks validation with character limit checks
- Enhanced PATCH /tasks/:id validation with type checking

### Fixed
- Better error handling in API route handlers
- More descriptive validation error messages

## [1.0.0] - 2024-06-15

### Added
- Initial release of three-tier application
- Next.js 16 frontend with React 19 and Tailwind CSS
- Express 5 REST API with Node.js 22
- PostgreSQL 17 database with node-pg-migrate
- Docker Compose configuration for local development
- Terraform infrastructure for GCP deployment (Cloud Run + Cloud SQL)
- Task manager application (to-do list)
- API endpoints:
  - GET /health - Health check
  - GET /tasks - List all tasks
  - POST /tasks - Create a new task
  - PATCH /tasks/:id - Update a task
- Database migrations for users and tasks tables
- MIT License

### Features

#### Frontend (Next.js)
- Task list display
- Add new task form
- Toggle task completion status
- Task counter showing completed/total tasks
- Dark mode support with Tailwind CSS
- Responsive design

#### API (Express)
- RESTful endpoints for task management
- PostgreSQL integration
- Error handling middleware
- JSON request/response format

#### Database (PostgreSQL)
- Users table with email and timestamps
- Tasks table with title, completion status, and timestamps
- Automatic timestamp management

#### Infrastructure (Terraform)
- GCP VPC network and subnet
- Cloud SQL PostgreSQL instance
- Cloud Run services for API and web frontend
- Secret Manager for database credentials
- Service accounts and IAM bindings
- Configurable environment (dev/staging/prod)

### Documentation
- README with architecture overview
- Local development setup guide
- API endpoint documentation
- Database migration guide
- GCP deployment instructions
- Contributing guidelines

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

## Release Process

1. Update version numbers in `package.json` files
2. Update CHANGELOG.md with changes
3. Create a git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with changelog

## Future Roadmap

Potential improvements for future releases:

- [ ] User authentication and authorization
- [ ] Task categories/tags
- [ ] Task due dates and reminders
- [ ] Task search and filtering
- [ ] Pagination for large task lists
- [ ] Rate limiting for API
- [ ] API documentation with Swagger/OpenAPI
- [ ] End-to-end tests with Cypress
- [ ] Performance monitoring and logging
- [ ] Database connection pooling optimization
- [ ] Caching layer (Redis)
- [ ] GraphQL API alternative
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Task sharing and collaboration
- [ ] Recurring tasks
- [ ] Task attachments
- [ ] Email notifications

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
