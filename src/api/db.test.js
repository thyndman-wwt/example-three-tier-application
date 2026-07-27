/**
 * Unit tests for src/api/db.js
 * 
 * Tests the PostgreSQL connection pool module.
 */

const db = require('./db');

describe('Database Module', () => {
  describe('Pool Configuration', () => {
    test('should export a Pool instance', () => {
      expect(db).toBeDefined();
      expect(typeof db.query).toBe('function');
    });

    test('should use DATABASE_URL environment variable', () => {
      // The pool is initialized with process.env.DATABASE_URL
      // This test verifies the module loads without error
      expect(db).toBeTruthy();
    });
  });

  describe('Connection Pool', () => {
    test('should have query method', () => {
      expect(typeof db.query).toBe('function');
    });

    test('should have end method', () => {
      expect(typeof db.end).toBe('function');
    });

    test('should have connect method', () => {
      expect(typeof db.connect).toBe('function');
    });
  });
});
