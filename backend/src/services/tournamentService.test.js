import tournamentService from './tournamentService.js';

describe('TournamentService', () => {
  beforeEach(() => {
    // Clear all tournaments and players before each test
    tournamentService.tournaments.clear();
    tournamentService.players.clear();
  });

  describe('createTournament', () => {
    test('should create a new tournament with default settings', () => {
      const roomId = 'test-room-123';
      const tournament = tournamentService.createTournament(roomId);

      expect(tournament).toMatchObject({
        roomId,
        status: 'waiting',
        currentRound: 0,
        maxRounds: 10,
        settings: expect.objectContaining({
          autoStartDelay: 5000,
          roundDuration: 60000,
          gameRotation: ['jetpack']
        })
      });

      expect(tournament.id).toMatch(/^tournament_\d+_[a-z0-9]+$/);
      expect(tournament.players.size).toBe(0);
      expect(tournament.rounds).toEqual([]);
    });

    test('should create tournament with custom settings', () => {
      const roomId = 'test-room-123';
      const settings = {
        maxRounds: 5,
        gameRotation: ['jetpack', 'dino'],
        roundDuration: 30000
      };
      
      const tournament = tournamentService.createTournament(roomId, settings);

      expect(tournament.maxRounds).toBe(5);
      expect(tournament.settings.gameRotation).toEqual(['jetpack', 'dino']);
      expect(tournament.settings.roundDuration).toBe(30000);
    });
  });

  describe('addPlayer', () => {
    test('should add player to tournament', () => {
      const tournament = tournamentService.createTournament('room-123');
      const playerId = 'player-456';
      const playerData = { name: 'TestPlayer' };

      const player = tournamentService.addPlayer(tournament.id, playerId, playerData);

      expect(player).toMatchObject({
        id: playerId,
        name: 'TestPlayer',
        totalScore: 0,
        roundScores: [],
        gameState: 'idle'
      });

      expect(tournament.players.size).toBe(1);
      expect(tournament.players.get(playerId)).toBe(player);
      expect(tournamentService.players.get(playerId)).toMatchObject({
        ...player,
        tournamentId: tournament.id
      });
    });

    test('should throw error when tournament not found', () => {
      expect(() => {
        tournamentService.addPlayer('nonexistent-tournament', 'player-123');
      }).toThrow('Tournament not found');
    });

    test('should throw error when tournament is active', () => {
      const tournament = tournamentService.createTournament('room-123');
      tournament.status = 'active';

      expect(() => {
        tournamentService.addPlayer(tournament.id, 'player-123');
      }).toThrow('Cannot join tournament in progress');
    });
  });

  describe('startTournament', () => {
    test('should start tournament and first round', () => {
      const tournament = tournamentService.createTournament('room-123');
      tournamentService.addPlayer(tournament.id, 'player-1');
      tournamentService.addPlayer(tournament.id, 'player-2');

      const result = tournamentService.startTournament(tournament.id);

      expect(result.status).toBe('active');
      expect(result.currentRound).toBe(1);
      expect(result.rounds).toHaveLength(1);
      expect(result.rounds[0]).toMatchObject({
        number: 1,
        game: 'jetpack',
        status: 'active'
      });
    });

    test('should throw error when no players', () => {
      const tournament = tournamentService.createTournament('room-123');

      expect(() => {
        tournamentService.startTournament(tournament.id);
      }).toThrow('Cannot start tournament with no players');
    });
  });

  describe('updatePlayerPosition', () => {
    test('should update player position', () => {
      const tournament = tournamentService.createTournament('room-123');
      const playerId = 'player-123';
      tournamentService.addPlayer(tournament.id, playerId);
      
      const position = { x: 100, y: 200 };
      const result = tournamentService.updatePlayerPosition(playerId, position);

      expect(result).toBe(true);
      
      const player = tournament.players.get(playerId);
      expect(player.position).toMatchObject(position);
      expect(player.position.timestamp).toBeGreaterThan(0);
    });

    test('should return false for unknown player', () => {
      const result = tournamentService.updatePlayerPosition('unknown-player', { x: 0, y: 0 });
      expect(result).toBe(false);
    });
  });

  describe('submitRoundScore', () => {
    test('should submit score and update player data', () => {
      const tournament = tournamentService.createTournament('room-123');
      const playerId = 'player-123';
      tournamentService.addPlayer(tournament.id, playerId);
      tournamentService.startTournament(tournament.id);

      const score = 1500;
      const result = tournamentService.submitRoundScore(playerId, score);

      expect(result).toBe(true);
      
      const player = tournament.players.get(playerId);
      expect(player.totalScore).toBe(score);
      expect(player.roundScores).toEqual([score]);
      expect(player.gameState).toBe('finished');

      const currentRound = tournament.rounds[0];
      expect(currentRound.scores.get(playerId)).toBe(score);
    });

    test('should return false for unknown player', () => {
      const result = tournamentService.submitRoundScore('unknown-player', 1000);
      expect(result).toBe(false);
    });
  });

  describe('updateLeaderboard', () => {
    test('should create sorted leaderboard', () => {
      const tournament = tournamentService.createTournament('room-123');
      
      // Add players with different scores
      const player1 = tournamentService.addPlayer(tournament.id, 'player-1', { name: 'Alice' });
      const player2 = tournamentService.addPlayer(tournament.id, 'player-2', { name: 'Bob' });
      const player3 = tournamentService.addPlayer(tournament.id, 'player-3', { name: 'Charlie' });
      
      // Simulate scores
      player1.totalScore = 2000;
      player1.roundScores = [2000];
      player2.totalScore = 1500;
      player2.roundScores = [1500];
      player3.totalScore = 2500;
      player3.roundScores = [2500];

      const leaderboard = tournamentService.updateLeaderboard(tournament.id);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0]).toMatchObject({
        rank: 1,
        playerId: 'player-3',
        playerName: 'Charlie',
        totalScore: 2500
      });
      expect(leaderboard[1]).toMatchObject({
        rank: 2,
        playerId: 'player-1',
        playerName: 'Alice',
        totalScore: 2000
      });
      expect(leaderboard[2]).toMatchObject({
        rank: 3,
        playerId: 'player-2',
        playerName: 'Bob',
        totalScore: 1500
      });
    });
  });

  describe('getGhostData', () => {
    test('should return ghost data for all players', () => {
      const tournament = tournamentService.createTournament('room-123');
      
      const player1 = tournamentService.addPlayer(tournament.id, 'player-1', { name: 'Alice' });
      const player2 = tournamentService.addPlayer(tournament.id, 'player-2', { name: 'Bob' });
      
      player1.position = { x: 100, y: 200 };
      player1.totalScore = 1000;
      player2.position = { x: 150, y: 250 };
      player2.totalScore = 1200;

      const ghostData = tournamentService.getGhostData(tournament.id);

      expect(ghostData).toHaveLength(2);
      expect(ghostData).toContainEqual({
        playerId: 'player-1',
        playerName: 'Alice',
        position: { x: 100, y: 200 },
        gameState: 'idle',
        score: 1000
      });
      expect(ghostData).toContainEqual({
        playerId: 'player-2',
        playerName: 'Bob',
        position: { x: 150, y: 250 },
        gameState: 'idle',
        score: 1200
      });
    });

    test('should return empty array for unknown tournament', () => {
      const ghostData = tournamentService.getGhostData('unknown-tournament');
      expect(ghostData).toEqual([]);
    });
  });

  describe('completeTournament', () => {
    test('should complete tournament', () => {
      const tournament = tournamentService.createTournament('room-123');
      tournamentService.addPlayer(tournament.id, 'player-1');
      
      const result = tournamentService.completeTournament(tournament.id);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(result.leaderboard).toBeDefined();
    });
  });

  describe('removePlayer', () => {
    test('should remove player from tournament', () => {
      const tournament = tournamentService.createTournament('room-123');
      const playerId = 'player-123';
      tournamentService.addPlayer(tournament.id, playerId);

      expect(tournament.players.size).toBe(1);
      expect(tournamentService.players.has(playerId)).toBe(true);

      const result = tournamentService.removePlayer(tournament.id, playerId);

      expect(result).toBe(true);
      expect(tournament.players.size).toBe(0);
      expect(tournamentService.players.has(playerId)).toBe(false);
    });

    test('should return false for unknown tournament', () => {
      const result = tournamentService.removePlayer('unknown-tournament', 'player-123');
      expect(result).toBe(false);
    });
  });
});
