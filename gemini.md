# Turbulence Wallpaper - Project Summary

This document provides an overview of the "Turbulence Wallpaper," a lightweight Electron-based application designed to automatically update the desktop wallpaper using images from the Unsplash API with a focus on dynamic and artistic turbulence patterns.

## 🛠️ Technologies Used

*   **Electron:** For building the cross-platform desktop application.
*   **React:** For the user interface (UI) development.
*   **Tailwind CSS:** For rapid and utility-first styling of the UI.
*   **Vite:** As the frontend build tool, providing a fast development server and optimized production builds.
*   **`vite-plugin-svgr`:** For importing SVG assets directly as React components.
*   **Node.js:** For backend operations within the Electron main process (filesystem, network, child processes).
*   **PowerShell:** Utilized in the main process for Windows-specific wallpaper setting.

## 🏗️ Architectural Layout

The application follows a standard Electron architecture with a clear separation between the **Main Process** and the **Renderer Process**.

*   **Electron Main Process:**
    *   Manages the application lifecycle (startup, window management, system tray).
    *   Handles Inter-Process Communication (IPC) with the renderer.
    *   Manages core application logic: Unsplash API calls, image downloading, OS-level wallpaper setting, scheduling, and data persistence.
    *   Stores user settings and current photo metadata in the user's `AppData` directory (`settings.json`, `current-photo.json`).
*   **Renderer Process (React UI):**
    *   Built with React and styled with Tailwind CSS.
    *   Provides the user interface for configuring settings and previewing images.
    *   Communicates with the main process via exposed APIs in the `preload.js` script.
*   **Preload Script (`preload.js`):**
    *   Runs in a sandboxed environment with Node.js access.
    *   Securely exposes specific IPC functions from the main process to the renderer window's `window.api` object.

## 📂 File Structure Layout

The project's file structure is organized for clarity and maintainability:

```
.
├── build/                        # Build-related assets (e.g., application icon for system tray)
│   └── icon.png
├── dist/                         # Output directory for the Vite frontend build (contains index.html, JS, CSS)
├── node_modules/                 # Node.js dependencies
├── src/                          # Source code for the application
│   ├── main/                     # Electron Main Process code
│   │   ├── main.js               # Main entry point for Electron application
│   │   └── preload.js            # Script to bridge Main and Renderer processes securely
│   ├── renderer/                 # React Renderer Process (UI) code
│   │   ├── components/           # Reusable React UI components
│   │   │   └── IconButton.jsx    # Generic button for icons, with tooltip
│   │   ├── icons/                # SVG icon files (processed by vite-plugin-svgr)
│   │   │   ├── settings.svg
│   │   │   └── fast-forward.svg
│   │   ├── App.jsx               # Main React application component (manages settings, preview, state)
│   │   ├── Preview.jsx           # Component for displaying current photo details and actions
│   │   ├── SettingsPage.jsx      # Component for displaying and managing user settings form
│   │   ├── index.css             # Main CSS file (includes Tailwind directives)
│   │   └── main.jsx              # React app entry point
│   └── shared/                   # Code shared between Main and Renderer processes
│       └── enums.js              # Enums for consistent values (e.g., UpdateFrequency)
├── .gitignore                    # Git ignore file
├── package-lock.json             # npm dependency lock file
├── package.json                  # Project metadata and scripts
├── postcss.config.js             # PostCSS configuration for Tailwind
├── readme.md                     # Project README
├── tailwind.config.js            # Tailwind CSS configuration
└── vite.config.js                # Vite build tool configuration
```

## ✨ Key Features

*   **Configurable Settings:** Users can input their Unsplash API key, search terms, and choose update frequencies (2-minutes, hourly, daily, none).
*   **Wallpaper Persistence:** User settings (`settings.json`) and the currently displayed photo's details (`current-photo.json`) are saved and loaded across app sessions.
*   **Scheduled Updates:** Wallpaper updates automatically based on the chosen frequency.
*   **Preview-Only "Next Image":** A dedicated button to fetch and display a new image within the app preview *without* immediately setting it as the desktop wallpaper or saving its data.
*   **Explicit "Set Wallpaper":** A separate button to explicitly apply the currently previewed image as the desktop wallpaper and save its details to persistence.
*   **System Tray Integration:** The app minimizes to the system tray, running in the background, with options to show the app or quit.
*   **Modern UI:** Built with React and styled using Tailwind CSS, featuring an `IconButton` component for actions and a modal-like settings dialog.
*   **Robust Wallpaper Setting:** Uses PowerShell with full paths and a delay to reliably set wallpapers on Windows, bypassing caching issues.

## 🚀 Development Workflow

*   `npm install`: Install all project dependencies.
*   `npm run build`: Compiles the React frontend using Vite into the `dist/` directory.
*   `npm start`: Launches the Electron application, loading the `dist/index.html`.
*   `npm run dev-electron`: A convenience script to run `npm run build && npm start` sequentially.
*   (For more advanced development, `npm run dev` can be used to run the Vite dev server alongside Electron, requiring changes in `main.js` to load the dev server URL.)

### Automated GitHub Releases

The project is configured to automatically create and upload releases to GitHub. This process uses `electron-builder`'s publish functionality.

**Steps to Create a Release:**

1.  **Generate a GitHub Personal Access Token**:
    *   Go to your GitHub account settings.
    *   Navigate to `Developer settings` -> `Personal access tokens`.
    *   Generate a new token with the `repo` scope. This token is sensitive and should be kept private.
2.  **Set the `GH_TOKEN` Environment Variable**:
    *   Before running the release command, set this token as an environment variable named `GH_TOKEN` in your terminal.
    *   Example (PowerShell): `$env:GH_TOKEN="your_token_here"`
    *   Example (Bash/Zsh): `export GH_TOKEN="your_token_here"`
3.  **Run the Release Command**:
    *   Execute `npm run release`. This command will:
        *   Build the application for configured targets (e.g., `.exe` installer, `.appx` package).
        *   Attempt to code-sign the packages (if signing certificates are properly configured).
        *   Create a draft release on your GitHub repository (`kennysexton/Turbulence-Wallpaper`) and upload the built artifacts to it.

**Code Signing:**

*   **AppX (`.appx`) Packages**: Your `package.json` specifies a `publisher` (`CN=Noodle Industries`). For successful signing, a valid code-signing certificate matching this publisher name must be installed on your build machine (typically in the Windows Certificate Store). `electron-builder` will usually detect and use it automatically.
*   **NSIS (`.exe`) Installers**: The current configuration does not explicitly set up signing for the `.exe` installer. If you have a code-signing certificate (e.g., a `.pfx` file), you can configure `electron-builder` to use it by adding `certificateFile`, `certificatePassword`, and `signingTool` properties to the `win` or `nsis` section of your `build` configuration in `package.json`.

## ⚠️ Common Issues & Solutions

### Wallpaper Not Updating on Windows

*   **Symptom:** The application logs show that the wallpaper was set successfully (PowerShell exits with code 0), but the desktop background does not change.
*   **Cause:** This is a common issue caused by Windows Explorer's caching mechanism. The less-reliable method of updating the registry and then sending a refresh signal (`rundll32.exe user32.dll,UpdatePerUserSystemParameters`) can fail silently if Explorer decides to ignore the refresh message and continue using its cached version of the wallpaper.
*   **Solution:** The problem was solved by switching to a more direct and authoritative Win32 API call. The `setWallpaper` function in `src/main/main.js` now uses an embedded C# snippet within the PowerShell script to call the `SystemParametersInfo` function from `user32.dll`. This is the most reliable method for programmatically changing the desktop wallpaper on Windows as it bypasses the caching mechanism and tells the system to update immediately.
*   **Debugging Journey:** The process to fix this involved several steps:
    1.  Switching from Node.js's `exec` to `spawn` to get reliable exit codes and error streams from PowerShell.
    2.  Adding a `try...catch` block within the PowerShell script for robust error handling.
    3.  Using the full path to `rundll32.exe` to solve `PATH` issues in the `spawn` environment.
    4.  Finally, replacing the entire registry/refresh logic with the `SystemParametersInfo` API call.