# Turbulence Wallpaper
A lightweight Electron-based Windows application that automatically updates the desktop wallpaper using images from the Unsplash API.

---

## 🌟 Overview

This project uses **Electron**, **Node.js**, and **React** to build a Windows desktop app. The app periodically fetches an image from Unsplash (based on the user’s settings) and sets it as the system wallpaper.

The application is packaged as an **MSIX** to allow distribution through the **Microsoft Store**.

---

## 🔑 Bring your own API key (required)

Users must create their [own API access key](https://unsplash.com/developers) to run the app. 
This is because wallpaper app unfortunately [does not qualify for a production level rate limit](https://help.unsplash.com/en/articles/2511257-guideline-replicating-unsplash)

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
