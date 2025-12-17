import React from 'react';
import { ReactComponent as AppIcon } from '../icons/app-icon.svg';
import { ReactComponent as CloseIcon } from '../icons/close.svg';
import { ReactComponent as MinusIcon } from '../icons/minus.svg'; // New import
import IconButton from './IconButton';

const TitleBar = () => {
  const handleClose = () => {
    if (window.api && window.api.closeWindow) {
      window.api.closeWindow();
    }
  };

  const handleMinimize = () => { // New handler
    if (window.api && window.api.minimizeWindow) {
      window.api.minimizeWindow();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-10 pl-2 backdrop-blur-md bg-white/40 text-slate-800"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center">
        <AppIcon className="h-5 w-5 mr-2" />
        <span className="font-semibold text-sm text-nowrap">Turbulence Wallpaper</span>
      </div>
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}> {/* Container for buttons */}
        <button
          onClick={handleMinimize}
          className="w-12 h-10 flex items-center justify-center hover:bg-gray-200" // Standard hover for minimize
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white" // Windows-like close hover
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
};

export default TitleBar;
