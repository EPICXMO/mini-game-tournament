using UnityEngine;
using UnityEngine.UI;
using MiniGameHub.Core;
using MiniGameHub.Networking;

namespace MiniGameHub.Jetpack
{
    public class JetpackGameManager : MonoBehaviour
    {
        [Header("Game Settings")]
        [SerializeField] private float gameSpeed = 5f;
        [SerializeField] private float speedIncrement = 0.1f;
        [SerializeField] private float speedIncreaseInterval = 10f;
        
        [Header("Scoring")]
        [SerializeField] private int coinValue = 10;
        [SerializeField] private int distancePointsPerSecond = 1;
        
        [Header("UI")]
        [SerializeField] private Text scoreText;
        [SerializeField] private Text distanceText;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private Text finalScoreText;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button mainMenuButton;
        
        [Header("Game Objects")]
        [SerializeField] private JetpackPlayer player;
        [SerializeField] private ScrollingBackground background;
        [SerializeField] private ObstacleSpawner obstacleSpawner;
        
        // Game state
        private bool isGameActive = false;
        private float gameTime = 0f;
        private int currentScore = 0;
        private int coinsCollected = 0;
        private float distanceTraveled = 0f;
        private float lastSpeedIncrease = 0f;
        
        // Networking
        private SocketClient socketClient;
        
        void Start()
        {
            socketClient = FindObjectOfType<SocketClient>();
            
            if (restartButton != null)
                restartButton.onClick.AddListener(RestartGame);
            
            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(ReturnToMainMenu);
            
            StartGame();
        }
        
        void Update()
        {
            if (!isGameActive) return;
            
            UpdateGameTime();
            UpdateSpeed();
            UpdateScore();
            UpdateUI();
        }
        
        void UpdateGameTime()
        {
            gameTime += Time.deltaTime;
            distanceTraveled = gameTime * gameSpeed;
        }
        
        void UpdateSpeed()
        {
            if (gameTime - lastSpeedIncrease >= speedIncreaseInterval)
            {
                gameSpeed += speedIncrement;
                lastSpeedIncrease = gameTime;
                
                // Update background and obstacle spawner speeds
                if (background != null)
                    background.SetSpeed(gameSpeed);
                
                if (obstacleSpawner != null)
                    obstacleSpawner.SetSpeed(gameSpeed);
            }
        }
        
        void UpdateScore()
        {
            // Distance-based scoring
            int distanceScore = Mathf.FloorToInt(distanceTraveled) * distancePointsPerSecond;
            int coinScore = coinsCollected * coinValue;
            currentScore = distanceScore + coinScore;
        }
        
        void UpdateUI()
        {
            if (scoreText != null)
                scoreText.text = $"Score: {currentScore}";
            
            if (distanceText != null)
                distanceText.text = $"Distance: {Mathf.FloorToInt(distanceTraveled)}m";
        }
        
        public void StartGame()
        {
            isGameActive = true;
            gameTime = 0f;
            currentScore = 0;
            coinsCollected = 0;
            distanceTraveled = 0f;
            gameSpeed = 5f;
            lastSpeedIncrease = 0f;
            
            if (gameOverPanel != null)
                gameOverPanel.SetActive(false);
            
            // Initialize game components
            if (background != null)
                background.SetSpeed(gameSpeed);
            
            if (obstacleSpawner != null)
            {
                obstacleSpawner.SetSpeed(gameSpeed);
                obstacleSpawner.StartSpawning();
            }
            
            Debug.Log("Jetpack game started!");
        }
        
        public void GameOver()
        {
            if (!isGameActive) return;
            
            isGameActive = false;
            
            Debug.Log($"Game Over! Final Score: {currentScore}");
            
            // Stop game components
            if (obstacleSpawner != null)
                obstacleSpawner.StopSpawning();
            
            // Show game over UI
            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(true);
                
                if (finalScoreText != null)
                    finalScoreText.text = $"Final Score: {currentScore}";
            }
            
            // Submit score to backend
            SubmitScore();
        }
        
        public void CollectCoin()
        {
            coinsCollected++;
            Debug.Log($"Coin collected! Total: {coinsCollected}");
        }
        
        void SubmitScore()
        {
            if (socketClient != null)
            {
                var scoreData = new
                {
                    game = "jetpack",
                    score = currentScore,
                    distance = Mathf.FloorToInt(distanceTraveled),
                    coins = coinsCollected,
                    time = gameTime
                };
                
                // Emit score to server
                // Note: This would need the actual Socket.IO client implementation
                Debug.Log($"Submitting score: {JsonUtility.ToJson(scoreData)}");
            }
        }
        
        void RestartGame()
        {
            // Reset player position
            if (player != null)
            {
                player.transform.position = new Vector3(-6f, 0f, 0f);
                var rb = player.GetComponent<Rigidbody2D>();
                if (rb != null)
                    rb.velocity = Vector2.zero;
            }
            
            // Clear existing obstacles
            var obstacles = GameObject.FindGameObjectsWithTag("Obstacle");
            foreach (var obstacle in obstacles)
            {
                Destroy(obstacle);
            }
            
            var coins = GameObject.FindGameObjectsWithTag("Coin");
            foreach (var coin in coins)
            {
                Destroy(coin);
            }
            
            StartGame();
        }
        
        void ReturnToMainMenu()
        {
            // Load main menu scene
            UnityEngine.SceneManagement.SceneManager.LoadScene("Lobby");
        }
        
        // Public getters for other components
        public bool IsGameActive => isGameActive;
        public float GameSpeed => gameSpeed;
        public float GameTime => gameTime;
        public int CurrentScore => currentScore;
    }
}