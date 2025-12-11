import React from 'react';

function Preview({ apiKey, searchTerms, currentPhoto }) {
  const appName = import.meta.env.VITE_APP_NAME; // Get appName directly from Vite env

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

  const unsplashReferralLink = `https://unsplash.com/?utm_source=${appName}&utm_medium=referral`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto text-center border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Wallpaper</h2>
      
      {currentPhoto ? (
        <div className="text-left mb-4 space-y-2">
          <p className="text-gray-700"><strong>ID:</strong> {currentPhoto.id}</p>
          <p className="text-gray-700"><strong>Photographer:</strong>{' '}
            {currentPhoto.userName ? (
              <a href={currentPhoto.userProfileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {currentPhoto.userName}
              </a>
            ) : 'N/A'}
            {' '}on{' '}
            <a href={unsplashReferralLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Unsplash
            </a>
          </p>
          <p className="text-gray-700"><strong>Location:</strong> {currentPhoto.locationName || 'N/A'}</p>
          <p className="text-gray-700">
            <strong>Download:</strong>{' '}
            <a href={currentPhoto.downloadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Link
            </a>
          </p>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No wallpaper information available. Please set your API key and update settings.</p>
      )}

      <button 
        onClick={handleNextWallpaper}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        Next Image
      </button>
    </div>
  );
}

export default Preview;

