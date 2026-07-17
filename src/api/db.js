const { Pool } = require('pg');

/**
 * PostgreSQL connection pool
 * Manages database connections using the DATABASE_URL environment variable
 * @type {Pool}
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
