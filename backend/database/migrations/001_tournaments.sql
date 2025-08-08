CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_players (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_rounds (
  id UUID PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  idx INT NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS round_scores (
  round_id UUID NOT NULL REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  score INT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (round_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON tournament_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_round_scores_round ON round_scores(round_id);

-- Leaderboard helper index (example: by game across rounds if stored elsewhere)
-- This schema keeps per-round scores; aggregation will JOIN rounds by game_id.

