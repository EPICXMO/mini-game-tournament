using UnityEngine;

namespace MiniGameHub.Runner
{
    public class RunnerPlayer : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float jumpForce = 7.5f;
        [SerializeField] private float gravityScale = 3.0f;
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private Transform groundCheck;
        [SerializeField] private float groundCheckRadius = 0.15f;

        private Rigidbody2D rb;
        private bool isGrounded;

        private void Awake()
        {
            rb = GetComponent<Rigidbody2D>();
            if (rb != null)
            {
                rb.gravityScale = gravityScale;
            }
        }

        private void Update()
        {
            isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundMask);

            if (Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0) || Input.touchCount > 0)
            {
                TryJump();
            }
        }

        private void TryJump()
        {
            if (!isGrounded) return;
            rb.velocity = new Vector2(rb.velocity.x, 0f);
            rb.AddForce(Vector2.up * jumpForce, ForceMode2D.Impulse);
        }
    }
}


