import { query } from '../database.js';

export async function saveTournament(tournament) {
  try {
    await query(
      `INSERT INTO tournaments (id, state) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
      [tournament.id, JSON.stringify(tournament)]
    );
  } catch {}
}

export async function addTournamentPlayer(tournamentId, userId, displayName) {
  try {
    await query(
      `INSERT INTO tournament_players (tournament_id, user_id, display_name) VALUES ($1, $2, $3)
       ON CONFLICT (tournament_id, user_id) DO NOTHING`,
      [tournamentId, userId, displayName || null]
    );
  } catch {}
}

export async function createRound(roundId, tournamentId, gameId, idx, startedAt) {
  try {
    await query(
      `INSERT INTO tournament_rounds (id, tournament_id, game_id, idx, started_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [roundId, tournamentId, gameId, idx, startedAt]
    );
  } catch {}
}

export async function completeRound(roundId, endedAt) {
  try {
    await query(`UPDATE tournament_rounds SET ended_at = $2 WHERE id = $1`, [roundId, endedAt]);
  } catch {}
}

export async function submitRoundScore(roundId, userId, score, submittedAt) {
  try {
    await query(
      `INSERT INTO round_scores (round_id, user_id, score, submitted_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (round_id, user_id) DO UPDATE SET score = EXCLUDED.score, submitted_at = EXCLUDED.submitted_at`,
      [roundId, userId, score, submittedAt]
    );
  } catch {}
}


