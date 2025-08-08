using System;
using System.Collections.Generic;
using UnityEngine;
using MiniGameHub.Networking;

namespace MiniGameHub.Core
{
    /// <summary>
    /// Manages tournament state and coordinates with the networking layer
    /// </summary>
    public class TournamentManager : MonoBehaviour
    {
        [Header("Tournament Settings")]
        [SerializeField] private TournamentSettings defaultSettings;
        
        // Current tournament state
        public TournamentData CurrentTournament { get; private set; }
        public LeaderboardEntry[] CurrentLeaderboard { get; private set; }
        public Dictionary<string, GhostPlayer> GhostPlayers { get; private set; }
        
        // Events
        public event Action<TournamentData> OnTournamentJoined;
        public event Action<TournamentStartData> OnTournamentStarted;
        public event Action<LeaderboardEntry[]> OnLeaderboardUpdated;
        public event Action<string, Vector2> OnGhostPlayerMoved;
        
        // References
        private SocketClient socketClient;
        
        // State
        private bool isInTournament = false;
        private string currentPlayerId;
        private string playerName;
        
        private void Awake()
        {
            GhostPlayers = new Dictionary<string, GhostPlayer>();
            
            // Initialize default settings if not set
            if (defaultSettings == null)
            {
                defaultSettings = new TournamentSettings();
            }
        }
        
        private void Start()
        {
            // Find and connect to SocketClient
            socketClient = FindObjectOfType<SocketClient>();
            if (socketClient == null)
            {
                Debug.LogError("[TournamentManager] SocketClient not found!");
                return;
            }
            
            // Subscribe to socket events
            socketClient.OnTournamentJoined += HandleTournamentJoined;
            socketClient.OnTournamentStarted += HandleTournamentStarted;
            socketClient.OnLeaderboardUpdate += HandleLeaderboardUpdate;
            socketClient.OnGhostPositionUpdate += HandleGhostPositionUpdate;
            socketClient.OnPlayerScoreUpdate += HandlePlayerScoreUpdate;

            // Attempt to cache a simple user id (in a real app, this would be an auth id)
            if (!PlayerPrefs.HasKey("mgh.userId"))
            {
                PlayerPrefs.SetString("mgh.userId", System.Guid.NewGuid().ToString());
            }
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from socket events
            if (socketClient != null)
            {
                socketClient.OnTournamentJoined -= HandleTournamentJoined;
                socketClient.OnTournamentStarted -= HandleTournamentStarted;
                socketClient.OnLeaderboardUpdate -= HandleLeaderboardUpdate;
                socketClient.OnGhostPositionUpdate -= HandleGhostPositionUpdate;
                socketClient.OnPlayerScoreUpdate -= HandlePlayerScoreUpdate;
            }
        }
        
        /// <summary>
        /// Create a new tournament
        /// </summary>
        public void CreateTournament(string roomId, TournamentSettings settings = null)
        {
            if (socketClient == null || !socketClient.IsConnected)
            {
                Debug.LogError("[TournamentManager] Cannot create tournament - not connected");
                return;
            }
            
            var tournamentSettings = settings ?? defaultSettings;
            socketClient.CreateTournament(roomId, tournamentSettings);
            
            Debug.Log($"[TournamentManager] Creating tournament for room: {roomId}");
        }
        
        /// <summary>
        /// Join an existing tournament
        /// </summary>
        public void JoinTournament(string tournamentId, string playerDisplayName)
        {
            if (socketClient == null || !socketClient.IsConnected)
            {
                Debug.LogError("[TournamentManager] Cannot join tournament - not connected");
                return;
            }
            
            playerName = playerDisplayName;
            socketClient.JoinTournament(tournamentId, playerName);
            
            Debug.Log($"[TournamentManager] Joining tournament: {tournamentId} as {playerName}");
        }
        
        /// <summary>
        /// Start the current tournament (host only)
        /// </summary>
        public void StartTournament()
        {
            if (CurrentTournament == null)
            {
                Debug.LogError("[TournamentManager] No tournament to start");
                return;
            }
            
            if (socketClient == null || !socketClient.IsConnected)
            {
                Debug.LogError("[TournamentManager] Cannot start tournament - not connected");
                return;
            }
            
            socketClient.StartTournament(CurrentTournament.id);
            Debug.Log($"[TournamentManager] Starting tournament: {CurrentTournament.id}");
        }
        
        /// <summary>
        /// Send player position for ghost multiplayer
        /// </summary>
        public void UpdatePlayerPosition(Vector2 position)
        {
            if (!isInTournament || socketClient == null || !socketClient.IsConnected)
                return;
            
            socketClient.SendPlayerPosition(position);
        }
        
        /// <summary>
        /// Submit score for the current round
        /// </summary>
        public void SubmitScore(int score)
        {
            if (!isInTournament || socketClient == null || !socketClient.IsConnected)
            {
                Debug.LogError("[TournamentManager] Cannot submit score - not in tournament or not connected");
                return;
            }
            
            socketClient.SubmitScore(score);
            Debug.Log($"[TournamentManager] Submitting score: {score}");
        }
        
        /// <summary>
        /// Get ghost player data for rendering
        /// </summary>
        public GhostPlayer[] GetGhostPlayers()
        {
            var ghosts = new GhostPlayer[GhostPlayers.Count];
            var index = 0;
            foreach (var ghost in GhostPlayers.Values)
            {
                ghosts[index++] = ghost;
            }
            return ghosts;
        }
        
        /// <summary>
        /// Check if currently in a tournament
        /// </summary>
        public bool IsInTournament()
        {
            return isInTournament && CurrentTournament != null;
        }
        
        // Event Handlers
        
        private void HandleTournamentJoined(TournamentData tournament)
        {
            CurrentTournament = tournament;
            isInTournament = true;
            
            Debug.Log($"[TournamentManager] Joined tournament: {tournament.id}");
            OnTournamentJoined?.Invoke(tournament);
        }
        
        private void HandleTournamentStarted(TournamentStartData startData)
        {
            Debug.Log($"[TournamentManager] Tournament started - Round {startData.currentRound}/{startData.maxRounds} - Game: {startData.game}");
            OnTournamentStarted?.Invoke(startData);
        }
        
        private void HandleLeaderboardUpdate(LeaderboardData leaderboardData)
        {
            CurrentLeaderboard = leaderboardData.leaderboard;
            
            Debug.Log($"[TournamentManager] Leaderboard updated for round {leaderboardData.round}");
            OnLeaderboardUpdated?.Invoke(CurrentLeaderboard);
        }
        
        private void HandleGhostPositionUpdate(GhostPositionData ghostData)
        {
            // Update or create ghost player
            if (!GhostPlayers.ContainsKey(ghostData.playerId))
            {
                GhostPlayers[ghostData.playerId] = new GhostPlayer
                {
                    playerId = ghostData.playerId,
                    playerName = $"Player_{ghostData.playerId.Substring(0, 4)}",
                    position = ghostData.position,
                    lastUpdateTime = Time.time
                };
            }
            else
            {
                var ghost = GhostPlayers[ghostData.playerId];
                ghost.position = ghostData.position;
                ghost.lastUpdateTime = Time.time;
            }
            
            OnGhostPlayerMoved?.Invoke(ghostData.playerId, ghostData.position);
        }
        
        private void HandlePlayerScoreUpdate(PlayerScoreData scoreData)
        {
            Debug.Log($"[TournamentManager] Player {scoreData.playerId} scored {scoreData.score} (total: {scoreData.totalScore})");
        }
        
        /// <summary>
        /// Clean up old ghost players that haven't updated recently
        /// </summary>
        private void Update()
        {
            if (!isInTournament) return;
            
            // Remove ghost players that haven't updated in 5 seconds
            var playersToRemove = new List<string>();
            foreach (var kvp in GhostPlayers)
            {
                if (Time.time - kvp.Value.lastUpdateTime > 5f)
                {
                    playersToRemove.Add(kvp.Key);
                }
            }
            
            foreach (var playerId in playersToRemove)
            {
                GhostPlayers.Remove(playerId);
                Debug.Log($"[TournamentManager] Removed inactive ghost player: {playerId}");
            }
        }
    }
    
    /// <summary>
    /// Represents a ghost player for multiplayer visualization
    /// </summary>
    [System.Serializable]
    public class GhostPlayer
    {
        public string playerId;
        public string playerName;
        public Vector2 position;
        public float lastUpdateTime;
        
        // Visual properties
        public Color ghostColor = new Color(1f, 1f, 1f, 0.5f);
        public bool isActive = true;
    }
}
