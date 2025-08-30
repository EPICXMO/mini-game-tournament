using UnityEngine;
using System.Collections.Generic;

namespace MiniGameHub.ClashRoyale
{
    /// <summary>
    /// Manages the placement grid for Clash Royale mini-game
    /// Provides valid placement zones and handles grid-based positioning
    /// </summary>
    public class PlacementGrid : MonoBehaviour
    {
        [Header("Grid Configuration")]
        [SerializeField] private int gridWidth = 5;
        [SerializeField] private int gridHeight = 8;
        [SerializeField] private float cellSize = 1f;
        [SerializeField] private Vector2 gridOffset = Vector2.zero;
        
        [Header("Zone Configuration")]
        [SerializeField] private int playerZoneHeight = 3; // Bottom 3 rows for player
        [SerializeField] private int aiZoneHeight = 3;     // Top 3 rows for AI
        [SerializeField] private int neutralZoneHeight = 2; // Middle 2 rows
        
        [Header("Visual Feedback")]
        [SerializeField] private GameObject gridCellPrefab;
        [SerializeField] private Color playerZoneColor = Color.blue;
        [SerializeField] private Color aiZoneColor = Color.red;
        [SerializeField] private Color neutralZoneColor = Color.gray;
        [SerializeField] private Color invalidZoneColor = Color.black;
        
        // Grid state
        private GridCell[,] grid;
        private bool[,] occupiedCells;
        private List<GameObject> gridVisuals = new List<GameObject>();
        
        void Start()
        {
            InitializeGrid();
            CreateGridVisuals();
        }
        
        void InitializeGrid()
        {
            grid = new GridCell[gridWidth, gridHeight];
            occupiedCells = new bool[gridWidth, gridHeight];
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    grid[x, y] = new GridCell
                    {
                        gridPosition = new Vector2Int(x, y),
                        worldPosition = GridToWorldPosition(x, y),
                        zone = GetZoneType(y),
                        isOccupied = false
                    };
                }
            }
        }
        
        void CreateGridVisuals()
        {
            if (gridCellPrefab == null) return;
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    Vector2 worldPos = GridToWorldPosition(x, y);
                    GameObject cellVisual = Instantiate(gridCellPrefab, worldPos, Quaternion.identity, transform);
                    
                    var renderer = cellVisual.GetComponent<SpriteRenderer>();
                    if (renderer != null)
                    {
                        renderer.color = GetZoneColor(grid[x, y].zone);
                        // Make it semi-transparent
                        var color = renderer.color;
                        color.a = 0.3f;
                        renderer.color = color;
                    }
                    
                    gridVisuals.Add(cellVisual);
                }
            }
        }
        
        ZoneType GetZoneType(int yIndex)
        {
            if (yIndex < playerZoneHeight)
                return ZoneType.PlayerZone;
            else if (yIndex >= gridHeight - aiZoneHeight)
                return ZoneType.AIZone;
            else
                return ZoneType.NeutralZone;
        }
        
        Color GetZoneColor(ZoneType zone)
        {
            switch (zone)
            {
                case ZoneType.PlayerZone:
                    return playerZoneColor;
                case ZoneType.AIZone:
                    return aiZoneColor;
                case ZoneType.NeutralZone:
                    return neutralZoneColor;
                default:
                    return invalidZoneColor;
            }
        }
        
        Vector2 GridToWorldPosition(int gridX, int gridY)
        {
            float worldX = (gridX - gridWidth / 2f) * cellSize + gridOffset.x;
            float worldY = (gridY - gridHeight / 2f) * cellSize + gridOffset.y;
            return new Vector2(worldX, worldY);
        }
        
        Vector2Int WorldToGridPosition(Vector2 worldPosition)
        {
            Vector2 localPos = worldPosition - gridOffset;
            int gridX = Mathf.RoundToInt(localPos.x / cellSize + gridWidth / 2f);
            int gridY = Mathf.RoundToInt(localPos.y / cellSize + gridHeight / 2f);
            
            return new Vector2Int(gridX, gridY);
        }
        
        /// <summary>
        /// Check if a position is valid for card placement
        /// </summary>
        public bool IsValidPlacement(Vector2 worldPosition, Card card)
        {
            Vector2Int gridPos = WorldToGridPosition(worldPosition);
            
            // Check if position is within grid bounds
            if (gridPos.x < 0 || gridPos.x >= gridWidth || gridPos.y < 0 || gridPos.y >= gridHeight)
                return false;
            
            GridCell cell = grid[gridPos.x, gridPos.y];
            
            // Check if cell is occupied
            if (cell.isOccupied)
                return false;
            
            // Check zone restrictions (for now, simplified - players can place anywhere on their side)
            // In a full implementation, this would check specific card placement rules
            
            return true;
        }
        
        /// <summary>
        /// Check if a player can place a card in a specific zone
        /// </summary>
        public bool CanPlayerPlaceInZone(ZoneType zone, bool isPlayerCard)
        {
            if (isPlayerCard)
            {
                // Player can place in player zone and neutral zone
                return zone == ZoneType.PlayerZone || zone == ZoneType.NeutralZone;
            }
            else
            {
                // AI can place in AI zone and neutral zone
                return zone == ZoneType.AIZone || zone == ZoneType.NeutralZone;
            }
        }
        
        /// <summary>
        /// Get the nearest valid placement position to a target position
        /// </summary>
        public Vector2 GetNearestValidPosition(Vector2 targetPosition, Card card, bool isPlayerCard)
        {
            Vector2Int targetGrid = WorldToGridPosition(targetPosition);
            
            // Search in expanding radius for valid position
            for (int radius = 0; radius <= Mathf.Max(gridWidth, gridHeight); radius++)
            {
                for (int x = -radius; x <= radius; x++)
                {
                    for (int y = -radius; y <= radius; y++)
                    {
                        if (Mathf.Abs(x) == radius || Mathf.Abs(y) == radius) // Only check border of radius
                        {
                            Vector2Int checkPos = new Vector2Int(targetGrid.x + x, targetGrid.y + y);
                            
                            if (checkPos.x >= 0 && checkPos.x < gridWidth && checkPos.y >= 0 && checkPos.y < gridHeight)
                            {
                                Vector2 worldPos = GridToWorldPosition(checkPos.x, checkPos.y);
                                
                                if (IsValidPlacement(worldPos, card) && CanPlayerPlaceInZone(grid[checkPos.x, checkPos.y].zone, isPlayerCard))
                                {
                                    return worldPos;
                                }
                            }
                        }
                    }
                }
            }
            
            // Fallback to original position if no valid position found
            return targetPosition;
        }
        
        /// <summary>
        /// Mark a grid cell as occupied
        /// </summary>
        public void OccupyCell(Vector2 worldPosition)
        {
            Vector2Int gridPos = WorldToGridPosition(worldPosition);
            
            if (gridPos.x >= 0 && gridPos.x < gridWidth && gridPos.y >= 0 && gridPos.y < gridHeight)
            {
                grid[gridPos.x, gridPos.y].isOccupied = true;
                occupiedCells[gridPos.x, gridPos.y] = true;
            }
        }
        
        /// <summary>
        /// Mark a grid cell as free
        /// </summary>
        public void FreeCell(Vector2 worldPosition)
        {
            Vector2Int gridPos = WorldToGridPosition(worldPosition);
            
            if (gridPos.x >= 0 && gridPos.x < gridWidth && gridPos.y >= 0 && gridPos.y < gridHeight)
            {
                grid[gridPos.x, gridPos.y].isOccupied = false;
                occupiedCells[gridPos.x, gridPos.y] = false;
            }
        }
        
        /// <summary>
        /// Get all valid positions for AI placement
        /// Used by AI bot for decision making
        /// </summary>
        public List<Vector2> GetAIValidPositions()
        {
            var positions = new List<Vector2>();
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    GridCell cell = grid[x, y];
                    
                    if (!cell.isOccupied && CanPlayerPlaceInZone(cell.zone, false))
                    {
                        positions.Add(cell.worldPosition);
                    }
                }
            }
            
            return positions;
        }
        
        void OnDrawGizmosSelected()
        {
            // Draw grid in editor
            Gizmos.color = Color.white;
            
            for (int x = 0; x <= gridWidth; x++)
            {
                Vector2 start = GridToWorldPosition(x, 0) - Vector2.up * cellSize * 0.5f;
                Vector2 end = GridToWorldPosition(x, gridHeight - 1) + Vector2.up * cellSize * 0.5f;
                Gizmos.DrawLine(start, end);
            }
            
            for (int y = 0; y <= gridHeight; y++)
            {
                Vector2 start = GridToWorldPosition(0, y) - Vector2.right * cellSize * 0.5f;
                Vector2 end = GridToWorldPosition(gridWidth - 1, y) + Vector2.right * cellSize * 0.5f;
                Gizmos.DrawLine(start, end);
            }
        }
    }
    
    [System.Serializable]
    public class GridCell
    {
        public Vector2Int gridPosition;
        public Vector2 worldPosition;
        public ZoneType zone;
        public bool isOccupied;
    }
    
    [System.Serializable]
    public enum ZoneType
    {
        PlayerZone,
        NeutralZone,
        AIZone
    }
}