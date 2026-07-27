const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Constants for validation
const MAX_TITLE_LENGTH = 120;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /tasks — create a task
app.post('/tasks', async (req, res, next) => {
  try {
    const { title } = req.body;
    
    // Validate title is provided and is a string
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }
    
    // Validate title is not empty or whitespace-only
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    
    // Validate title is not too long
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ 
        error: `title cannot exceed ${MAX_TITLE_LENGTH} characters` 
      });
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

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { completed, title } = req.body;

    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

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

// Global error handling middleware
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
