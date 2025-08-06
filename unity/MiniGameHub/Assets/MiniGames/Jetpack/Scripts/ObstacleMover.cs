using UnityEngine;

namespace MiniGameHub.Jetpack
{
    public class ObstacleMover : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] private float moveSpeed = 5f;
        [SerializeField] private Vector2 moveDirection = Vector2.left;
        
        void Update()
        {
            // Move the obstacle left at the specified speed
            transform.Translate(moveDirection * moveSpeed * Time.deltaTime);
        }
        
        public void SetSpeed(float newSpeed)
        {
            moveSpeed = newSpeed;
        }
        
        public float GetSpeed()
        {
            return moveSpeed;
        }
        
        void OnBecameInvisible()
        {
            // Destroy the obstacle when it goes off screen
            // This is a backup cleanup in case the spawner doesn't catch it
            if (transform.position.x < -20f)
            {
                Destroy(gameObject);
            }
        }
    }
}