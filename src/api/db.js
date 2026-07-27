const { Pool } = require('pg');

/**
 * PostgreSQL connection pool
 * 
 * Manages a pool of connections to the PostgreSQL database.
 * The connection string is read from the DATABASE_URL environment variable.
 * 
 * @type {Pool}
 * 
 * @example
 * const db = require('./db');
 * const result = await db.query('SELECT * FROM tasks');
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
