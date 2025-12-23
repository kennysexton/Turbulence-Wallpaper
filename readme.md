# Turbulence Wallpaper
A lightweight Electron-based Windows application that automatically updates the desktop wallpaper using images from the Unsplash API.

---

## Overview

This project uses **Electron**, **Node.js**, and **React** to build a Windows desktop app. The app periodically fetches an image from Unsplash (based on the user’s settings) and sets it as the system wallpaper.

---

## Bring your own API key (required)

Users must create their [own API access key](https://unsplash.com/developers) to run the app. 
This is because wallpaper app unfortunately [does not qualify for a production level rate limit](https://help.unsplash.com/en/articles/2511257-guideline-replicating-unsplash)

---

## Features
 
- Preview photos before setting them
- Can set an automated schedule for updating the background