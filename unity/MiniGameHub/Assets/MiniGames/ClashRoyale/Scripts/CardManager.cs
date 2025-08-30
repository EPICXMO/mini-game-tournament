using UnityEngine;
using System.Collections.Generic;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Manages card deployment and unit spawning for Clash Royale mini-game
    /// Handles both player and AI card plays
    /// </summary>
    public class CardManager : MonoBehaviour
    {
        [Header("Deployment Settings")]
        [SerializeField] private float deploymentDelay = 1f;
        [SerializeField] private GameObject deploymentEffect;
        
        [Header("Unit Spawning")]
        [SerializeField] private Transform playerSpawnParent;
        [SerializeField] private Transform aiSpawnParent;
        
        // Deployment queue
        private Queue<PendingDeployment> deploymentQueue = new Queue<PendingDeployment>();
        
        public void Initialize()
        {
            // Clear any existing deployments
            deploymentQueue.Clear();
            
            // Clean up any existing units
            ClearAllUnits();
        }
        
        void Update()
        {
            ProcessDeploymentQueue();
        }
        
        /// <summary>
        /// Deploy a card at the specified position
        /// </summary>
        public void DeployCard(Card card, Vector2 position, bool isPlayerCard)
        {
            if (card == null)
            {
                Debug.LogWarning("Attempted to deploy null card");
                return;
            }
            
            var deployment = new PendingDeployment
            {
                card = card,
                position = position,
                isPlayerCard = isPlayerCard,
                deployTime = Time.time + card.DeployTime
            };
            
            deploymentQueue.Enqueue(deployment);
            
            // Show deployment effect immediately
            ShowDeploymentEffect(position);
            
            Debug.Log($"Queued {card.cardName} deployment at {position} for {(isPlayerCard ? "Player" : "AI")}");
        }
        
        void ProcessDeploymentQueue()
        {
            if (deploymentQueue.Count == 0) return;
            
            var deployment = deploymentQueue.Peek();
            
            if (Time.time >= deployment.deployTime)
            {
                deploymentQueue.Dequeue();
                ExecuteDeployment(deployment);
            }
        }
        
        void ExecuteDeployment(PendingDeployment deployment)
        {
            switch (deployment.card.Type)
            {
                case CardType.Troop:
                    SpawnTroop(deployment);
                    break;
                case CardType.Building:
                    SpawnBuilding(deployment);
                    break;
                case CardType.Spell:
                    CastSpell(deployment);
                    break;
            }
        }
        
        void SpawnTroop(PendingDeployment deployment)
        {
            GameObject unitPrefab = deployment.card.unitPrefab;
            
            if (unitPrefab == null)
            {
                // Create a basic unit if no prefab is assigned
                unitPrefab = CreateBasicUnitPrefab(deployment.card);
            }
            
            Transform parent = deployment.isPlayerCard ? playerSpawnParent : aiSpawnParent;
            GameObject unitInstance = Instantiate(unitPrefab, deployment.position, Quaternion.identity, parent);
            
            // Configure the unit
            var unit = unitInstance.GetComponent<Unit>();
            if (unit == null)
                unit = unitInstance.AddComponent<Unit>();
            
            unit.GetType().GetField("cardData", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.SetValue(unit, deployment.card);
            unit.GetType().GetField("isPlayerUnit", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.SetValue(unit, deployment.isPlayerCard);
            
            unit.Initialize();
            
            Debug.Log($"Spawned {deployment.card.cardName} for {(deployment.isPlayerCard ? "Player" : "AI")}");
        }
        
        void SpawnBuilding(PendingDeployment deployment)
        {
            // Buildings are similar to troops but don't move
            SpawnTroop(deployment); // Reuse troop spawning logic
        }
        
        void CastSpell(PendingDeployment deployment)
        {
            // Instant spell effects
            Vector2 targetPosition = deployment.position;
            
            switch (deployment.card.cardName.ToLower())
            {
                case "fireball":
                    CastFireball(targetPosition, deployment.card, deployment.isPlayerCard);
                    break;
                case "lightning":
                    CastLightning(targetPosition, deployment.card, deployment.isPlayerCard);
                    break;
                default:
                    CastGenericSpell(targetPosition, deployment.card, deployment.isPlayerCard);
                    break;
            }
        }
        
        void CastFireball(Vector2 position, Card card, bool isPlayerSpell)
        {
            // Area damage spell
            var unitsInRange = FindUnitsInRange(position, card.AreaRadius > 0 ? card.AreaRadius : 2f);
            
            foreach (var unit in unitsInRange)
            {
                // Only damage enemy units
                if (unit.IsPlayerUnit != isPlayerSpell)
                {
                    unit.TakeDamage(card.Damage);
                }
            }
            
            // Visual effect
            ShowSpellEffect(position, "Fireball");
            
            Debug.Log($"{(isPlayerSpell ? "Player" : "AI")} cast Fireball at {position}, hit {unitsInRange.Count} units");
        }
        
        void CastLightning(Vector2 position, Card card, bool isPlayerSpell)
        {
            // High damage, smaller area
            var unitsInRange = FindUnitsInRange(position, 1.5f);
            
            foreach (var unit in unitsInRange)
            {
                if (unit.IsPlayerUnit != isPlayerSpell)
                {
                    unit.TakeDamage(card.Damage);
                }
            }
            
            ShowSpellEffect(position, "Lightning");
            
            Debug.Log($"{(isPlayerSpell ? "Player" : "AI")} cast Lightning at {position}");
        }
        
        void CastGenericSpell(Vector2 position, Card card, bool isPlayerSpell)
        {
            // Generic spell implementation
            var unitsInRange = FindUnitsInRange(position, 2f);
            
            foreach (var unit in unitsInRange)
            {
                if (unit.IsPlayerUnit != isPlayerSpell)
                {
                    unit.TakeDamage(card.Damage);
                }
            }
            
            ShowSpellEffect(position, card.cardName);
        }
        
        List<Unit> FindUnitsInRange(Vector2 center, float radius)
        {
            var unitsInRange = new List<Unit>();
            var allUnits = FindObjectsOfType<Unit>();
            
            foreach (var unit in allUnits)
            {
                if (unit.IsDead) continue;
                
                float distance = Vector2.Distance(center, unit.transform.position);
                if (distance <= radius)
                {
                    unitsInRange.Add(unit);
                }
            }
            
            return unitsInRange;
        }
        
        void ShowDeploymentEffect(Vector2 position)
        {
            if (deploymentEffect != null)
            {
                Instantiate(deploymentEffect, position, Quaternion.identity);
            }
        }
        
        void ShowSpellEffect(Vector2 position, string spellName)
        {
            // Create spell effect based on spell type
            // For now, just use the deployment effect
            ShowDeploymentEffect(position);
        }
        
        GameObject CreateBasicUnitPrefab(Card card)
        {
            // Create a basic unit prefab if none is assigned
            GameObject prefab = new GameObject(card.cardName);
            
            // Add basic components
            var spriteRenderer = prefab.AddComponent<SpriteRenderer>();
            spriteRenderer.sprite = card.cardIcon;
            spriteRenderer.color = Color.white;
            
            var collider = prefab.AddComponent<CircleCollider2D>();
            collider.radius = 0.3f;
            
            var rigidbody = prefab.AddComponent<Rigidbody2D>();
            rigidbody.gravityScale = 0f;
            
            return prefab;
        }
        
        void ClearAllUnits()
        {
            var allUnits = FindObjectsOfType<Unit>();
            foreach (var unit in allUnits)
            {
                if (unit != null)
                    Destroy(unit.gameObject);
            }
        }
        
        public int GetActiveUnitCount(bool playerUnits)
        {
            int count = 0;
            var allUnits = FindObjectsOfType<Unit>();
            
            foreach (var unit in allUnits)
            {
                if (unit.IsPlayerUnit == playerUnits && !unit.IsDead)
                    count++;
            }
            
            return count;
        }
    }
    
    [System.Serializable]
    public class PendingDeployment
    {
        public Card card;
        public Vector2 position;
        public bool isPlayerCard;
        public float deployTime;
    }
}