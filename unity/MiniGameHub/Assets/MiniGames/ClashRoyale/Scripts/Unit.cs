using UnityEngine;
using System.Collections;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Base unit class for all troops and buildings in Clash Royale mini-game
    /// Handles movement, combat, and AI behavior
    /// </summary>
    public class Unit : MonoBehaviour
    {
        [Header("Unit Configuration")]
        [SerializeField] private Card cardData;
        [SerializeField] private bool isPlayerUnit = true;
        [SerializeField] private bool isAirUnit = false;
        
        [Header("Combat Settings")]
        [SerializeField] private LayerMask enemyLayers = -1;
        [SerializeField] private LayerMask obstacleLayer = -1;
        
        [Header("Visual Components")]
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private GameObject healthBarPrefab;
        [SerializeField] private GameObject deathEffect;
        
        // Unit state
        private int currentHealth;
        private bool isDead = false;
        private float lastAttackTime = 0f;
        private Unit currentTarget;
        private Tower targetTower;
        
        // Movement
        private Vector2 targetPosition;
        private bool isMoving = false;
        
        // Components
        private Rigidbody2D rb;
        private GameObject healthBarInstance;
        
        // Public properties
        public bool IsPlayerUnit => isPlayerUnit;
        public bool IsAirUnit => isAirUnit;
        public Card CardData => cardData;
        public bool IsDead => isDead;
        public int CurrentHealth => currentHealth;
        public int MaxHealth => cardData != null ? cardData.Health : 100;
        
        void Awake()
        {
            rb = GetComponent<Rigidbody2D>();
            
            if (rb == null)
                rb = gameObject.AddComponent<Rigidbody2D>();
            
            rb.gravityScale = 0f; // Top-down movement
        }
        
        void Start()
        {
            Initialize();
        }
        
        public void Initialize()
        {
            if (cardData == null)
            {
                Debug.LogWarning($"Unit {name} has no card data assigned!");
                return;
            }
            
            currentHealth = cardData.Health;
            isDead = false;
            lastAttackTime = 0f;
            
            // Set unit color based on team
            if (spriteRenderer != null)
            {
                spriteRenderer.color = isPlayerUnit ? Color.blue : Color.red;
            }
            
            // Create health bar
            CreateHealthBar();
            
            // Start AI behavior
            if (cardData.Type == CardType.Troop)
            {
                StartCoroutine(UnitAI());
            }
        }
        
        void CreateHealthBar()
        {
            if (healthBarPrefab != null && healthBarInstance == null)
            {
                healthBarInstance = Instantiate(healthBarPrefab, transform);
                healthBarInstance.transform.localPosition = Vector3.up * 0.8f;
                UpdateHealthBar();
            }
        }
        
        void UpdateHealthBar()
        {
            if (healthBarInstance != null)
            {
                var healthBar = healthBarInstance.GetComponent<SpriteRenderer>();
                if (healthBar != null)
                {
                    float healthPercent = (float)currentHealth / MaxHealth;
                    healthBar.color = Color.Lerp(Color.red, Color.green, healthPercent);
                    
                    var scale = healthBar.transform.localScale;
                    scale.x = healthPercent;
                    healthBar.transform.localScale = scale;
                }
            }
        }
        
        IEnumerator UnitAI()
        {
            while (!isDead)
            {
                if (cardData.Type == CardType.Troop)
                {
                    TroopAI();
                }
                else if (cardData.Type == CardType.Building)
                {
                    BuildingAI();
                }
                
                yield return new WaitForSeconds(0.1f); // AI updates 10 times per second
            }
        }
        
        void TroopAI()
        {
            // Find targets
            FindTarget();
            
            if (currentTarget != null)
            {
                // Move toward target and attack
                float distance = Vector2.Distance(transform.position, currentTarget.transform.position);
                
                if (distance <= cardData.Range)
                {
                    // In range - attack
                    if (Time.time - lastAttackTime >= 1f / cardData.AttackSpeed)
                    {
                        AttackTarget(currentTarget);
                    }
                }
                else
                {
                    // Move toward target
                    MoveToward(currentTarget.transform.position);
                }
            }
            else if (targetTower != null)
            {
                // No units to attack, go for the tower
                float distance = Vector2.Distance(transform.position, targetTower.transform.position);
                
                if (distance <= cardData.Range)
                {
                    if (Time.time - lastAttackTime >= 1f / cardData.AttackSpeed)
                    {
                        AttackTower(targetTower);
                    }
                }
                else
                {
                    MoveToward(targetTower.transform.position);
                }
            }
            else
            {
                // Find enemy tower
                FindTargetTower();
            }
        }
        
        void BuildingAI()
        {
            // Buildings don't move, just attack nearby enemies
            FindTarget();
            
            if (currentTarget != null)
            {
                float distance = Vector2.Distance(transform.position, currentTarget.transform.position);
                
                if (distance <= cardData.Range && Time.time - lastAttackTime >= 1f / cardData.AttackSpeed)
                {
                    AttackTarget(currentTarget);
                }
            }
        }
        
        void FindTarget()
        {
            Unit closestEnemy = null;
            float closestDistance = float.MaxValue;
            
            var allUnits = FindObjectsOfType<Unit>();
            foreach (var unit in allUnits)
            {
                // Skip same team units
                if (unit.isPlayerUnit == this.isPlayerUnit) continue;
                
                // Skip dead units
                if (unit.isDead) continue;
                
                // Check if we can target this unit type
                if (!cardData.CanTarget(unit)) continue;
                
                float distance = Vector2.Distance(transform.position, unit.transform.position);
                
                // Prioritize units within attack range
                if (distance <= cardData.Range * 1.5f && distance < closestDistance)
                {
                    closestEnemy = unit;
                    closestDistance = distance;
                }
            }
            
            currentTarget = closestEnemy;
        }
        
        void FindTargetTower()
        {
            var towers = FindObjectsOfType<Tower>();
            foreach (var tower in towers)
            {
                if (tower.IsPlayerTower != this.isPlayerUnit)
                {
                    targetTower = tower;
                    break;
                }
            }
        }
        
        void MoveToward(Vector2 targetPos)
        {
            Vector2 direction = (targetPos - (Vector2)transform.position).normalized;
            Vector2 movement = direction * cardData.Speed * Time.fixedDeltaTime;
            
            if (rb != null)
            {
                rb.MovePosition(rb.position + movement);
            }
            
            // Face movement direction
            if (direction.x != 0 && spriteRenderer != null)
            {
                spriteRenderer.flipX = direction.x < 0;
            }
        }
        
        void AttackTarget(Unit target)
        {
            if (target == null || target.isDead) return;
            
            target.TakeDamage(cardData.Damage);
            lastAttackTime = Time.time;
            
            Debug.Log($"{name} attacked {target.name} for {cardData.Damage} damage");
        }
        
        void AttackTower(Tower tower)
        {
            if (tower == null || tower.IsDestroyed) return;
            
            tower.TakeDamage(cardData.Damage);
            lastAttackTime = Time.time;
            
            // Notify AI bot if this is an AI unit dealing damage
            if (!isPlayerUnit)
            {
                var aiBot = FindObjectOfType<AIBot>();
                if (aiBot != null)
                    aiBot.OnDamageDealt(cardData.Damage);
            }
            
            Debug.Log($"{name} attacked {(tower.IsPlayerTower ? "Player" : "AI")} tower for {cardData.Damage} damage");
        }
        
        public void TakeDamage(int damage)
        {
            if (isDead) return;
            
            currentHealth = Mathf.Max(0, currentHealth - damage);
            UpdateHealthBar();
            
            if (currentHealth <= 0)
            {
                Die();
            }
        }
        
        void Die()
        {
            isDead = true;
            
            // Death effects
            if (deathEffect != null)
            {
                Instantiate(deathEffect, transform.position, Quaternion.identity);
            }
            
            // Clean up health bar
            if (healthBarInstance != null)
            {
                Destroy(healthBarInstance);
            }
            
            Debug.Log($"{name} died");
            
            // Remove from game
            Destroy(gameObject, 0.1f);
        }
        
        void OnDrawGizmosSelected()
        {
            if (cardData != null)
            {
                // Show attack range
                Gizmos.color = Color.red;
                Gizmos.DrawWireSphere(transform.position, cardData.Range);
            }
        }
    }
}