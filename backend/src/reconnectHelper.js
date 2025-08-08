import tournamentService from './services/tournamentService.js';

export function buildReconnectPayload(tournamentId) {
  const t = tournamentService.getTournament(tournamentId);
  if (!t) return null;
  return {
    tournament: {
      id: t.id,
      status: t.status,
      currentRound: t.currentRound,
      maxRounds: t.maxRounds,
      playerCount: t.players.size
    },
    leaderboard: t.leaderboard,
    ghostData: tournamentService.getGhostData(tournamentId)
  };
}


