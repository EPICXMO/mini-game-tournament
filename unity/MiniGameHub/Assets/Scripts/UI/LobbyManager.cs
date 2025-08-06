using UnityEngine;
using MiniGameHub.Networking;

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
            
            // Subscribe to connection events
            socketClient.OnConnected += OnConnectedToServer;
            socketClient.OnDisconnected += OnDisconnectedFromServer;
            socketClient.OnError += OnConnectionError;
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
        
        /// <summary>
        /// Simple immediate mode GUI for testing
        /// </summary>
        private void OnGUI()
        {
            GUILayout.BeginArea(new Rect(50, 50, 200, 300));
            
            GUILayout.Label("Mini Game Hub - Lobby", GUILayout.Height(30));
            GUILayout.Space(20);
            
            // Connection status
            string connectionStatus = socketClient != null && socketClient.IsConnected ? "Connected" : "Disconnected";
            GUILayout.Label($"Status: {connectionStatus}");
            GUILayout.Space(10);
            
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
            // Unsubscribe from events
            if (socketClient != null)
            {
                socketClient.OnConnected -= OnConnectedToServer;
                socketClient.OnDisconnected -= OnDisconnectedFromServer;
                socketClient.OnError -= OnConnectionError;
            }
        }
    }
}