const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  nextWallpaper: (settings) => ipcRenderer.invoke('next-wallpaper', settings),
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
})
