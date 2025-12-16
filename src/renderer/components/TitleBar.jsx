import React from 'react';
import { ReactComponent as AppIcon } from '../icons/app-icon.svg';

const TitleBar = () => {
  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <AppIcon className="h-5 w-5 mr-2" />
        <span className="font-semibold text-sm text-nowrap">Turbulence Wallpaper</span>
      </div>
    </div>
  )
};

export default TitleBar;
