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

// In-memory storage fallback for development
let inMemoryStorage = {
  users: [{ id: 1, username: 'anonymous', email: 'anonymous@minigamehub.com' }],
  game_scores: [],
  nextScoreId: 1
};

let isDatabaseAvailable = false;
let pool = null;

// Try to create connection pool
try {
  pool = new Pool(dbConfig);
} catch (error) {
  console.warn('⚠️  Database pool creation failed, using in-memory storage:', error.message);
}

// Handle pool errors
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    isDatabaseAvailable = false;
    console.warn('⚠️  Database connection lost, falling back to in-memory storage');
  });
}

/**
 * Execute query using in-memory storage (fallback when database is unavailable)
 */
async function executeInMemoryQuery(text, params = []) {
  const queryLower = text.toLowerCase().trim();
  
  // Handle INSERT queries for game_scores
  if (queryLower.includes('insert into game_scores')) {
    const [userId, gameType, score, distance, coinsCollected, gameTime, metadata] = params;
    const newScore = {
      id: inMemoryStorage.nextScoreId++,
      user_id: userId,
      game_type: gameType,
      score: score,
      distance: distance,
      coins_collected: coinsCollected,
      game_time: gameTime,
      metadata: metadata,
      created_at: new Date()
    };
    inMemoryStorage.game_scores.push(newScore);
    
    return {
      rows: [{ id: newScore.id, created_at: newScore.created_at }],
      rowCount: 1
    };
  }
  
  // Handle SELECT queries for leaderboard
  if (queryLower.includes('select') && queryLower.includes('game_scores')) {
    const [gameType, limit] = params;
    
    if (queryLower.includes('join users')) {
      // Leaderboard query
      const scores = inMemoryStorage.game_scores
        .filter(score => score.game_type === gameType)
        .sort((a, b) => b.score - a.score || new Date(a.created_at) - new Date(b.created_at))
        .slice(0, limit || 10)
        .map(score => ({
          ...score,
          username: 'anonymous'
        }));
        
      return { rows: scores, rowCount: scores.length };
    } else if (queryLower.includes('count')) {
      // Stats query
      const gameScores = inMemoryStorage.game_scores.filter(score => score.game_type === gameType);
      const stats = {
        total_plays: gameScores.length,
        average_score: gameScores.length > 0 ? gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length : 0,
        highest_score: gameScores.length > 0 ? Math.max(...gameScores.map(s => s.score)) : 0,
        lowest_score: gameScores.length > 0 ? Math.min(...gameScores.map(s => s.score)) : 0,
        average_time: gameScores.length > 0 ? gameScores.reduce((sum, s) => sum + (s.game_time || 0), 0) / gameScores.length : 0,
        unique_players: new Set(gameScores.map(s => s.user_id)).size
      };
      
      return { rows: [stats], rowCount: 1 };
    } else {
      // Other SELECT queries (user scores, etc.)
      const [userId, gameType, limit] = params;
      let scores = inMemoryStorage.game_scores;
      
      if (userId) scores = scores.filter(score => score.user_id === userId);
      if (gameType) scores = scores.filter(score => score.game_type === gameType);
      
      if (queryLower.includes('order by score desc')) {
        scores = scores.sort((a, b) => b.score - a.score);
      } else if (queryLower.includes('order by created_at desc')) {
        scores = scores.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      if (limit) scores = scores.slice(0, limit);
      
      return { rows: scores, rowCount: scores.length };
    }
  }
  
  // Handle other queries (like SELECT NOW())
  if (queryLower.includes('select now()')) {
    return { rows: [{ now: new Date() }], rowCount: 1 };
  }
  
  // Default fallback
  return { rows: [], rowCount: 0 };
}

/**
 * Initialize database with schema
 */
export async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    if (!pool) {
      console.warn('⚠️  No database pool available, using in-memory storage');
      isDatabaseAvailable = false;
      return true;
    }
    
    // Test database connection first
    await pool.query('SELECT NOW()');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    isDatabaseAvailable = true;
    console.log('✅ Database schema initialized successfully');
    
    return true;
  } catch (error) {
    console.warn('⚠️  Database initialization failed, using in-memory storage:', error.message);
    isDatabaseAvailable = false;
    return true; // Continue with in-memory storage
  }
}

/**
 * Execute a query with parameters
 */
export async function query(text, params) {
  const start = Date.now();
  
  // If database is not available, use in-memory storage
  if (!isDatabaseAvailable || !pool) {
    return await executeInMemoryQuery(text, params);
  }
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.warn('⚠️  Falling back to in-memory storage');
    isDatabaseAvailable = false;
    return await executeInMemoryQuery(text, params);
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  if (!pool) {
    throw new Error('Database pool not available - transactions not supported in in-memory mode');
  }
  return await pool.connect();
}

/**
 * Close the database pool
 */
export async function closePool() {
  if (pool) {
    await pool.end();
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck() {
  try {
    if (!isDatabaseAvailable || !pool) {
      return {
        status: 'healthy',
        mode: 'in-memory',
        timestamp: new Date().toISOString(),
        message: 'Using in-memory storage (database not available)'
      };
    }
    
    const result = await pool.query('SELECT NOW()');
    return {
      status: 'healthy',
      mode: 'database',
      timestamp: result.rows[0].now,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    isDatabaseAvailable = false;
    return {
      status: 'healthy',
      mode: 'in-memory',
      timestamp: new Date().toISOString(),
      message: 'Fallback to in-memory storage',
      error: error.message
    };
  }
}

export default pool;