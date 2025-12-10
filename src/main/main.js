const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
let mainWindow; // Keep a global reference to the window object
let appTray; // Keep a global reference to the tray icon
let wallpaperUpdateInterval; // To hold our interval ID for scheduling

// Function to save settings to a file
async function saveSettingsToFile(settings) {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    console.log('Settings saved to:', settingsFilePath);
  } catch (error) {
    console.error('Failed to save settings:', error.message);
  }
}

// Function to load settings from a file
function loadSettingsFromFile() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
      return JSON.parse(settingsData);
    }
  } catch (error) {
    console.error('Failed to load settings:', error.message);
  }
  return {}; // Return empty object if no settings or error
}

// Function to fetch a random image from Unsplash
async function fetchUnsplashImage(apiKey, searchTerms) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.unsplash.com/photos/random');
    if (searchTerms) {
      url.searchParams.append('query', searchTerms);
    }
    url.searchParams.append('orientation', 'landscape'); // Ensure landscape images

    const options = {
      headers: {
        Authorization: `Client-ID ${apiKey}`
      }
    };

    https.get(url.toString(), options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const imageData = JSON.parse(data);
            resolve(imageData.urls.full); // Get the full image URL
          } catch (e) {
            reject(new Error('Failed to parse Unsplash API response: ' + e.message));
          }
        } else {
          reject(new Error(`Unsplash API error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error('Failed to connect to Unsplash API: ' + err.message));
    });
  });
}

// Function to download an image
async function downloadImage(imageUrl, filePath) {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      } else {
        reject(new Error(`Failed to download image: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Function to set wallpaper (Windows-specific using PowerShell)
async function setWallpaper(imagePath) {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to set wallpaper to: ${imagePath}`);
    
    // Construct the full path to powershell.exe and rundll32.exe for robustness
    const psPath = path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    const rundll32Path = path.join(process.env.SystemRoot, 'System32', 'rundll32.exe');

    // Use the call operator (&) in PowerShell to execute the command with the full path
    const command = `"${psPath}" -Command "& {{Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name Wallpaper -Value '${imagePath}'; & '${rundll32Path}' user32.dll,UpdatePerUserSystemParameters}}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error setting wallpaper: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        // PowerShell often outputs non-fatal warnings to stderr, so we log them but don't reject.
        console.warn(`PowerShell stderr: ${stderr}`);
      }
      console.log(`Wallpaper set successfully. stdout: ${stdout}`);
      resolve();
    });
  });
}

// Function to handle the actual wallpaper update process
async function updateWallpaper(apiKey, searchTerms) {
  if (!apiKey) {
    console.warn('API Key is missing for wallpaper update. Skipping.');
    return;
  }
  try {
    const imageUrl = await fetchUnsplashImage(apiKey, searchTerms);
    console.log('Fetched Unsplash image URL:', imageUrl);

    const tempDir = app.getPath('temp');
    const imagePath = path.join(tempDir, 'unsplash_wallpaper.jpg');
    await downloadImage(imageUrl, imagePath);
    console.log('Image downloaded to:', imagePath);

    await setWallpaper(imagePath);
    console.log('Wallpaper update initiated.');
  } catch (error) {
    console.error('Error during scheduled wallpaper update:', error.message);
  }
}

// Function to stop the existing scheduler
function stopWallpaperScheduler() {
  if (wallpaperUpdateInterval) {
    clearInterval(wallpaperUpdateInterval);
    console.log('Wallpaper scheduler stopped.');
  }
}

// Function to start the wallpaper scheduler
function startWallpaperScheduler(frequency, apiKey, searchTerms) {
  stopWallpaperScheduler(); // Stop any existing scheduler first

  let intervalMs = 0;
  switch (frequency) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'manual':
    default:
      console.log('Manual update frequency selected. Scheduler not started.');
      return;
  }

  console.log(`Starting wallpaper scheduler: updating ${frequency}`);
  wallpaperUpdateInterval = setInterval(() => updateWallpaper(apiKey, searchTerms), intervalMs);
}


function createWindow (initialSettings = {}) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation
      nodeIntegration: false // Disable Node.js integration
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Send initial settings to the renderer process once it's ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('load-settings', initialSettings);
  });

  // Handle window close event to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) { // Only hide if not explicitly quitting
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(async () => { // Made this async to await loadSettings
  // Load settings on startup
  const loadedSettings = loadSettingsFromFile();
  
  createWindow(loadedSettings);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(loadedSettings);
  });

  // Create system tray icon
  const iconPath = path.join(app.getAppPath(), 'build/icon.png');
  appTray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => {
        app.isQuitting = true; // Set flag to allow app to quit
        app.quit();
    }}
  ]);
  appTray.setToolTip('Unsplash Wallpaper App');
  appTray.setContextMenu(contextMenu);

  // If API key exists, trigger wallpaper update with loaded settings
  if (loadedSettings.apiKey) {
    console.log('Applying wallpaper with loaded settings...');
    // Initial update on startup
    await updateWallpaper(loadedSettings.apiKey, loadedSettings.searchTerms);
    // Start scheduler if frequency is set
    startWallpaperScheduler(loadedSettings.updateFrequency, loadedSettings.apiKey, loadedSettings.searchTerms);
  }
});

app.on('window-all-closed', function () {
  // Overridden to prevent app from quitting when window is closed.
  // The app will continue to run in the system tray.
});

ipcMain.handle('save-settings', async (event, settings) => {
  console.log('Settings received in main process:', settings);
  const { apiKey, searchTerms, updateFrequency } = settings;

  // Save settings immediately
  await saveSettingsToFile(settings);

  if (!apiKey) {
    console.error('API Key is required to fetch Unsplash images. Scheduler stopped.');
    stopWallpaperScheduler();
    return;
  }

  // Trigger an immediate update and then start/update the scheduler
  await updateWallpaper(apiKey, searchTerms);
  startWallpaperScheduler(updateFrequency, apiKey, searchTerms);
});