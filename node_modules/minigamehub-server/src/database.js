import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'minigamehub',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database with schema
 */
export async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema initialized successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

/**
 * Execute a query with parameters
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Close the database pool
 */
export async function closePool() {
  await pool.end();
}

/**
 * Health check for database connection
 */
export async function healthCheck() {
  try {
    const result = await pool.query('SELECT NOW()');
    return {
      status: 'healthy',
      timestamp: result.rows[0].now,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

export default pool;