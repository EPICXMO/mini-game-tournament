-- MiniGameHub Database Schema
-- PostgreSQL schema for storing game scores and user data

-- Users table (simplified for now)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game scores table
CREATE TABLE IF NOT EXISTS game_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    distance INTEGER DEFAULT 0,
    coins_collected INTEGER DEFAULT 0,
    game_time DECIMAL(10,3) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC);

-- Composite index for leaderboards
CREATE INDEX IF NOT EXISTS idx_game_scores_leaderboard ON game_scores(game_type, score DESC, created_at DESC);

-- Insert a default anonymous user for testing
INSERT INTO users (username, email) VALUES ('anonymous', 'anonymous@minigamehub.com')
ON CONFLICT (username) DO NOTHING;