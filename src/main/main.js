const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

const packageJson = require('../../package.json');
// Sanitize the app name to create a valid directory name
const appName = (packageJson.name || 'Turbulence-Wallpaper').replace(/[<>:"/\\|?*]/g, '');

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
const currentPhotoFilePath = path.join(app.getPath('userData'), 'current-photo.json');

let mainWindow; // Keep a global reference to the window object
let appTray; // Keep a global reference to the tray icon
let wallpaperUpdateInterval; // To hold our interval ID for scheduling

/**
 * @typedef {object} UserSettings
 * @property {string} [apiKey]
 * @property {string} [searchTerms]
 * @property {string} [updateFrequency]
 */

/**
 * @typedef {object} CurrentPhoto
 * @property {string} id
 * @property {string} fullUrl
 * @property {string} [locationName]
 * @property {string} [userName]
 * @property {string} [userProfileUrl]
 */

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

// Function to save current photo data to a file
async function saveCurrentPhotoToFile(photo) {
  try {
    fs.writeFileSync(currentPhotoFilePath, JSON.stringify(photo, null, 2));
    console.log('Current photo data saved to:', currentPhotoFilePath);
  } catch (error) {
    console.error('Failed to save current photo data:', error.message);
  }
}

// Function to load current photo data from a file
function loadCurrentPhotoFromFile() {
  try {
    if (fs.existsSync(currentPhotoFilePath)) {
      const photoData = fs.readFileSync(currentPhotoFilePath, 'utf8');
      return JSON.parse(photoData);
    }
  } catch (error) {
    console.error('Failed to load current photo data:', error.message);
  }
  return null; // Return null if no photo data or error
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
            resolve(imageData); // Resolve with the full image data object
          } catch (e) {
            reject(new Error('Failed to parse Unsplash API response: ' + e.message));
          }
        } else {
          reject(new Error(`Unsplash API error: ${res.statusCode} - ${data}`));
          }
        }
      ).on('error', (err) => {
        reject(new Error('Failed to connect to Unsplash API: ' + err.message));
      });
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
    console.log(`Attempting to set wallpaper directly via Win32 API for path: ${imagePath}`);

    const psPath = path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');

    // This command uses the more reliable SystemParametersInfo Win32 API call to set the wallpaper.
    // This method is more direct and less prone to caching issues than the registry + refresh method.
    const command = `
      try {
        $code = @"
        using System;
        using System.Runtime.InteropServices;
        using Microsoft.Win32;
        public class Wallpaper {
            [DllImport("user32.dll", CharSet=CharSet.Auto)]
            public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
            public const int SPI_SETDESKWALLPAPER = 0x0014;
            public const int SPIF_UPDATEINIFILE = 0x0001;
            public const int SPIF_SENDCHANGE = 0x0002;
        }
"@

        Add-Type -TypeDefinition $code

        # Set the wallpaper by calling the Win32 API function directly.
        $result = [Wallpaper]::SystemParametersInfo([Wallpaper]::SPI_SETDESKWALLPAPER, 0, "${imagePath}", ([Wallpaper]::SPIF_UPDATEINIFILE -bor [Wallpaper]::SPIF_SENDCHANGE))

        if ($result -ne 1) {
            # A non-true result from the API call indicates a failure.
            throw "SystemParametersInfo API call failed to set wallpaper."
        }
        
        Write-Output "Wallpaper set successfully via SystemParametersInfo."
        exit 0

      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }
    `;

    console.log('Spawning PowerShell process to call Win32 API...');
    const ps = spawn(psPath, ['-Command', command]);

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`PowerShell stdout: ${output.trim()}`);
      stdout += output;
    });

    ps.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`PowerShell stderr: ${errorOutput.trim()}`);
      stderr += errorOutput;
    });

    ps.on('close', (code) => {
      console.log(`PowerShell process exited with code ${code}`);
      if (code === 0) {
        console.log('Wallpaper operation completed successfully.');
        resolve();
      } else {
        reject(new Error(`PowerShell script failed with code ${code}. Stderr: ${stderr.trim()}`));
      }
    });

    ps.on('error', (err) => {
      console.error('Failed to start PowerShell process.', err);
      reject(err);
    });
  });
}

/**
 * Takes a photo data object, downloads the image, sets it as the wallpaper,
 * saves the metadata, and notifies the renderer.
 * @param {CurrentPhoto} photoData - The photo object to be processed.
 */
async function processAndSetWallpaper(photoData) {
  if (!photoData || !photoData.fullUrl) {
    console.error('Invalid photo data provided to processAndSetWallpaper.');
    return;
  }

  try {
    const downloadDir = path.join(app.getPath('temp'), appName);
    fs.mkdirSync(downloadDir, { recursive: true });

    const imagePath = path.join(downloadDir, `unsplash_wallpaper_${photoData.id}.jpg`);
    await downloadImage(photoData.fullUrl, imagePath);
    console.log('Image for wallpaper downloaded to:', imagePath);

    await setWallpaper(imagePath);
    await saveCurrentPhotoToFile(photoData);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('load-current-photo', photoData);
    }
  } catch (error) {
    console.error('Error during processAndSetWallpaper:', error.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('load-current-photo', null); // Send null on error
    }
  }
}

// Function to handle the actual wallpaper update process
async function updateWallpaper(apiKey, searchTerms) {
  if (!apiKey) {
    console.warn('API Key is missing for wallpaper update. Skipping.');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('load-current-photo', null);
    }
    return;
  }

  try {
    const imageData = await fetchUnsplashImage(apiKey, searchTerms);
    console.log(`Fetched Unsplash image (ID: ${imageData.id})`);

    // Transform the raw API data into our CurrentPhoto shape
    const currentPhoto = {
      id: imageData.id,
      fullUrl: imageData.urls.full,
      locationName: imageData.location?.name,
      userName: imageData.user?.name,
      userProfileUrl: imageData.user?.links?.html,
      description: imageData.description,
      htmlLink: imageData.links.html,
    };

    await processAndSetWallpaper(currentPhoto);

  } catch (error) {
    console.error('Error during scheduled wallpaper update:', error.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('load-current-photo', null);
    }
  }
}

const { UpdateFrequency } = require('../shared/enums.js');

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
    case UpdateFrequency.DEBUG:
      intervalMs = 2 * 60 * 1000; // 2 minutes
      break;
    case UpdateFrequency.HOURLY:
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case UpdateFrequency.DAILY:
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case UpdateFrequency.NONE:
    default:
      console.log(`${frequency} update frequency selected. Scheduler not started.`);
      return;
  }

  console.log(`Starting wallpaper scheduler: updating ${frequency}`);
  wallpaperUpdateInterval = setInterval(() => updateWallpaper(apiKey, searchTerms), intervalMs);
}


function createWindow (initialSettings = {}) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation
      nodeIntegration: false // Disable Node.js integration
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));

      // Send initial settings and current photo to the renderer process once it's ready
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('load-settings', initialSettings);
      const loadedPhoto = loadCurrentPhotoFromFile();
      if (loadedPhoto) {
        mainWindow.webContents.send('load-current-photo', loadedPhoto);
      }
    });
  // Handle window close event to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!(app).isQuitting) { // Only hide if not explicitly quitting
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
  const iconPath = path.join(app.getAppPath(), 'src/renderer/public/icon.png');
  appTray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => {
        (app).isQuitting = true; // Set flag to allow app to quit
        app.quit();
    }}
  ]);
  appTray.setToolTip('Turbulence Wallpaper');
  appTray.setContextMenu(contextMenu);

  // If API key exists, trigger wallpaper update with loaded settings
  if (loadedSettings.apiKey) {
    console.log('Setting loaded...');
    // Start scheduler if frequency is set
    startWallpaperScheduler(loadedSettings.updateFrequency || UpdateFrequency.DAILY, loadedSettings.apiKey, loadedSettings.searchTerms);
  }
});

app.on('window-all-closed', function () {
  // Overridden to prevent app from quitting when window is closed.
  // The app will continue to run in the system tray.
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
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

  startWallpaperScheduler(updateFrequency || UpdateFrequency.DAILY, apiKey, searchTerms);
});

// Listener for a request to get the next image data without setting it
ipcMain.handle('get-next-image', async (event, settings) => {
  console.log('Get next image data requested with settings:', settings);
  const { apiKey, searchTerms } = settings;

  if (!apiKey) {
    console.error('API Key is required to fetch the next Unsplash image.');
    return null; // Return null or an error object
  }

  try {
    const imageData = await fetchUnsplashImage(apiKey, searchTerms);
    // Important: We're NOT saving or setting the wallpaper here.
    // We are just returning the data to the renderer process.
    return {
      id: imageData.id,
      fullUrl: imageData.urls.full,
      locationName: imageData.location?.name,
      userName: imageData.user?.name,
      userProfileUrl: imageData.user?.links?.html,
      description: imageData.description,
      htmlLink: imageData.links.html,
    };
  } catch (error) {
    console.error('Error fetching next image data:', error.message);
    return null; // Return null on error
  }
});

// Listener to explicitly set a wallpaper and save the data
ipcMain.handle('set-wallpaper', (event, photoData) => processAndSetWallpaper(photoData));

// Listener to open a URL in the user's default browser
ipcMain.handle('open-external-link', async (event, url) => {
  if (url) {
    await shell.openExternal(url);
  }
});