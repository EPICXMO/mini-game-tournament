using UnityEngine;

namespace MiniGameHub.Jetpack
{
    public class ScrollingBackground : MonoBehaviour
    {
        [Header("Scrolling Settings")]
        [SerializeField] private float scrollSpeed = 5f;
        [SerializeField] private float backgroundWidth = 20f;
        
        [Header("Background Renderers")]
        [SerializeField] private Renderer[] backgroundRenderers;
        
        private Vector2 offset;
        
        void Start()
        {
            // If no renderers assigned, try to find them
            if (backgroundRenderers == null || backgroundRenderers.Length == 0)
            {
                backgroundRenderers = GetComponentsInChildren<Renderer>();
            }
        }
        
        void Update()
        {
            // Calculate the offset based on time and speed
            offset.x = Time.time * scrollSpeed / backgroundWidth;
            
            // Apply the offset to all background renderers
            foreach (var renderer in backgroundRenderers)
            {
                if (renderer != null && renderer.material != null)
                {
                    renderer.material.mainTextureOffset = offset;
                }
            }
        }
        
        public void SetSpeed(float newSpeed)
        {
            scrollSpeed = newSpeed;
        }
        
        public float GetSpeed()
        {
            return scrollSpeed;
        }
    }
}