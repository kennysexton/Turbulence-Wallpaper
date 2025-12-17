const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getNextImage: (settings) => ipcRenderer.invoke('get-next-image', settings),
  setWallpaper: (photoData) => ipcRenderer.invoke('set-wallpaper', photoData),
  openExternal: (url) => ipcRenderer.invoke('open-external-link', url),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  on: (channel, callback) => {
    // Deliberately strip event as it includes sender information
    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
});