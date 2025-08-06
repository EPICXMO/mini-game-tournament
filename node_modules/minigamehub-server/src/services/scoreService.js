import { query } from '../database.js';

/**
 * Score Service - Handles all score-related database operations
 */
export class ScoreService {
  
  /**
   * Submit a new game score
   */
  static async submitScore(scoreData) {
    const {
      userId = 1, // Default to anonymous user
      gameType,
      score,
      distance = 0,
      coinsCollected = 0,
      gameTime = 0,
      metadata = {}
    } = scoreData;

    // Validate required fields
    if (!gameType || score === undefined || score === null) {
      throw new Error('Game type and score are required');
    }

    if (typeof score !== 'number' || score < 0) {
      throw new Error('Score must be a non-negative number');
    }

    const insertQuery = `
      INSERT INTO game_scores (user_id, game_type, score, distance, coins_collected, game_time, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `;

    try {
      const result = await query(insertQuery, [
        userId,
        gameType,
        score,
        distance,
        coinsCollected,
        gameTime,
        JSON.stringify(metadata)
      ]);

      return {
        id: result.rows[0].id,
        userId,
        gameType,
        score,
        distance,
        coinsCollected,
        gameTime,
        metadata,
        createdAt: result.rows[0].created_at
      };
    } catch (error) {
      console.error('Error submitting score:', error);
      throw new Error('Failed to submit score to database');
    }
  }

  /**
   * Get user's best score for a specific game
   */
  static async getUserBestScore(userId, gameType) {
    const selectQuery = `
      SELECT id, score, distance, coins_collected, game_time, metadata, created_at
      FROM game_scores
      WHERE user_id = $1 AND game_type = $2
      ORDER BY score DESC
      LIMIT 1
    `;

    try {
      const result = await query(selectQuery, [userId, gameType]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user best score:', error);
      throw new Error('Failed to retrieve best score');
    }
  }

  /**
   * Get leaderboard for a specific game
   */
  static async getLeaderboard(gameType, limit = 10) {
    const leaderboardQuery = `
      SELECT 
        gs.id,
        gs.score,
        gs.distance,
        gs.coins_collected,
        gs.game_time,
        gs.created_at,
        u.username
      FROM game_scores gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.game_type = $1
      ORDER BY gs.score DESC, gs.created_at ASC
      LIMIT $2
    `;

    try {
      const result = await query(leaderboardQuery, [gameType, limit]);
      return result.rows.map((row, index) => ({
        rank: index + 1,
        ...row
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to retrieve leaderboard');
    }
  }

  /**
   * Get user's recent scores for a specific game
   */
  static async getUserRecentScores(userId, gameType, limit = 5) {
    const recentQuery = `
      SELECT id, score, distance, coins_collected, game_time, metadata, created_at
      FROM game_scores
      WHERE user_id = $1 AND game_type = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    try {
      const result = await query(recentQuery, [userId, gameType, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent scores:', error);
      throw new Error('Failed to retrieve recent scores');
    }
  }

  /**
   * Get game statistics
   */
  static async getGameStats(gameType) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_plays,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        AVG(game_time) as average_time,
        COUNT(DISTINCT user_id) as unique_players
      FROM game_scores
      WHERE game_type = $1
    `;

    try {
      const result = await query(statsQuery, [gameType]);
      const stats = result.rows[0];
      
      return {
        totalPlays: parseInt(stats.total_plays),
        averageScore: parseFloat(stats.average_score) || 0,
        highestScore: parseInt(stats.highest_score) || 0,
        lowestScore: parseInt(stats.lowest_score) || 0,
        averageTime: parseFloat(stats.average_time) || 0,
        uniquePlayers: parseInt(stats.unique_players)
      };
    } catch (error) {
      console.error('Error getting game stats:', error);
      throw new Error('Failed to retrieve game statistics');
    }
  }
}