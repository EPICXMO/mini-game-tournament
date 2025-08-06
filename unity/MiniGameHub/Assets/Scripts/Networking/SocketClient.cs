using System;
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
        
        private void OnDestroy()
        {
            if (IsConnected)
            {
                Disconnect();
            }
        }
    }
}