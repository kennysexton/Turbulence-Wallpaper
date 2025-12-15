# 📸 Turbulence Wallpaper
A lightweight Electron-based Windows application that automatically updates the desktop wallpaper using images from the Unsplash API.

---

## 🌟 Overview

This project uses **Electron**, **Node.js**, and **React** to build a native-feeling Windows desktop app. The app periodically fetches an image from Unsplash (based on the user’s settings) and sets it as the system wallpaper.

The application is packaged as an **MSIX** to allow distribution through the **Microsoft Store**.

---

## 🏗️ Architecture Summary

### **Electron Main Process**
- Manages application startup, windows, and system integration  
- Stores configuration (API keys, preferences) in the user’s AppData directory  
- Runs the wallpaper update scheduler  
- Invokes the wallpaper-setting service via Node.js

### **Renderer (UI)**
- Built with HTML/CSS/JS or React  
- Prompts user for Unsplash API key  
- Allows configuration of search terms and update frequency  
- Sends preferences to the main process via IPC

### **Wallpaper Service**
- Calls Unsplash REST endpoints using the user’s API key  
- Downloads a selected image to a local directory  
- Sets the wallpaper by invoking:
  - Windows `SystemParametersInfoW(SPI_SETDESKWALLPAPER)`  
  - via a Node native module or PowerShell invocation  

---

## 🛠️ Technology Choices

- **Electron** for desktop application shell  
- **Node.js** for backend operations (filesystem, network calls)  
- **JavaScript or TypeScript** for all logic  
- **Optional React UI** for a richer settings experience  
- **electron-builder** for packaging MSIX and signing

---

## ⏱️ Wallpaper Scheduling

- Updates run from the main process using a repeating timer  
- User-configurable frequency (e.g., daily, hourly, or manual-only)  
- Scheduler validates the API key before making requests  
- App can minimize to tray and continue running updates in the background  

---

## 📦 Distribution: Microsoft Store

Electron apps **can** be distributed through the Windows Store when packaged as MSIX.

### **Packaging Steps**
1. Configure `electron-builder` with the MSIX target:
   ```json
   "win": {
     "target": "msix",
     "publisherName": "Your Publisher Name",
     "identityName": "com.yourcompany.turbulencewallpaper"
   }
   ```
2. Sign the package using a certificate from the Microsoft Partner Center.  
3. Submit the MSIX package via the Partner dashboard.  
4. Provide required listing assets:
   - Screenshots  
   - App description  
   - Privacy policy (required due to network access)  
5. Microsoft performs automated certification before publishing.  

The Windows Store will then handle **installations**, **updates**, and **version management**.
