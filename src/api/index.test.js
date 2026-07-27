/**
 * Unit tests for src/api/index.js
 * 
 * Tests the Express API route handlers and middleware.
 */

const request = require('supertest');
const app = require('./index');

describe('API Routes', () => {
  describe('GET /health', () => {
    test('should return status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /tasks', () => {
    test('should reject request without title', async () => {
      const res = await request(app).post('/tasks').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title is required');
    });

    test('should reject request with non-string title', async () => {
      const res = await request(app).post('/tasks').send({ title: 123 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title must be a string');
    });

    test('should reject request with empty title', async () => {
      const res = await request(app).post('/tasks').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title cannot be empty');
    });

    test('should reject request with title exceeding 500 characters', async () => {
      const longTitle = 'a'.repeat(501);
      const res = await request(app).post('/tasks').send({ title: longTitle });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title cannot exceed 500 characters');
    });
  });

  describe('PATCH /tasks/:id', () => {
    test('should reject invalid task ID', async () => {
      const res = await request(app).patch('/tasks/invalid').send({ completed: true });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('id must be a valid positive integer');
    });

    test('should reject negative task ID', async () => {
      const res = await request(app).patch('/tasks/-1').send({ completed: true });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('id must be a valid positive integer');
    });

    test('should reject non-boolean completed value', async () => {
      const res = await request(app).patch('/tasks/1').send({ completed: 'yes' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('completed must be a boolean');
    });

    test('should reject non-string title', async () => {
      const res = await request(app).patch('/tasks/1').send({ title: 123 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title must be a string');
    });

    test('should reject empty title', async () => {
      const res = await request(app).patch('/tasks/1').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title cannot be empty');
    });

    test('should reject title exceeding 500 characters', async () => {
      const longTitle = 'a'.repeat(501);
      const res = await request(app).patch('/tasks/1').send({ title: longTitle });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('title cannot exceed 500 characters');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json');
      expect(res.status).toBe(400);
    });
  });
});
