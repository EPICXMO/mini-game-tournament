using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// AI Bot for Clash Royale that implements improved strategies based on 
    /// Super Mario Bros. AI case study lessons:
    /// 1. Reward velocity/efficiency over survival
    /// 2. Punish excessive time (encourages fast decisions)
    /// 3. Managed action space for faster learning
    /// 4. Fixed learning algorithm implementation
    /// </summary>
    public class AIBot : MonoBehaviour
    {
        [Header("AI Configuration")]
        [SerializeField] private float decisionInterval = 0.5f; // Decisions per second
        [SerializeField] private float aggressionLevel = 0.7f; // 0=defensive, 1=aggressive
        [SerializeField] private float efficiencyWeight = 0.8f; // How much AI values efficiency
        
        [Header("AI Deck - Limited for Faster Training")]
        [SerializeField] private List<Card> aiDeck = new List<Card>();
        
        // AI Decision System (Simplified action space)
        private float lastDecisionTime = 0f;
        private ClashRoyaleGameManager gameManager;
        private PlacementGrid placementGrid;
        
        // AI Learning State
        private Dictionary<string, float> strategyWeights = new Dictionary<string, float>();
        private List<AIDecision> recentDecisions = new List<AIDecision>();
        
        // Performance tracking for reward engineering
        private int damageDealtThisGame = 0;
        private int elixirSpentThisGame = 0;
        private float gameStartTime = 0f;
        
        public void Initialize(ClashRoyaleGameManager manager)
        {
            gameManager = manager;
            placementGrid = FindObjectOfType<PlacementGrid>();
            gameStartTime = Time.time;
            
            InitializeAIWeights();
            InitializeAIDeck();
            
            Debug.Log($"AI Bot initialized with {aiDeck.Count} cards");
        }
        
        void InitializeAIWeights()
        {
            // Initialize strategy weights based on Mario AI lessons
            strategyWeights["aggression"] = 0.7f; // Reward attacking quickly
            strategyWeights["efficiency"] = 0.8f; // Reward elixir efficiency
            strategyWeights["defense"] = 0.3f; // Don't be overly defensive
            strategyWeights["speed"] = 0.9f; // Reward fast decisions (anti-camping)
            strategyWeights["counter"] = 0.6f; // Respond to player actions
        }
        
        void InitializeAIDeck()
        {
            // Limited deck for managed action space (Mario AI lesson)
            if (aiDeck.Count == 0)
            {
                // Create basic cards if not assigned in inspector
                aiDeck.Add(CreateBasicCard("Knight", 3, 100, 50, CardType.Troop));
                aiDeck.Add(CreateBasicCard("Archer", 2, 60, 80, CardType.Troop));
                aiDeck.Add(CreateBasicCard("Fireball", 4, 0, 120, CardType.Spell));
                aiDeck.Add(CreateBasicCard("Cannon", 3, 200, 40, CardType.Building));
                aiDeck.Add(CreateBasicCard("Goblin", 1, 40, 60, CardType.Troop));
                aiDeck.Add(CreateBasicCard("Giant", 5, 300, 80, CardType.Troop));
                aiDeck.Add(CreateBasicCard("Lightning", 6, 0, 200, CardType.Spell));
                aiDeck.Add(CreateBasicCard("Tesla", 4, 250, 60, CardType.Building));
            }
        }
        
        Card CreateBasicCard(string name, int cost, int health, int damage, CardType type)
        {
            var card = ScriptableObject.CreateInstance<Card>();
            card.cardName = name;
            card.ElixirCost = cost;
            card.Health = health;
            card.Damage = damage;
            card.Type = type;
            return card;
        }
        
        void Update()
        {
            if (!gameManager.IsGameActive) return;
            
            // Make decisions at regular intervals (not every frame for performance)
            if (Time.time - lastDecisionTime >= decisionInterval)
            {
                MakeAIDecision();
                lastDecisionTime = Time.time;
            }
        }
        
        void MakeAIDecision()
        {
            // Get game state for decision making
            var gameState = AnalyzeGameState();
            
            // Apply Mario AI lesson: reward speed by making quick decisions
            var decision = ChooseOptimalAction(gameState);
            
            if (decision != null && decision.card != null)
            {
                ExecuteDecision(decision);
                
                // Track decision for learning
                recentDecisions.Add(decision);
                if (recentDecisions.Count > 20)
                    recentDecisions.RemoveAt(0); // Keep recent decisions only
            }
        }
        
        GameState AnalyzeGameState()
        {
            return new GameState
            {
                aiElixir = gameManager.AIElixir,
                playerElixir = gameManager.PlayerElixir,
                aiTowerHealth = gameManager.AITower.CurrentHealth,
                playerTowerHealth = gameManager.PlayerTower.CurrentHealth,
                timeRemaining = 180f - gameManager.GameTime, // 3 min match
                unitsOnField = GetUnitsOnField(),
                threatLevel = CalculateThreatLevel()
            };
        }
        
        AIDecision ChooseOptimalAction(GameState state)
        {
            var availableCards = aiDeck.Where(card => card.ElixirCost <= state.aiElixir).ToList();
            if (availableCards.Count == 0) return null;
            
            AIDecision bestDecision = null;
            float bestScore = float.MinValue;
            
            foreach (var card in availableCards)
            {
                var positions = GetOptimalPositions(card, state);
                
                foreach (var position in positions)
                {
                    var decision = new AIDecision
                    {
                        card = card,
                        position = position,
                        expectedReward = CalculateExpectedReward(card, position, state)
                    };
                    
                    if (decision.expectedReward > bestScore)
                    {
                        bestScore = decision.expectedReward;
                        bestDecision = decision;
                    }
                }
            }
            
            return bestDecision;
        }
        
        float CalculateExpectedReward(Card card, Vector2 position, GameState state)
        {
            // Apply Mario AI reward engineering principles
            float reward = 0f;
            
            // Reward attacking (velocity toward goal)
            if (IsOffensivePosition(position))
                reward += card.Damage * strategyWeights["aggression"];
            
            // Reward elixir efficiency
            float efficiency = (float)card.Damage / card.ElixirCost;
            reward += efficiency * strategyWeights["efficiency"];
            
            // Punish defensive camping (Mario AI lesson)
            if (IsDefensivePosition(position))
                reward -= 10f * strategyWeights["defense"];
            
            // Reward speed - prefer cheaper, faster deployments
            reward += (10f - card.ElixirCost) * strategyWeights["speed"];
            
            // Counter-play bonus
            if (IsCounterPlay(card, state))
                reward += 20f * strategyWeights["counter"];
            
            // Time pressure (Mario AI lesson: punish time)
            if (state.timeRemaining < 60f) // Last minute urgency
                reward += IsOffensiveCard(card) ? 15f : -15f;
            
            return reward;
        }
        
        List<Vector2> GetOptimalPositions(Card card, GameState state)
        {
            var positions = new List<Vector2>();
            
            // Limited placement grid (Mario AI lesson: manage action space)
            // AI side: y > 0, Player side: y < 0
            for (int x = -2; x <= 2; x += 1)
            {
                for (int y = 1; y <= 3; y += 1) // AI's side only
                {
                    var pos = new Vector2(x, y);
                    if (IsValidPosition(pos, card))
                        positions.Add(pos);
                }
            }
            
            return positions.OrderBy(p => CalculatePositionPriority(p, card, state)).Take(4).ToList();
        }
        
        bool IsValidPosition(Vector2 position, Card card)
        {
            if (placementGrid != null)
                return placementGrid.IsValidPlacement(position, card);
            
            return true; // Default to valid if no grid
        }
        
        float CalculatePositionPriority(Vector2 position, Card card, GameState state)
        {
            float priority = 0f;
            
            // Distance to enemy tower (closer = higher priority for troops)
            if (card.Type == CardType.Troop)
            {
                float distanceToTarget = Vector2.Distance(position, new Vector2(0, -3)); // Enemy tower
                priority -= distanceToTarget; // Closer = higher priority
            }
            
            // Strategic positioning
            if (card.Type == CardType.Building)
            {
                priority += IsDefensivePosition(position) ? 5f : -5f;
            }
            
            return priority;
        }
        
        void ExecuteDecision(AIDecision decision)
        {
            bool success = gameManager.TryDeployAICard(decision.card, decision.position);
            
            if (success)
            {
                elixirSpentThisGame += decision.card.ElixirCost;
                Debug.Log($"AI deployed {decision.card.cardName} at {decision.position} (Expected reward: {decision.expectedReward:F2})");
                
                // Update strategy weights based on outcome (simplified learning)
                UpdateStrategyWeights(decision);
            }
        }
        
        void UpdateStrategyWeights(AIDecision decision)
        {
            // Simple weight adjustment based on expected vs actual performance
            // In a full implementation, this would use proper RL algorithms
            
            float actualReward = CalculateActualReward();
            float error = actualReward - decision.expectedReward;
            
            // Adjust weights slightly based on performance
            if (error > 0) // Better than expected
            {
                if (IsOffensiveCard(decision.card))
                    strategyWeights["aggression"] = Mathf.Min(1f, strategyWeights["aggression"] + 0.01f);
            }
            else // Worse than expected
            {
                if (IsOffensiveCard(decision.card))
                    strategyWeights["aggression"] = Mathf.Max(0f, strategyWeights["aggression"] - 0.01f);
            }
        }
        
        float CalculateActualReward()
        {
            // Calculate current performance based on Mario AI reward function
            float elixirEfficiency = elixirSpentThisGame > 0 ? (float)damageDealtThisGame / elixirSpentThisGame : 0f;
            float timeInGame = Time.time - gameStartTime;
            
            return damageDealtThisGame * 10f + elixirEfficiency * 5f - timeInGame * 0.1f;
        }
        
        // Helper methods
        bool IsOffensivePosition(Vector2 position) => position.y < 1; // Closer to enemy
        bool IsDefensivePosition(Vector2 position) => position.y > 2; // Closer to own tower
        bool IsOffensiveCard(Card card) => card.Type == CardType.Troop && card.Damage > card.Health * 0.5f;
        
        bool IsCounterPlay(Card card, GameState state)
        {
            // Simple counter-play detection
            return state.threatLevel > 50 && card.Type == CardType.Spell;
        }
        
        float CalculateThreatLevel()
        {
            // Simplified threat assessment
            var playerUnits = GetUnitsOnField().Where(u => !u.isAI).Count();
            return playerUnits * 20f; // Each player unit = 20 threat
        }
        
        List<Unit> GetUnitsOnField()
        {
            // Get all units currently on the battlefield
            return FindObjectsOfType<Unit>().ToList();
        }
        
        // Called when AI deals damage (for learning)
        public void OnDamageDealt(int damage)
        {
            damageDealtThisGame += damage;
        }
    }
    
    // Data structures for AI decision making
    [System.Serializable]
    public class AIDecision
    {
        public Card card;
        public Vector2 position;
        public float expectedReward;
        public float timestamp;
    }
    
    [System.Serializable]
    public class GameState
    {
        public float aiElixir;
        public float playerElixir;
        public int aiTowerHealth;
        public int playerTowerHealth;
        public float timeRemaining;
        public List<Unit> unitsOnField;
        public float threatLevel;
    }
}