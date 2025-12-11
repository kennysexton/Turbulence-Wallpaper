const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  nextWallpaper: (settings) => ipcRenderer.invoke('next-wallpaper', settings),
  on: (channel, callback) => {
    // Deliberately strip event as it includes sender information
    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
});