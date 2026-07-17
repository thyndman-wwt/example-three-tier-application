const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/**
 * Health check endpoint
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @returns {void}
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /tasks — List all tasks
 * Retrieves all tasks from the database, ordered by creation date
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
app.get('/tasks', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /tasks — Create a new task
 * Creates a new task with the provided title
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - The title of the task (required, non-empty string)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
app.post('/tasks', async (req, res, next) => {
  try {
    const { title } = req.body;

    // Validate title is provided
    if (title === undefined || title === null) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Field "title" is required'
      });
    }

    // Validate title is a string
    if (typeof title !== 'string') {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Field "title" must be a string'
      });
    }

    // Validate title is not empty after trimming
    if (!title.trim()) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Field "title" cannot be empty or contain only whitespace'
      });
    }

    // Validate title length
    if (title.trim().length > 500) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Field "title" must not exceed 500 characters'
      });
    }

    const { rows } = await db.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /tasks/:id — Update a task
 * Updates a task's completion status and/or title
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The task ID (required, must be a valid positive integer)
 * @param {Object} req.body - Request body
 * @param {boolean} [req.body.completed] - Whether the task is completed (optional, must be boolean)
 * @param {string} [req.body.title] - The new title for the task (optional, must be non-empty string if provided)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
app.patch('/tasks/:id', async (req, res, next) => {
  try {
    const { id: idParam } = req.params;
    const { completed, title } = req.body;

    // Validate id parameter
    if (!idParam) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Path parameter "id" is required'
      });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Path parameter "id" must be a positive integer'
      });
    }

    // Validate completed field if provided
    if (completed !== undefined && completed !== null && typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Field "completed" must be a boolean'
      });
    }

    // Validate title field if provided
    if (title !== undefined && title !== null) {
      if (typeof title !== 'string') {
        return res.status(400).json({
          error: 'Validation error',
          details: 'Field "title" must be a string'
        });
      }

      if (!title.trim()) {
        return res.status(400).json({
          error: 'Validation error',
          details: 'Field "title" cannot be empty or contain only whitespace'
        });
      }

      if (title.trim().length > 500) {
        return res.status(400).json({
          error: 'Validation error',
          details: 'Field "title" must not exceed 500 characters'
        });
      }
    }

    // Check if task exists
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        details: `Task with id ${id} does not exist`
      });
    }

    const current = rows[0];
    const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
    const newTitle = title !== undefined ? title.trim() : current.title;

    const { rows: updated } = await db.query(
      'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
      [newCompleted, newTitle, id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /tasks/:id — Delete a task
 * Deletes a task by its ID
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The task ID (required, must be a valid positive integer)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id: idParam } = req.params;

    // Validate id parameter
    if (!idParam) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Path parameter "id" is required'
      });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Path parameter "id" must be a positive integer'
      });
    }

    // Check if task exists
    const { rows: existing } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        details: `Task with id ${id} does not exist`
      });
    }

    // Delete the task
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * Global error handling middleware
 * Catches and formats all errors from route handlers
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (unused)
 * @returns {void}
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Default to 500 Internal Server Error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    details: 'An unexpected error occurred. Please try again later.'
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
