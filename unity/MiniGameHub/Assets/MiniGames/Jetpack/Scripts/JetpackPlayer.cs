using UnityEngine;
using MiniGameHub.Core;

namespace MiniGameHub.Jetpack
{
    [RequireComponent(typeof(Rigidbody2D))]
    public class JetpackPlayer : MonoBehaviour
    {
        [Header("Jetpack Settings")]
        [SerializeField] private float thrustForce = 500f;
        [SerializeField] private float gravityScale = 2f;
        [SerializeField] private float maxVelocity = 10f;
        
        [Header("Ground Settings")]
        [SerializeField] private float groundLevel = -4f;
        [SerializeField] private bool canLandOnGround = true;
        
        [Header("Audio")]
        [SerializeField] private AudioSource jetpackAudioSource;
        
        private Rigidbody2D rb;
        private bool isThrusting = false;
        private bool isGrounded = false;
        private JetpackGameManager gameManager;
        
        // Input handling
        private bool thrustInput = false;
        
        void Start()
        {
            rb = GetComponent<Rigidbody2D>();
            rb.gravityScale = gravityScale;
            
            gameManager = FindObjectOfType<JetpackGameManager>();
            
            // Ensure we start above ground
            if (transform.position.y <= groundLevel)
            {
                transform.position = new Vector3(transform.position.x, groundLevel + 0.5f, transform.position.z);
            }
        }
        
        void Update()
        {
            HandleInput();
            CheckGroundCollision();
            ClampVelocity();
        }
        
        void HandleInput()
        {
            // Handle both keyboard and touch input
            thrustInput = Input.GetKey(KeyCode.Space) || 
                         Input.GetMouseButton(0) || 
                         (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Stationary) ||
                         (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Moved);
        }
        
        void FixedUpdate()
        {
            if (thrustInput && !isGrounded)
            {
                ApplyThrust();
            }
            else
            {
                StopThrust();
            }
        }
        
        void ApplyThrust()
        {
            if (!isThrusting)
            {
                isThrusting = true;
                if (jetpackAudioSource != null)
                {
                    jetpackAudioSource.Play();
                }
            }
            
            rb.AddForce(Vector2.up * thrustForce * Time.fixedDeltaTime);
        }
        
        void StopThrust()
        {
            if (isThrusting)
            {
                isThrusting = false;
                if (jetpackAudioSource != null)
                {
                    jetpackAudioSource.Stop();
                }
            }
        }
        
        void CheckGroundCollision()
        {
            bool wasGrounded = isGrounded;
            isGrounded = transform.position.y <= groundLevel;
            
            if (isGrounded && !wasGrounded)
            {
                // Just landed
                transform.position = new Vector3(transform.position.x, groundLevel, transform.position.z);
                rb.velocity = new Vector2(rb.velocity.x, 0f);
                StopThrust();
            }
        }
        
        void ClampVelocity()
        {
            if (rb.velocity.y > maxVelocity)
            {
                rb.velocity = new Vector2(rb.velocity.x, maxVelocity);
            }
            else if (rb.velocity.y < -maxVelocity)
            {
                rb.velocity = new Vector2(rb.velocity.x, -maxVelocity);
            }
        }
        
        void OnTriggerEnter2D(Collider2D other)
        {
            if (other.CompareTag("Obstacle"))
            {
                // Player hit an obstacle - game over
                if (gameManager != null)
                {
                    gameManager.GameOver();
                }
            }
            else if (other.CompareTag("Coin"))
            {
                // Collect coin
                if (gameManager != null)
                {
                    gameManager.CollectCoin();
                }
                Destroy(other.gameObject);
            }
        }
        
        public bool IsThrusting => isThrusting;
        public bool IsGrounded => isGrounded;
        public Vector2 Velocity => rb.velocity;
    }
}