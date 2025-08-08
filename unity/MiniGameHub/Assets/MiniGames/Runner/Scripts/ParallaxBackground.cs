using UnityEngine;

namespace MiniGameHub.Runner
{
    public class ParallaxBackground : MonoBehaviour
    {
        [SerializeField] private float parallaxSpeed = 0.5f;
        private Vector3 startPos;

        private void Start()
        {
            startPos = transform.position;
        }

        private void Update()
        {
            transform.position += Vector3.left * parallaxSpeed * Time.deltaTime;
            if (transform.position.x < startPos.x - 20f)
            {
                transform.position = startPos;
            }
        }
    }
}


