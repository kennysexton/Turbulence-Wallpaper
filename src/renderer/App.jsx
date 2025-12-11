import React, { useState, useEffect, useCallback } from 'react';
import SettingsPage from './SettingsPage.jsx';
import Preview from './Preview.jsx';
import { UpdateFrequency } from '../shared/enums.js';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [searchTerms, setSearchTerms] = useState('nature');
  const [updateFrequency, setUpdateFrequency] = useState(UpdateFrequency.DAILY);
  const [currentPhoto, setCurrentPhoto] = useState(null); // New state for current photo data

  // Load initial settings and current photo from main process
  useEffect(() => {
    if (window.api && window.api.on) {
      const unsubscribeSettings = window.api.on('load-settings', (settings) => {
        setApiKey(settings.apiKey || '');
        setSearchTerms(settings.searchTerms || 'nature');
        setUpdateFrequency(settings.updateFrequency || UpdateFrequency.DAILY);
      });
      const unsubscribePhoto = window.api.on('load-current-photo', (photo) => {
        setCurrentPhoto(photo);
      });
      // Cleanup listeners on component unmount
      return () => {
        unsubscribeSettings();
        unsubscribePhoto();
      };
    }
  }, []);

  // Function to save settings, passed to SettingsPage
  const handleSaveSettings = useCallback((newSettings) => {
    setApiKey(newSettings.apiKey);
    setSearchTerms(newSettings.searchTerms);
    setUpdateFrequency(newSettings.updateFrequency);
    if (window.api && window.api.saveSettings) {
      window.api.saveSettings(newSettings);
      alert('Settings saved and wallpaper update triggered!');
    } else {
      console.error('API not available to save settings.');
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      {/* Main content - Preview */}
      <div className="grow flex items-center justify-center">
        <Preview apiKey={apiKey} searchTerms={searchTerms} currentPhoto={currentPhoto} />
      </div>

      {/* Button to open settings, always visible */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowSettings(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-hidden focus:shadow-outline"
        >
          Open Settings
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SettingsPage 
            apiKey={apiKey}
            setApiKey={setApiKey}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            updateFrequency={updateFrequency}
            setUpdateFrequency={setUpdateFrequency}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;