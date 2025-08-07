/**
 * Tournament Service - Manages tournament rounds, scoring, and leaderboards
 */

class TournamentService {
  constructor() {
    this.tournaments = new Map(); // tournamentId -> tournament data
    this.players = new Map(); // playerId -> player data
  }

  /**
   * Create a new tournament
   */
  createTournament(roomId, settings = {}) {
    const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tournament = {
      id: tournamentId,
      roomId,
      status: 'waiting', // waiting, active, completed
      currentRound: 0,
      maxRounds: settings.maxRounds || 10,
      players: new Map(),
      rounds: [],
      leaderboard: [],
      createdAt: new Date().toISOString(),
      settings: {
        autoStartDelay: settings.autoStartDelay || 5000, // 5 seconds
        roundDuration: settings.roundDuration || 60000, // 60 seconds
        gameRotation: settings.gameRotation || ['jetpack'], // available mini-games
        ...settings
      }
    };

    this.tournaments.set(tournamentId, tournament);
    console.log(`[Tournament] Created tournament: ${tournamentId} for room: ${roomId}`);
    
    return tournament;
  }

  /**
   * Add player to tournament
   */
  addPlayer(tournamentId, playerId, playerData = {}) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'waiting') {
      throw new Error('Cannot join tournament in progress');
    }

    const player = {
      id: playerId,
      name: playerData.name || `Player_${playerId.substr(-4)}`,
      totalScore: 0,
      roundScores: [],
      position: { x: 0, y: 0 },
      gameState: 'idle', // idle, playing, finished, eliminated
      joinedAt: new Date().toISOString(),
      ...playerData
    };

    tournament.players.set(playerId, player);
    this.players.set(playerId, { ...player, tournamentId });

    console.log(`[Tournament] Player ${playerId} joined tournament: ${tournamentId}`);
    return player;
  }

  /**
   * Remove player from tournament
   */
  removePlayer(tournamentId, playerId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return false;

    tournament.players.delete(playerId);
    this.players.delete(playerId);

    console.log(`[Tournament] Player ${playerId} left tournament: ${tournamentId}`);
    return true;
  }

  /**
   * Start tournament
   */
  startTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.players.size === 0) {
      throw new Error('Cannot start tournament with no players');
    }

    tournament.status = 'active';
    tournament.startedAt = new Date().toISOString();
    
    // Start first round
    this.startNextRound(tournamentId);
    
    console.log(`[Tournament] Started tournament: ${tournamentId} with ${tournament.players.size} players`);
    return tournament;
  }

  /**
   * Start next round
   */
  startNextRound(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    tournament.currentRound++;
    
    if (tournament.currentRound > tournament.maxRounds) {
      return this.completeTournament(tournamentId);
    }

    // Select mini-game for this round (rotate through available games)
    const gameIndex = (tournament.currentRound - 1) % tournament.settings.gameRotation.length;
    const selectedGame = tournament.settings.gameRotation[gameIndex];

    const round = {
      number: tournament.currentRound,
      game: selectedGame,
      status: 'active',
      startedAt: new Date().toISOString(),
      playerStates: new Map(),
      scores: new Map()
    };

    // Initialize player states for this round
    tournament.players.forEach((player, playerId) => {
      player.gameState = 'playing';
      round.playerStates.set(playerId, {
        position: { x: 0, y: 0 },
        score: 0,
        status: 'playing'
      });
    });

    tournament.rounds.push(round);
    
    console.log(`[Tournament] Started round ${tournament.currentRound}/${tournament.maxRounds} (${selectedGame}) for tournament: ${tournamentId}`);
    return round;
  }

  /**
   * Update player position (for ghost multiplayer)
   */
  updatePlayerPosition(playerId, position) {
    const playerData = this.players.get(playerId);
    if (!playerData) return false;

    const tournament = this.tournaments.get(playerData.tournamentId);
    if (!tournament) return false;

    const player = tournament.players.get(playerId);
    if (player) {
      player.position = { ...position, timestamp: Date.now() };
      
      // Update current round state if active
      const currentRound = tournament.rounds[tournament.currentRound - 1];
      if (currentRound && currentRound.status === 'active') {
        const playerState = currentRound.playerStates.get(playerId);
        if (playerState) {
          playerState.position = player.position;
        }
      }
    }

    return true;
  }

  /**
   * Submit player score for current round
   */
  submitRoundScore(playerId, score) {
    const playerData = this.players.get(playerId);
    if (!playerData) return false;

    const tournament = this.tournaments.get(playerData.tournamentId);
    if (!tournament) return false;

    const currentRound = tournament.rounds[tournament.currentRound - 1];
    if (!currentRound || currentRound.status !== 'active') return false;

    // Update round score
    currentRound.scores.set(playerId, score);
    
    // Update player state
    const playerState = currentRound.playerStates.get(playerId);
    if (playerState) {
      playerState.score = score;
      playerState.status = 'finished';
    }

    // Update player total
    const player = tournament.players.get(playerId);
    if (player) {
      player.gameState = 'finished';
      player.roundScores.push(score);
      player.totalScore += score;
    }

    console.log(`[Tournament] Player ${playerId} submitted score: ${score} for round ${tournament.currentRound}`);
    
    // Check if all players finished
    this.checkRoundCompletion(playerData.tournamentId);
    
    return true;
  }

  /**
   * Check if current round is complete
   */
  checkRoundCompletion(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const currentRound = tournament.rounds[tournament.currentRound - 1];
    if (!currentRound || currentRound.status !== 'active') return;

    // Check if all players have finished
    const allFinished = Array.from(tournament.players.keys()).every(playerId => {
      const playerState = currentRound.playerStates.get(playerId);
      return playerState && playerState.status === 'finished';
    });

    if (allFinished) {
      currentRound.status = 'completed';
      currentRound.completedAt = new Date().toISOString();
      
      // Update leaderboard
      this.updateLeaderboard(tournamentId);
      
      console.log(`[Tournament] Round ${tournament.currentRound} completed for tournament: ${tournamentId}`);
      
      // Auto-start next round after delay
      setTimeout(() => {
        this.startNextRound(tournamentId);
      }, 3000); // 3 second delay between rounds
    }
  }

  /**
   * Update tournament leaderboard
   */
  updateLeaderboard(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    const leaderboard = Array.from(tournament.players.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        totalScore: player.totalScore,
        roundScores: [...player.roundScores],
        lastRoundScore: player.roundScores[player.roundScores.length - 1] || 0
      }));

    tournament.leaderboard = leaderboard;
    return leaderboard;
  }

  /**
   * Complete tournament
   */
  completeTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    tournament.status = 'completed';
    tournament.completedAt = new Date().toISOString();
    
    // Final leaderboard update
    this.updateLeaderboard(tournamentId);
    
    console.log(`[Tournament] Completed tournament: ${tournamentId}`);
    return tournament;
  }

  /**
   * Get tournament data
   */
  getTournament(tournamentId) {
    return this.tournaments.get(tournamentId);
  }

  /**
   * Get tournament for room
   */
  getTournamentByRoom(roomId) {
    for (const tournament of this.tournaments.values()) {
      if (tournament.roomId === roomId) {
        return tournament;
      }
    }
    return null;
  }

  /**
   * Get player data
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Get all players in tournament
   */
  getTournamentPlayers(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    return tournament ? Array.from(tournament.players.values()) : [];
  }

  /**
   * Get ghost data for all players (for multiplayer sync)
   */
  getGhostData(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return [];

    return Array.from(tournament.players.values()).map(player => ({
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      gameState: player.gameState,
      score: player.totalScore
    }));
  }

  /**
   * Clean up completed tournaments (call periodically)
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [tournamentId, tournament] of this.tournaments.entries()) {
      const tournamentAge = now - new Date(tournament.createdAt).getTime();
      
      if (tournament.status === 'completed' && tournamentAge > maxAge) {
        // Remove all players from this tournament
        tournament.players.forEach((player, playerId) => {
          this.players.delete(playerId);
        });
        
        this.tournaments.delete(tournamentId);
        console.log(`[Tournament] Cleaned up old tournament: ${tournamentId}`);
      }
    }
  }
}

// Create singleton instance
const tournamentService = new TournamentService();

// Clean up every hour
setInterval(() => {
  tournamentService.cleanup();
}, 60 * 60 * 1000);

export default tournamentService;
