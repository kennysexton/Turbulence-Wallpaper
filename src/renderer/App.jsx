import React, { useState, useEffect } from 'react';
import { UpdateFrequency } from '../shared/enums.js'; // Note the .js extension

function App() {
  const [apiKey, setApiKey] = useState('');
  const [searchTerms, setSearchTerms] = useState('nature');
  const [updateFrequency, setUpdateFrequency] = useState(UpdateFrequency.DAILY);

  useEffect(() => {
    // Listen for initial settings from the main process
    if (window.api && window.api.on) {
      window.api.on('load-settings', (settings) => {
        if (settings.apiKey) {
          setApiKey(settings.apiKey);
        }
        if (settings.searchTerms) {
          setSearchTerms(settings.searchTerms);
        }
        if (settings.updateFrequency) {
          setUpdateFrequency(settings.updateFrequency);
        }
      });
    }
  }, []);

  const handleSaveSettings = () => {
    if (window.api && window.api.saveSettings) {
      window.api.saveSettings({ apiKey, searchTerms, updateFrequency });
      alert('Settings saved and wallpaper update triggered!');
    } else {
      console.error('API not available to save settings.');
    }
  };

  const handleNextWallpaper = () => {
    if (window.api && window.api.nextWallpaper) {
      if (!apiKey) {
        alert('Please enter an Unsplash API Key first.');
        return;
      }
      window.api.nextWallpaper({ apiKey, searchTerms });
      alert('Fetching next image...');
    } else {
      console.error('API not available to fetch next wallpaper.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Unsplash Wallpaper Settings</h1>
      <p className="mb-6 text-gray-700">Welcome to the Unsplash Wallpaper app. Please configure your settings below.</p>
      
      <div className="mb-4">
        <label htmlFor="api-key" className="block text-gray-700 text-sm font-bold mb-2">Unsplash API Key:</label>
        <input 
          type="text" 
          id="api-key" 
          name="api-key" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your Unsplash Access Key"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="search-terms" className="block text-gray-700 text-sm font-bold mb-2">Search Terms:</label>
        <input 
          type="text" 
          id="search-terms" 
          name="search-terms" 
          value={searchTerms} 
          onChange={(e) => setSearchTerms(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="e.g., nature, city, abstract"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="update-frequency" className="block text-gray-700 text-sm font-bold mb-2">Update Frequency:</label>
        <select 
          id="update-frequency" 
          name="update-frequency" 
          value={updateFrequency} 
          onChange={(e) => setUpdateFrequency(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {Object.entries(UpdateFrequency).map(([key, value]) => (
            <option key={key} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={handleSaveSettings}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Settings
        </button>
        <button 
          onClick={handleNextWallpaper}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Next Image
        </button>
      </div>
    </div>
  );
}

export default App;