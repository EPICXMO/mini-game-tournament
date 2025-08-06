using UnityEngine;
using System.Collections;

namespace MiniGameHub.Jetpack
{
    public class ObstacleSpawner : MonoBehaviour
    {
        [Header("Spawning Settings")]
        [SerializeField] private GameObject[] obstaclePrefabs;
        [SerializeField] private GameObject coinPrefab;
        [SerializeField] private float spawnInterval = 2f;
        [SerializeField] private float spawnDistance = 10f;
        [SerializeField] private float coinSpawnChance = 0.3f;
        
        [Header("Obstacle Settings")]
        [SerializeField] private float obstacleSpeed = 5f;
        [SerializeField] private float minHeight = -2f;
        [SerializeField] private float maxHeight = 4f;
        [SerializeField] private float despawnDistance = -15f;
        
        [Header("Difficulty Scaling")]
        [SerializeField] private float minSpawnInterval = 0.8f;
        [SerializeField] private float intervalDecrease = 0.05f;
        [SerializeField] private float intervalDecreaseTime = 15f;
        
        private bool isSpawning = false;
        private float currentSpawnInterval;
        private float lastIntervalDecrease = 0f;
        private JetpackGameManager gameManager;
        
        void Start()
        {
            gameManager = FindObjectOfType<JetpackGameManager>();
            currentSpawnInterval = spawnInterval;
        }
        
        void Update()
        {
            if (!isSpawning) return;
            
            UpdateDifficulty();
            CleanupObstacles();
        }
        
        void UpdateDifficulty()
        {
            if (gameManager == null) return;
            
            float gameTime = gameManager.GameTime;
            
            // Decrease spawn interval over time to increase difficulty
            if (gameTime - lastIntervalDecrease >= intervalDecreaseTime)
            {
                if (currentSpawnInterval > minSpawnInterval)
                {
                    currentSpawnInterval = Mathf.Max(minSpawnInterval, currentSpawnInterval - intervalDecrease);
                    lastIntervalDecrease = gameTime;
                }
            }
        }
        
        void CleanupObstacles()
        {
            // Clean up obstacles that have moved too far left
            var obstacles = GameObject.FindGameObjectsWithTag("Obstacle");
            foreach (var obstacle in obstacles)
            {
                if (obstacle.transform.position.x < despawnDistance)
                {
                    Destroy(obstacle);
                }
            }
            
            var coins = GameObject.FindGameObjectsWithTag("Coin");
            foreach (var coin in coins)
            {
                if (coin.transform.position.x < despawnDistance)
                {
                    Destroy(coin);
                }
            }
        }
        
        public void StartSpawning()
        {
            if (isSpawning) return;
            
            isSpawning = true;
            currentSpawnInterval = spawnInterval;
            lastIntervalDecrease = 0f;
            
            StartCoroutine(SpawnObstacles());
        }
        
        public void StopSpawning()
        {
            isSpawning = false;
            StopAllCoroutines();
        }
        
        IEnumerator SpawnObstacles()
        {
            while (isSpawning)
            {
                yield return new WaitForSeconds(currentSpawnInterval);
                
                if (isSpawning)
                {
                    SpawnObstacle();
                    
                    // Chance to spawn a coin
                    if (Random.value <= coinSpawnChance && coinPrefab != null)
                    {
                        SpawnCoin();
                    }
                }
            }
        }
        
        void SpawnObstacle()
        {
            if (obstaclePrefabs == null || obstaclePrefabs.Length == 0) return;
            
            // Choose random obstacle prefab
            GameObject prefab = obstaclePrefabs[Random.Range(0, obstaclePrefabs.Length)];
            
            // Random height
            float spawnHeight = Random.Range(minHeight, maxHeight);
            Vector3 spawnPosition = new Vector3(spawnDistance, spawnHeight, 0f);
            
            // Spawn obstacle
            GameObject obstacle = Instantiate(prefab, spawnPosition, Quaternion.identity);
            
            // Add movement component
            var mover = obstacle.GetComponent<ObstacleMover>();
            if (mover == null)
            {
                mover = obstacle.AddComponent<ObstacleMover>();
            }
            mover.SetSpeed(obstacleSpeed);
            
            // Ensure it has the correct tag
            obstacle.tag = "Obstacle";
        }
        
        void SpawnCoin()
        {
            if (coinPrefab == null) return;
            
            // Random position, slightly offset from obstacles
            float spawnHeight = Random.Range(minHeight + 1f, maxHeight - 1f);
            Vector3 spawnPosition = new Vector3(spawnDistance + Random.Range(1f, 3f), spawnHeight, 0f);
            
            // Spawn coin
            GameObject coin = Instantiate(coinPrefab, spawnPosition, Quaternion.identity);
            
            // Add movement component
            var mover = coin.GetComponent<ObstacleMover>();
            if (mover == null)
            {
                mover = coin.AddComponent<ObstacleMover>();
            }
            mover.SetSpeed(obstacleSpeed);
            
            // Ensure it has the correct tag
            coin.tag = "Coin";
        }
        
        public void SetSpeed(float newSpeed)
        {
            obstacleSpeed = newSpeed;
            
            // Update existing obstacles
            var obstacles = GameObject.FindGameObjectsWithTag("Obstacle");
            foreach (var obstacle in obstacles)
            {
                var mover = obstacle.GetComponent<ObstacleMover>();
                if (mover != null)
                {
                    mover.SetSpeed(obstacleSpeed);
                }
            }
            
            var coins = GameObject.FindGameObjectsWithTag("Coin");
            foreach (var coin in coins)
            {
                var mover = coin.GetComponent<ObstacleMover>();
                if (mover != null)
                {
                    mover.SetSpeed(obstacleSpeed);
                }
            }
        }
    }
}