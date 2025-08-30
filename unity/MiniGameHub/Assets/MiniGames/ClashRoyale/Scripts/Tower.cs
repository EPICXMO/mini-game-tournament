using UnityEngine;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Tower component for Clash Royale mini-game
    /// Represents the main objective towers that players must defend/attack
    /// </summary>
    public class Tower : MonoBehaviour
    {
        [Header("Tower Configuration")]
        [SerializeField] private int maxHealth = 1000;
        [SerializeField] private int attackDamage = 100;
        [SerializeField] private float attackRange = 3f;
        [SerializeField] private float attackCooldown = 1f;
        [SerializeField] private bool isPlayerTower = true;
        
        [Header("Visual Feedback")]
        [SerializeField] private GameObject destructionEffect;
        [SerializeField] private SpriteRenderer healthBar;
        
        // State
        private int currentHealth;
        private bool isDestroyed = false;
        private float lastAttackTime = 0f;
        private ClashRoyaleGameManager gameManager;
        
        // Target tracking
        private Unit currentTarget;
        
        public int CurrentHealth => currentHealth;
        public bool IsDestroyed => isDestroyed;
        public bool IsPlayerTower => isPlayerTower;
        
        void Start()
        {
            gameManager = FindObjectOfType<ClashRoyaleGameManager>();
        }
        
        public void Initialize()
        {
            currentHealth = maxHealth;
            isDestroyed = false;
            lastAttackTime = 0f;
            currentTarget = null;
            
            UpdateHealthBar();
        }
        
        void Update()
        {
            if (isDestroyed) return;
            
            // Find and attack enemies in range
            if (Time.time - lastAttackTime >= attackCooldown)
            {
                FindAndAttackTarget();
            }
        }
        
        void FindAndAttackTarget()
        {
            // Find closest enemy unit in range
            Unit closestEnemy = null;
            float closestDistance = float.MaxValue;
            
            var allUnits = FindObjectsOfType<Unit>();
            foreach (var unit in allUnits)
            {
                // Skip if same team
                if (unit.IsPlayerUnit == isPlayerTower) continue;
                
                float distance = Vector2.Distance(transform.position, unit.transform.position);
                if (distance <= attackRange && distance < closestDistance)
                {
                    closestEnemy = unit;
                    closestDistance = distance;
                }
            }
            
            if (closestEnemy != null)
            {
                AttackTarget(closestEnemy);
            }
        }
        
        void AttackTarget(Unit target)
        {
            if (target == null) return;
            
            // Deal damage to target
            target.TakeDamage(attackDamage);
            lastAttackTime = Time.time;
            
            Debug.Log($"{(isPlayerTower ? "Player" : "AI")} tower attacked {target.name} for {attackDamage} damage");
        }
        
        public void TakeDamage(int damage)
        {
            if (isDestroyed) return;
            
            currentHealth = Mathf.Max(0, currentHealth - damage);
            UpdateHealthBar();
            
            // Notify game manager of damage
            if (gameManager != null)
            {
                if (isPlayerTower)
                    gameManager.OnAITowerDamage(damage);
                else
                    gameManager.OnPlayerTowerDamage(damage);
            }
            
            Debug.Log($"{(isPlayerTower ? "Player" : "AI")} tower took {damage} damage. Health: {currentHealth}/{maxHealth}");
            
            if (currentHealth <= 0)
            {
                DestroyTower();
            }
        }
        
        void DestroyTower()
        {
            isDestroyed = true;
            
            // Visual effects
            if (destructionEffect != null)
            {
                Instantiate(destructionEffect, transform.position, Quaternion.identity);
            }
            
            Debug.Log($"{(isPlayerTower ? "Player" : "AI")} tower destroyed!");
            
            // Game will end when tower is destroyed
            // This is handled by the GameManager checking IsDestroyed
        }
        
        void UpdateHealthBar()
        {
            if (healthBar != null)
            {
                float healthPercent = (float)currentHealth / maxHealth;
                healthBar.color = Color.Lerp(Color.red, Color.green, healthPercent);
                
                // Scale the health bar to show current health
                var scale = healthBar.transform.localScale;
                scale.x = healthPercent;
                healthBar.transform.localScale = scale;
            }
        }
        
        void OnDrawGizmosSelected()
        {
            // Show attack range in editor
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, attackRange);
        }
        
        // Public methods for external access
        public float GetHealthPercent()
        {
            return (float)currentHealth / maxHealth;
        }
        
        public bool IsInRange(Vector2 position)
        {
            return Vector2.Distance(transform.position, position) <= attackRange;
        }
    }
}