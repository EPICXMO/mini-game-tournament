using UnityEngine;
using MiniGameHub.Networking;
using MiniGameHub.Core;

namespace MiniGameHub.UI
{
    /// <summary>
    /// Manages the lobby UI and interactions
    /// </summary>
    public class LobbyManager : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private GameObject joinButton;
        [SerializeField] private GameObject createButton;
        
        [Header("Networking")]
        [SerializeField] private SocketClient socketClient;
        
        [Header("Tournament")]
        [SerializeField] private TournamentManager tournamentManager;
        
        // UI State
        private string currentRoomId;
        private string playerName = "Player";
        private bool isInRoom = false;
        
        private void Start()
        {
            InitializeUI();
            SetupNetworking();
        }
        
        /// <summary>
        /// Initialize the UI elements
        /// </summary>
        private void InitializeUI()
        {
            // Create placeholder buttons using Unity's immediate mode GUI for now
            // In a real implementation, these would be proper UI GameObjects
            Debug.Log("[LobbyManager] Lobby UI initialized with Join and Create buttons");
        }
        
        /// <summary>
        /// Set up networking connections
        /// </summary>
        private void SetupNetworking()
        {
            if (socketClient == null)
            {
                socketClient = FindObjectOfType<SocketClient>();
                if (socketClient == null)
                {
                    // Create a SocketClient if one doesn't exist
                    GameObject socketGO = new GameObject("SocketClient");
                    socketClient = socketGO.AddComponent<SocketClient>();
                }
            }
            
            if (tournamentManager == null)
            {
                tournamentManager = FindObjectOfType<TournamentManager>();
                if (tournamentManager == null)
                {
                    // Create a TournamentManager if one doesn't exist
                    GameObject tournamentGO = new GameObject("TournamentManager");
                    tournamentManager = tournamentGO.AddComponent<TournamentManager>();
                }
            }
            
            // Subscribe to connection events
            socketClient.OnConnected += OnConnectedToServer;
            socketClient.OnDisconnected += OnDisconnectedFromServer;
            socketClient.OnError += OnConnectionError;
            
            // Subscribe to tournament events
            if (tournamentManager != null)
            {
                tournamentManager.OnTournamentJoined += OnTournamentJoined;
                tournamentManager.OnTournamentStarted += OnTournamentStarted;
                tournamentManager.OnLeaderboardUpdated += OnLeaderboardUpdated;
            }
        }
        
        /// <summary>
        /// Called when Join Room button is clicked
        /// </summary>
        public void OnJoinRoomClicked()
        {
            Debug.Log("[LobbyManager] Join Room button clicked");
            
            if (socketClient != null && socketClient.IsConnected)
            {
                socketClient.Emit("join_room", new { roomId = "default" });
                currentRoomId = "default";
                isInRoom = true;
            }
            else
            {
                Debug.LogWarning("[LobbyManager] Cannot join room - not connected to server");
            }
        }
        
        /// <summary>
        /// Called when Create Room button is clicked
        /// </summary>
        public void OnCreateRoomClicked()
        {
            Debug.Log("[LobbyManager] Create Room button clicked");
            
            if (socketClient != null && socketClient.IsConnected)
            {
                socketClient.Emit("create_room", new { roomName = "New Room" });
                // Room ID will be set when we receive the room_created event
                isInRoom = true;
            }
            else
            {
                Debug.LogWarning("[LobbyManager] Cannot create room - not connected to server");
            }
        }
        
        /// <summary>
        /// Called when connected to server
        /// </summary>
        private void OnConnectedToServer()
        {
            Debug.Log("[LobbyManager] Connected to server - enabling UI buttons");
            // Enable UI buttons when connected
        }
        
        /// <summary>
        /// Called when disconnected from server
        /// </summary>
        private void OnDisconnectedFromServer()
        {
            Debug.Log("[LobbyManager] Disconnected from server - disabling UI buttons");
            // Disable UI buttons when disconnected
        }
        
        /// <summary>
        /// Called when connection error occurs
        /// </summary>
        private void OnConnectionError(string error)
        {
            Debug.LogError($"[LobbyManager] Connection error: {error}");
        }
        
        // Tournament event handlers
        private void OnTournamentJoined(TournamentData tournament)
        {
            Debug.Log($"[LobbyManager] Joined tournament: {tournament.id}");
        }
        
        private void OnTournamentStarted(TournamentStartData startData)
        {
            Debug.Log($"[LobbyManager] Tournament started - switching to game scene");
            // TODO: Load the appropriate mini-game scene
        }
        
        private void OnLeaderboardUpdated(LeaderboardEntry[] leaderboard)
        {
            Debug.Log($"[LobbyManager] Leaderboard updated with {leaderboard.Length} entries");
        }
        
        /// <summary>
        /// Simple immediate mode GUI for testing
        /// </summary>
        private void OnGUI()
        {
            GUILayout.BeginArea(new Rect(50, 50, 300, 500));
            
            GUILayout.Label("Mini Game Hub - Lobby", GUILayout.Height(30));
            GUILayout.Space(20);
            
            // Connection status
            string connectionStatus = socketClient != null && socketClient.IsConnected ? "Connected" : "Disconnected";
            GUILayout.Label($"Status: {connectionStatus}");
            GUILayout.Space(10);
            
            // Player name input
            GUILayout.Label("Player Name:");
            playerName = GUILayout.TextField(playerName, GUILayout.Height(25));
            GUILayout.Space(10);
            
            // Room management
            if (!isInRoom)
            {
                // Join Room button
                if (GUILayout.Button("Join Room", GUILayout.Height(40)))
                {
                    OnJoinRoomClicked();
                }
                
                GUILayout.Space(10);
                
                // Create Room button
                if (GUILayout.Button("Create Room", GUILayout.Height(40)))
                {
                    OnCreateRoomClicked();
                }
            }
            else
            {
                GUILayout.Label($"Room: {currentRoomId}");
                GUILayout.Space(10);
                
                // Tournament management
                if (tournamentManager != null && !tournamentManager.IsInTournament())
                {
                    if (GUILayout.Button("Create Tournament", GUILayout.Height(40)))
                    {
                        tournamentManager.CreateTournament(currentRoomId);
                    }
                    
                    GUILayout.Space(10);
                    
                    // Mock tournament ID input for joining
                    GUILayout.Label("Tournament ID to Join:");
                    var tournamentId = GUILayout.TextField("", GUILayout.Height(25));
                    if (GUILayout.Button("Join Tournament", GUILayout.Height(30)))
                    {
                        if (!string.IsNullOrEmpty(tournamentId))
                        {
                            tournamentManager.JoinTournament(tournamentId, playerName);
                        }
                    }
                }
                else if (tournamentManager != null && tournamentManager.IsInTournament())
                {
                    GUILayout.Label("In Tournament!");
                    
                    if (tournamentManager.CurrentTournament.status == "waiting")
                    {
                        if (GUILayout.Button("Start Tournament", GUILayout.Height(40)))
                        {
                            tournamentManager.StartTournament();
                        }
                    }
                    
                    // Show leaderboard
                    if (tournamentManager.CurrentLeaderboard != null)
                    {
                        GUILayout.Space(10);
                        GUILayout.Label("Leaderboard:");
                        foreach (var entry in tournamentManager.CurrentLeaderboard)
                        {
                            GUILayout.Label($"{entry.rank}. {entry.playerName}: {entry.totalScore}");
                        }
                    }
                }
            }
            
            GUILayout.Space(20);
            
            // Manual connection controls
            if (socketClient != null)
            {
                if (!socketClient.IsConnected)
                {
                    if (GUILayout.Button("Connect", GUILayout.Height(30)))
                    {
                        socketClient.Connect();
                    }
                }
                else
                {
                    if (GUILayout.Button("Disconnect", GUILayout.Height(30)))
                    {
                        socketClient.Disconnect();
                    }
                    
                    if (GUILayout.Button("Send Ping", GUILayout.Height(30)))
                    {
                        socketClient.SendPing();
                    }
                }
            }
            
            GUILayout.EndArea();
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from socket events
            if (socketClient != null)
            {
                socketClient.OnConnected -= OnConnectedToServer;
                socketClient.OnDisconnected -= OnDisconnectedFromServer;
                socketClient.OnError -= OnConnectionError;
            }
            
            // Unsubscribe from tournament events
            if (tournamentManager != null)
            {
                tournamentManager.OnTournamentJoined -= OnTournamentJoined;
                tournamentManager.OnTournamentStarted -= OnTournamentStarted;
                tournamentManager.OnLeaderboardUpdated -= OnLeaderboardUpdated;
            }
        }
    }
}