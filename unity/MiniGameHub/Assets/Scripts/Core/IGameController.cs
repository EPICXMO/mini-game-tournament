namespace MiniGameHub.Core
{
    public interface IGameController
    {
        void StartGame();
        void StopGame();
        void ReportScore(int score);
    }
}


