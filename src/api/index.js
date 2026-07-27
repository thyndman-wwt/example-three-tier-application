const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/**
 * Health check endpoint
 * @param {express.Request} _req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void}
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /tasks — List all tasks
 * Retrieves all tasks from the database, ordered by creation date.
 * @param {express.Request} _req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
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
 * Creates a new task with the provided title.
 * 
 * @param {express.Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Task title (required, non-empty string)
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @throws {Error} 400 - If title is missing, not a string, or empty
 * @throws {Error} 500 - If database operation fails
 */
app.post('/tasks', async (req, res, next) => {
  try {
    // Input validation
    const { title } = req.body;
    
    if (title === undefined || title === null) {
      return res.status(400).json({ error: 'title is required' });
    }
    
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'title must be a string' });
    }
    
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    
    if (trimmedTitle.length > 500) {
      return res.status(400).json({ error: 'title cannot exceed 500 characters' });
    }

    const { rows } = await db.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [trimmedTitle]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /tasks/:id — Update a task
 * Updates a task's completion status and/or title.
 * 
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - Task ID (required, must be a valid integer)
 * @param {Object} req.body - Request body
 * @param {boolean} [req.body.completed] - Task completion status (optional)
 * @param {string} [req.body.title] - Task title (optional, non-empty string if provided)
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @throws {Error} 400 - If ID is invalid, or if title/completed have invalid types
 * @throws {Error} 404 - If task with given ID is not found
 * @throws {Error} 500 - If database operation fails
 */
app.patch('/tasks/:id', async (req, res, next) => {
  try {
    // Input validation for ID
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'id must be a valid positive integer' });
    }

    const { completed, title } = req.body;

    // Validate completed field if provided
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    // Validate title field if provided
    if (title !== undefined) {
      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'title must be a string' });
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        return res.status(400).json({ error: 'title cannot be empty' });
      }
      if (trimmedTitle.length > 500) {
        return res.status(400).json({ error: 'title cannot exceed 500 characters' });
      }
    }

    // Check if task exists
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
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
 * Global error handling middleware
 * Catches all errors from route handlers and returns appropriate HTTP responses.
 * 
 * @param {Error} err - The error object
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function (unused)
 * @returns {void}
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default to 500 Internal Server Error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

module.exports = app;
