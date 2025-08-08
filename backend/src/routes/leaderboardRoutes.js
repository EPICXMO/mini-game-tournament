import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../database.js';

const router = express.Router();

const leaderboardLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

router.get('/leaderboard/:gameId', leaderboardLimiter, async (req, res) => {
  const ParamsSchema = z.object({ gameId: z.string().min(1) });
  const QuerySchema = z.object({ limit: z.string().regex(/^\d+$/).transform(Number).optional() });
  try {
    const { gameId } = ParamsSchema.parse(req.params);
    const { limit } = QuerySchema.parse(req.query);
    const top = Math.min(limit || 10, 50);

    const result = await query(
      `SELECT rs.user_id, MAX(rs.score) AS top_score
       FROM round_scores rs
       JOIN tournament_rounds tr ON tr.id = rs.round_id
       WHERE tr.game_id = $1
       GROUP BY rs.user_id
       ORDER BY top_score DESC
       LIMIT $2`,
      [gameId, top]
    );
    res.json({ success: true, data: { game: gameId, leaderboard: result.rows, total: result.rows.length } });
  } catch (err) {
    res.status(400).json({ success: false, error: 'INVALID_REQUEST' });
  }
});

export default router;


