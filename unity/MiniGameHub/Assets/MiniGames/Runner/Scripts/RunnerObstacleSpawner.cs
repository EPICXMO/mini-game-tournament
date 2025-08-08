using UnityEngine;

namespace MiniGameHub.Runner
{
    public class RunnerObstacleSpawner : MonoBehaviour
    {
        [SerializeField] private GameObject obstaclePrefab;
        [SerializeField] private float spawnInterval = 1.5f;
        [SerializeField] private float initialSpeed = 5f;
        [SerializeField] private float speedIncreasePerMinute = 1.0f;

        private float timer;
        private float startTime;

        private void Start()
        {
            startTime = Time.time;
        }

        private void Update()
        {
            timer += Time.deltaTime;
            if (timer >= spawnInterval)
            {
                timer = 0f;
                Spawn();
            }
        }

        private void Spawn()
        {
            if (obstaclePrefab == null) return;
            var go = Instantiate(obstaclePrefab, transform.position, Quaternion.identity);
            float elapsedMinutes = (Time.time - startTime) / 60f;
            float speed = initialSpeed + speedIncreasePerMinute * elapsedMinutes;
            var mover = go.AddComponent<RunnerObstacle>();
            mover.speed = speed;
        }
    }

    public class RunnerObstacle : MonoBehaviour
    {
        public float speed = 5f;
        private void Update()
        {
            transform.position += Vector3.left * speed * Time.deltaTime;
            if (transform.position.x < -30f)
            {
                Destroy(gameObject);
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (other.CompareTag("Player"))
            {
                var gm = FindObjectOfType<RunnerGameManager>();
                if (gm != null) gm.EndRun();
            }
        }
    }
}


