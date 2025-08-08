using UnityEngine;
using MiniGameHub.Core;

namespace MiniGameHub.Runner
{
    public class RunnerGameManager : MonoBehaviour
    {
        [SerializeField] private Transform player;
        [SerializeField] private float distanceScoreMultiplier = 1f;

        private float startX;
        private int bestThisSession;
        private TournamentManager tournamentManager;

        private void Start()
        {
            if (player != null) startX = player.position.x;
            tournamentManager = FindObjectOfType<TournamentManager>();
        }

        private void Update()
        {
            // Simple HUD via Debug log or future UI binding
        }

        public int GetScore()
        {
            if (player == null) return 0;
            float distance = Mathf.Max(0f, player.position.x - startX);
            return Mathf.FloorToInt(distance * distanceScoreMultiplier);
        }

        public void EndRun()
        {
            int score = GetScore();
            if (score > bestThisSession) bestThisSession = score;

            if (tournamentManager != null)
            {
                tournamentManager.SubmitScore(score);
            }

            Debug.Log($"[Runner] Run ended. Score={score}, SessionBest={bestThisSession}");
        }
    }
}


