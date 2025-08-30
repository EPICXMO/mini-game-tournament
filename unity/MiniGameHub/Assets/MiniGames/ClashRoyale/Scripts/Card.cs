using UnityEngine;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Card data structure for Clash Royale mini-game
    /// ScriptableObject to allow easy configuration in Unity Inspector
    /// </summary>
    [CreateAssetMenu(fileName = "New Card", menuName = "Clash Royale/Card")]
    public class Card : ScriptableObject
    {
        [Header("Basic Properties")]
        public string cardName = "Basic Card";
        public int ElixirCost = 1;
        public Sprite cardIcon;
        public GameObject unitPrefab; // Prefab to spawn when card is played
        
        [Header("Stats")]
        public int Health = 100;
        public int Damage = 50;
        public float Speed = 1f; // Movement speed for troops
        public float Range = 1f; // Attack range
        public float AttackSpeed = 1f; // Attacks per second
        
        [Header("Card Type")]
        public CardType Type = CardType.Troop;
        public TargetType TargetType = TargetType.Ground;
        
        [Header("Special Abilities")]
        public bool CanTargetAir = false;
        public bool AreaDamage = false;
        public float AreaRadius = 0f;
        public string SpecialAbility = "";
        
        [Header("Deployment")]
        public float DeployTime = 1f; // Time to spawn after placement
        public bool RequiresTarget = false; // For spells
        
        /// <summary>
        /// Calculate the effectiveness score of this card
        /// Used by AI for decision making
        /// </summary>
        public float GetEffectivenessScore()
        {
            if (ElixirCost == 0) return 0f;
            
            float damagePerElixir = (float)Damage / ElixirCost;
            float healthPerElixir = (float)Health / ElixirCost;
            
            return (damagePerElixir + healthPerElixir) / 2f;
        }
        
        /// <summary>
        /// Check if this card can target the specified unit
        /// </summary>
        public bool CanTarget(Unit target)
        {
            if (target == null) return false;
            
            // Check air/ground targeting
            if (target.IsAirUnit && !CanTargetAir)
                return false;
            
            if (!target.IsAirUnit && TargetType == TargetType.Air)
                return false;
            
            return true;
        }
        
        /// <summary>
        /// Get the deployment cost adjusted for current game state
        /// Could be modified by game effects in future versions
        /// </summary>
        public int GetActualCost()
        {
            // Base implementation just returns the base cost
            // Could be modified by game effects, temporary bonuses, etc.
            return ElixirCost;
        }
        
        /// <summary>
        /// Get a string description of the card for UI display
        /// </summary>
        public string GetDescription()
        {
            string desc = $"{cardName}\\n";
            desc += $"Cost: {ElixirCost} elixir\\n";
            desc += $"Type: {Type}\\n";
            
            if (Health > 0)
                desc += $"Health: {Health}\\n";
            
            if (Damage > 0)
                desc += $"Damage: {Damage}\\n";
            
            if (Type == CardType.Troop)
                desc += $"Speed: {Speed}\\n";
            
            if (!string.IsNullOrEmpty(SpecialAbility))
                desc += $"Special: {SpecialAbility}";
            
            return desc;
        }
    }
    
    [System.Serializable]
    public enum CardType
    {
        Troop,      // Units that move and attack
        Spell,      // Instant effects
        Building    // Stationary defensive structures
    }
    
    [System.Serializable]
    public enum TargetType
    {
        Ground,     // Can only target ground units
        Air,        // Can only target air units
        Both        // Can target both air and ground
    }
}