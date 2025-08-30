using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using MiniGameHub.Core;
using MiniGameHub.Networking;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Main game manager for Clash Royale mini-game with AI bot opponent
    /// Applies lessons from Super Mario Bros. AI case study for improved AI performance
    /// </summary>
    public class ClashRoyaleGameManager : MonoBehaviour
    {
        [Header("Game Settings")]
        [SerializeField] private float matchDuration = 180f; // 3 minutes
        [SerializeField] private float elixirGenerationRate = 1f; // per second
        [SerializeField] private int maxElixir = 10;
        
        [Header("Scoring Configuration")]
        [SerializeField] private int towerDamagePoints = 10;
        [SerializeField] private int elixirEfficiencyMultiplier = 5;
        [SerializeField] private int towerDamagePenalty = 15;
        [SerializeField] private float timePenalty = 0.1f;
        [SerializeField] private int victoryBonus = 100;
        
        [Header("UI References")]
        [SerializeField] private Text timerText;
        [SerializeField] private Text playerElixirText;
        [SerializeField] private Text aiElixirText;
        [SerializeField] private Text scoreText;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private Text finalScoreText;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button mainMenuButton;
        
        [Header("Game Objects")]
        [SerializeField] private Tower playerTower;
        [SerializeField] private Tower aiTower;
        [SerializeField] private CardManager cardManager;
        [SerializeField] private PlacementGrid placementGrid;
        [SerializeField] private AIBot aiBot;
        
        // Game State
        private bool isGameActive = false;
        private float gameTime = 0f;
        private float playerElixir = 5f; // Starting elixir
        private float aiElixir = 5f;
        private int currentScore = 0;
        
        // Scoring tracking
        private int playerTowerDamageDealt = 0;
        private int playerTowerDamageReceived = 0;
        private int playerElixirSpent = 0;
        
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
            UpdateElixir();
            UpdateScore();
            UpdateUI();
            
            // Check for game end conditions
            CheckGameEndConditions();
        }
        
        void UpdateGameTime()
        {
            gameTime += Time.deltaTime;
            
            if (gameTime >= matchDuration)
            {
                EndGame(DetermineWinner());
            }
        }
        
        void UpdateElixir()
        {
            // Generate elixir for both players
            playerElixir = Mathf.Min(maxElixir, playerElixir + elixirGenerationRate * Time.deltaTime);
            aiElixir = Mathf.Min(maxElixir, aiElixir + elixirGenerationRate * Time.deltaTime);
        }
        
        void UpdateScore()
        {
            // Apply Mario AI lesson: reward efficiency and speed, punish time
            float elixirEfficiency = playerElixirSpent > 0 ? (float)playerTowerDamageDealt / playerElixirSpent : 0f;
            
            currentScore = Mathf.FloorToInt(
                playerTowerDamageDealt * towerDamagePoints +
                elixirEfficiency * elixirEfficiencyMultiplier -
                playerTowerDamageReceived * towerDamagePenalty -
                gameTime * timePenalty
            );
        }
        
        void UpdateUI()
        {
            if (timerText != null)
            {
                float remainingTime = matchDuration - gameTime;
                int minutes = Mathf.FloorToInt(remainingTime / 60);
                int seconds = Mathf.FloorToInt(remainingTime % 60);
                timerText.text = $"{minutes:00}:{seconds:00}";
            }
            
            if (playerElixirText != null)
                playerElixirText.text = $"Elixir: {Mathf.FloorToInt(playerElixir)}/{maxElixir}";
            
            if (aiElixirText != null)
                aiElixirText.text = $"AI Elixir: {Mathf.FloorToInt(aiElixir)}/{maxElixir}";
            
            if (scoreText != null)
                scoreText.text = $"Score: {currentScore}";
        }
        
        void CheckGameEndConditions()
        {
            // Check if either tower is destroyed
            if (playerTower != null && playerTower.IsDestroyed)
            {
                EndGame(GameResult.AIWin);
            }
            else if (aiTower != null && aiTower.IsDestroyed)
            {
                EndGame(GameResult.PlayerWin);
            }
        }
        
        GameResult DetermineWinner()
        {
            int playerTowerHP = playerTower != null ? playerTower.CurrentHealth : 0;
            int aiTowerHP = aiTower != null ? aiTower.CurrentHealth : 0;
            
            if (playerTowerHP > aiTowerHP)
                return GameResult.PlayerWin;
            else if (aiTowerHP > playerTowerHP)
                return GameResult.AIWin;
            else
                return GameResult.Draw;
        }
        
        public void StartGame()
        {
            isGameActive = true;
            gameTime = 0f;
            playerElixir = 5f;
            aiElixir = 5f;
            currentScore = 0;
            playerTowerDamageDealt = 0;
            playerTowerDamageReceived = 0;
            playerElixirSpent = 0;
            
            if (gameOverPanel != null)
                gameOverPanel.SetActive(false);
            
            // Initialize game components
            if (playerTower != null)
                playerTower.Initialize();
            
            if (aiTower != null)
                aiTower.Initialize();
            
            if (cardManager != null)
                cardManager.Initialize();
            
            if (aiBot != null)
                aiBot.Initialize(this);
            
            Debug.Log("Clash Royale game started!");
        }
        
        public void EndGame(GameResult result)
        {
            if (!isGameActive) return;
            
            isGameActive = false;
            
            // Apply victory bonus if player won
            if (result == GameResult.PlayerWin)
                currentScore += victoryBonus;
            
            Debug.Log($"Game Over! Result: {result}, Final Score: {currentScore}");
            
            // Show game over UI
            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(true);
                
                if (finalScoreText != null)
                    finalScoreText.text = $"Final Score: {currentScore}\\nResult: {result}";
            }
            
            // Submit score to backend
            SubmitScore();
        }
        
        // Called by player when deploying a card
        public bool TryDeployCard(Card card, Vector2 position)
        {
            if (!isGameActive || playerElixir < card.ElixirCost)
                return false;
            
            playerElixir -= card.ElixirCost;
            playerElixirSpent += card.ElixirCost;
            
            // Deploy the card
            if (cardManager != null)
                cardManager.DeployCard(card, position, true); // true for player
            
            return true;
        }
        
        // Called by AI when deploying a card
        public bool TryDeployAICard(Card card, Vector2 position)
        {
            if (!isGameActive || aiElixir < card.ElixirCost)
                return false;
            
            aiElixir -= card.ElixirCost;
            
            // Deploy the card
            if (cardManager != null)
                cardManager.DeployCard(card, position, false); // false for AI
            
            return true;
        }
        
        // Called when player deals damage to AI tower
        public void OnPlayerTowerDamage(int damage)
        {
            playerTowerDamageDealt += damage;
        }
        
        // Called when AI deals damage to player tower
        public void OnAITowerDamage(int damage)
        {
            playerTowerDamageReceived += damage;
        }
        
        void SubmitScore()
        {
            if (socketClient != null)
            {
                var scoreData = new
                {
                    game = "clashroyale",
                    score = currentScore,
                    distance = playerTowerDamageDealt, // Use tower damage as "distance"
                    coins = Mathf.FloorToInt(playerElixir), // Use remaining elixir as "coins"
                    time = gameTime,
                    metadata = new
                    {
                        towerDamageDealt = playerTowerDamageDealt,
                        towerDamageReceived = playerTowerDamageReceived,
                        elixirSpent = playerElixirSpent,
                        elixirEfficiency = playerElixirSpent > 0 ? (float)playerTowerDamageDealt / playerElixirSpent : 0f
                    }
                };
                
                Debug.Log($"Submitting Clash Royale score: {JsonUtility.ToJson(scoreData)}");
            }
        }
        
        void RestartGame()
        {
            StartGame();
        }
        
        void ReturnToMainMenu()
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene("Lobby");
        }
        
        // Public getters for AI and other components
        public bool IsGameActive => isGameActive;
        public float GameTime => gameTime;
        public float PlayerElixir => playerElixir;
        public float AIElixir => aiElixir;
        public int CurrentScore => currentScore;
        public Tower PlayerTower => playerTower;
        public Tower AITower => aiTower;
    }
    
    public enum GameResult
    {
        PlayerWin,
        AIWin,
        Draw
    }
}