using System;
using System.Collections.Generic;
using UnityEngine;

namespace MiniGameHub.Networking
{
    /// <summary>
    /// Socket.IO client wrapper for Unity
    /// Handles connection to the Node.js backend server
    /// </summary>
    public class SocketClient : MonoBehaviour
    {
        [Header("Connection Settings")]
        [SerializeField] private string serverUrl = "http://localhost:4000";
        [SerializeField] private bool autoConnect = true;
        
        // Events
        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action<string> OnError;
        
        // Tournament Events
        public event Action<TournamentData> OnTournamentCreated;
        public event Action<TournamentData> OnTournamentJoined;
        public event Action<TournamentStartData> OnTournamentStarted;
        public event Action<LeaderboardData> OnLeaderboardUpdate;
        public event Action<GhostPositionData> OnGhostPositionUpdate;
        public event Action<PlayerScoreData> OnPlayerScoreUpdate;
        
        // Connection state
        public bool IsConnected { get; private set; }
        
        private void Start()
        {
            if (autoConnect)
            {
                Connect();
            }
        }
        
        /// <summary>
        /// Connect to the server
        /// </summary>
        public void Connect()
        {
            Debug.Log($"[SocketClient] Attempting to connect to {serverUrl}");
            
            // TODO: Implement actual Socket.IO connection
            // For now, simulate connection after a delay
            Invoke(nameof(SimulateConnection), 1f);
        }
        
        /// <summary>
        /// Disconnect from the server
        /// </summary>
        public void Disconnect()
        {
            Debug.Log("[SocketClient] Disconnecting from server");
            
            // TODO: Implement actual disconnection
            IsConnected = false;
            OnDisconnected?.Invoke();
        }
        
        /// <summary>
        /// Send a ping to test connection
        /// </summary>
        public void SendPing()
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot send ping - not connected");
                return;
            }
            
            Debug.Log("[SocketClient] Sending ping to server");
            
            // TODO: Implement actual ping emission
            // For now, just log the action
        }
        
        /// <summary>
        /// Emit a custom event to the server
        /// </summary>
        /// <param name="eventName">Name of the event</param>
        /// <param name="data">Data to send (optional)</param>
        public void Emit(string eventName, object data = null)
        {
            if (!IsConnected)
            {
                Debug.LogWarning($"[SocketClient] Cannot emit '{eventName}' - not connected");
                return;
            }
            
            Debug.Log($"[SocketClient] Emitting event: {eventName}");
            
            // TODO: Implement actual event emission
        }
        
        /// <summary>
        /// Simulate connection for testing purposes
        /// </summary>
        private void SimulateConnection()
        {
            IsConnected = true;
            Debug.Log("[SocketClient] Connected to server (simulated)");
            OnConnected?.Invoke();
            
            // Send a test ping
            SendPing();
        }
        
        // Tournament Management Methods
        
        /// <summary>
        /// Create a new tournament
        /// </summary>
        public void CreateTournament(string roomId, TournamentSettings settings = null)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot create tournament - not connected");
                return;
            }
            
            var data = new Dictionary<string, object>
            {
                ["roomId"] = roomId
            };
            
            if (settings != null)
            {
                data["settings"] = settings.ToDictionary();
            }
            
            Emit("create_tournament", data);
            Debug.Log($"[SocketClient] Creating tournament for room: {roomId}");
        }
        
        /// <summary>
        /// Join an existing tournament
        /// </summary>
        public void JoinTournament(string tournamentId, string playerName)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot join tournament - not connected");
                return;
            }
            
            var data = new Dictionary<string, object>
            {
                ["tournamentId"] = tournamentId,
                ["playerName"] = playerName
            };
            
            Emit("join_tournament", data);
            Debug.Log($"[SocketClient] Joining tournament: {tournamentId} as {playerName}");
        }
        
        /// <summary>
        /// Start a tournament
        /// </summary>
        public void StartTournament(string tournamentId)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot start tournament - not connected");
                return;
            }
            
            var data = new Dictionary<string, object>
            {
                ["tournamentId"] = tournamentId
            };
            
            Emit("start_tournament", data);
            Debug.Log($"[SocketClient] Starting tournament: {tournamentId}");
        }
        
        /// <summary>
        /// Send player position for ghost multiplayer
        /// </summary>
        public void SendPlayerPosition(Vector2 position)
        {
            if (!IsConnected) return;
            
            var data = new Dictionary<string, object>
            {
                ["position"] = new Dictionary<string, object>
                {
                    ["x"] = position.x,
                    ["y"] = position.y
                }
            };
            
            Emit("player_position", data);
        }
        
        /// <summary>
        /// Submit score for current round
        /// </summary>
        public void SubmitScore(int score)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot submit score - not connected");
                return;
            }
            
            var data = new Dictionary<string, object>
            {
                ["score"] = score
            };
            
            Emit("submit_score", data);
            Debug.Log($"[SocketClient] Submitting score: {score}");
        }
        
        /// <summary>
        /// Get current tournament state
        /// </summary>
        public void GetTournamentState(string tournamentId)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[SocketClient] Cannot get tournament state - not connected");
                return;
            }
            
            var data = new Dictionary<string, object>
            {
                ["tournamentId"] = tournamentId
            };
            
            Emit("get_tournament_state", data);
        }
        
        private void OnDestroy()
        {
            if (IsConnected)
            {
                Disconnect();
            }
        }
    }
    
    // Data structures for tournament events
    [System.Serializable]
    public class TournamentData
    {
        public string id;
        public string roomId;
        public string status;
        public int maxRounds;
        public int playerCount;
    }
    
    [System.Serializable]
    public class TournamentStartData
    {
        public string tournamentId;
        public int currentRound;
        public int maxRounds;
        public string game;
    }
    
    [System.Serializable]
    public class LeaderboardData
    {
        public LeaderboardEntry[] leaderboard;
        public int round;
    }
    
    [System.Serializable]
    public class LeaderboardEntry
    {
        public int rank;
        public string playerId;
        public string playerName;
        public int totalScore;
        public int lastRoundScore;
    }
    
    [System.Serializable]
    public class GhostPositionData
    {
        public string playerId;
        public Vector2 position;
        public long timestamp;
    }
    
    [System.Serializable]
    public class PlayerScoreData
    {
        public string playerId;
        public int score;
        public int totalScore;
        public int round;
    }
    
    [System.Serializable]
    public class TournamentSettings
    {
        public int maxRounds = 10;
        public int autoStartDelay = 5000;
        public int roundDuration = 60000;
        public string[] gameRotation = { "jetpack" };
        
        public Dictionary<string, object> ToDictionary()
        {
            return new Dictionary<string, object>
            {
                ["maxRounds"] = maxRounds,
                ["autoStartDelay"] = autoStartDelay,
                ["roundDuration"] = roundDuration,
                ["gameRotation"] = gameRotation
            };
        }
    }
}