import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import tournamentService from '../services/tournamentService.js';

const router = express.Router();
const statusLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

router.get('/tournament/:id/status', statusLimiter, (req, res) => {
  const ParamsSchema = z.object({ id: z.string().min(1) });
  try {
    const { id } = ParamsSchema.parse(req.params);
    const t = tournamentService.getTournament(id);
    if (!t) return res.status(404).json({ error: 'NOT_FOUND' });
    const payload = {
      id: t.id,
      currentRound: t.currentRound,
      leaderboard: t.leaderboard,
      players: Array.from(t.players.values()).map(p => ({ id: p.id, name: p.name, totalScore: p.totalScore })),
      rounds: t.rounds.map(r => ({ id: r.id, number: r.number, game: r.game, status: r.status }))
    };
    res.json({ success: true, data: payload });
  } catch {
    res.status(400).json({ error: 'INVALID_REQUEST' });
  }
});

export default router;


