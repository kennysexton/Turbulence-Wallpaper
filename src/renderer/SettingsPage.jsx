import React from 'react';
import { UpdateFrequency } from '../shared/enums.js';

function SettingsPage({ 
  apiKey, setApiKey, 
  searchTerms, setSearchTerms, 
  updateFrequency, setUpdateFrequency, 
  onSave, onClose 
}) {
  const handleSaveSettings = () => {
    onSave({ apiKey, searchTerms, updateFrequency });
    if (onClose) onClose();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg mx-auto mt-10 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          &times;
        </button>
      )}
      <h1 className="text-2xl font-bold mb-4">Unsplash Wallpaper Settings</h1>
      <p className="mb-6 text-gray-700">Please configure your settings below.</p>
      
      <div className="mb-4">
        <label htmlFor="api-key" className="block text-gray-700 text-sm font-bold mb-2">Unsplash API Key:</label>
        <input 
          type="text" 
          id="api-key" 
          name="api-key" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          className="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
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
          className="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
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
          className="shadow-sm border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
        >
          {Object.entries(UpdateFrequency).map(([key, value]) => (
            <option key={key} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button 
          onClick={handleSaveSettings}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-hidden focus:shadow-outline"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
