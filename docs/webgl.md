# WebGL CI Build & GitHub Pages Deploy

This project can produce a WebGL build of the Unity client and publish it to GitHub Pages via GitHub Actions.

## How it works

- Workflow: `.github/workflows/webgl-deploy.yml`
- Triggers:
  - Manual: Run workflow (workflow_dispatch)
  - Automatic: on push to `master` when files under `unity/**` change
- Jobs:
  - build: Uses `game-ci/unity-builder` to build WebGL from `unity/MiniGameHub`.
    - If `UNITY_LICENSE` secret is present, a full WebGL build is produced at `unity/MiniGameHub/build/WebGL` and uploaded as a Pages artifact.
    - If not present, the job attempts an editor compile and skips the deploy step gracefully.
  - deploy: Publishes the uploaded artifact to GitHub Pages.

## Prerequisites

1. Enable GitHub Pages in the repository settings:
   - Settings → Pages → Build and deployment → Source: GitHub Actions.
2. Optional (for full builds): Add GitHub Secrets for Unity activation:
   - `UNITY_LICENSE` (recommended)
   - `UNITY_EMAIL` (optional)
   - `UNITY_PASSWORD` (optional)
   - `UNITY_SERIAL` (optional)

If `UNITY_LICENSE` is missing, the workflow will still run but skip deployment.

## Where to find the URL

After a successful `deploy-pages` step, the build URL appears in the job summary and on the repository’s Pages settings page.

Typical URL format:
```
https://<owner>.github.io/<repo>/
```

## Local notes

- The build script exposes `UnityBuilderAction.BuildScript.BuildWebGLAll()` which builds:
  - `Assets/Scenes/Lobby.unity`
  - `Assets/MiniGames/Jetpack/Jetpack.unity`
- To add more scenes, include them in Unity’s Build Settings or extend the script.
