import React from 'react';

function Preview({ apiKey, searchTerms }) {
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
    <div className="bg-white p-4 rounded-lg shadow-md max-w-sm mx-auto mt-4 text-center">
      <h2 className="text-xl font-semibold mb-3">Wallpaper Preview</h2>
      <p className="text-gray-600 mb-4">Click below to change the wallpaper immediately.</p>
      <button 
        onClick={handleNextWallpaper}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Next Image
      </button>
    </div>
  );
}

export default Preview;
