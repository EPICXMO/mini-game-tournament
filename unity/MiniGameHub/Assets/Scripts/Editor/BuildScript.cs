using UnityEngine;
using UnityEditor;
using System;

namespace UnityBuilderAction
{
    public static class BuildScript
    {
        public static void Build()
        {
            // Get command line arguments
            string[] args = Environment.GetCommandLineArgs();
            string buildPath = "build/";
            BuildTarget buildTarget = BuildTarget.StandaloneWindows64;
            
            // Parse command line arguments
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "-buildPath" && i + 1 < args.Length)
                {
                    buildPath = args[i + 1];
                }
                else if (args[i] == "-buildTarget" && i + 1 < args.Length)
                {
                    if (Enum.TryParse(args[i + 1], out BuildTarget target))
                    {
                        buildTarget = target;
                    }
                }
            }
            
            // Get scenes to build (either from command line or build settings)
            string[] scenes = GetScenesToBuild(args);
            
            if (scenes.Length == 0)
            {
                Debug.LogError("No scenes found to build!");
                EditorApplication.Exit(1);
                return;
            }
            
            // Configure build options
            BuildPlayerOptions buildOptions = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = buildPath + GetBuildName(buildTarget),
                target = buildTarget,
                options = BuildOptions.None
            };
            
            Debug.Log($"Building for target: {buildTarget}");
            Debug.Log($"Build path: {buildOptions.locationPathName}");
            Debug.Log($"Scenes: {string.Join(", ", scenes)}");
            
            // Perform the build
            var report = BuildPipeline.BuildPlayer(buildOptions);
            
            if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
            {
                Debug.Log($"Build succeeded! Size: {report.summary.totalSize} bytes");
                EditorApplication.Exit(0);
            }
            else
            {
                Debug.LogError($"Build failed with result: {report.summary.result}");
                
                // Log any errors
                foreach (var step in report.steps)
                {
                    foreach (var message in step.messages)
                    {
                        if (message.type == LogType.Error || message.type == LogType.Exception)
                        {
                            Debug.LogError($"Build Error: {message.content}");
                        }
                    }
                }
                
                EditorApplication.Exit(1);
            }
        }
        
        private static string[] GetScenesToBuild(string[] args)
        {
            // Check for custom scene list from command line
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "-sceneList" && i + 1 < args.Length)
                {
                    string scenePath = args[i + 1];
                    Debug.Log($"Building specific scene: {scenePath}");
                    return new string[] { scenePath };
                }
            }
            
            // Fall back to build settings
            return GetScenesFromBuildSettings();
        }
        
        private static string[] GetScenesFromBuildSettings()
        {
            var scenes = new string[EditorBuildSettings.scenes.Length];
            for (int i = 0; i < EditorBuildSettings.scenes.Length; i++)
            {
                scenes[i] = EditorBuildSettings.scenes[i].path;
            }
            return scenes;
        }
        
        private static string GetBuildName(BuildTarget target)
        {
            switch (target)
            {
                case BuildTarget.StandaloneWindows:
                case BuildTarget.StandaloneWindows64:
                    return "MiniGameHub.exe";
                case BuildTarget.StandaloneLinux64:
                    return "MiniGameHub";
                case BuildTarget.StandaloneOSX:
                    return "MiniGameHub.app";
                case BuildTarget.Android:
                    return "MiniGameHub.apk";
                case BuildTarget.iOS:
                    return "MiniGameHub";
                default:
                    return "MiniGameHub";
            }
        }
    }
}