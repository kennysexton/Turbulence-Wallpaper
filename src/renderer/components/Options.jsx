import React from 'react';
import IconButton from "./IconButton";
import { ReactComponent as SettingsIcon } from '../icons/settings.svg';
import { ReactComponent as FastForwardIcon } from '../icons/fast-forward.svg';
import { ReactComponent as CheckIcon } from '../icons/check.svg';
import { ReactComponent as Download } from '../icons/download.svg';

function Options({
  onSetWallpaper,
  onNextImage,
  onShowSettings,
  onDownloadImage,
  onHoverAction,
}) {
  return (
    <div className="absolute w-full top-10 p-4 flex justify-between">
      <div className="relative flex gap-3 z-20">
        <IconButton
          icon={SettingsIcon}
          onClick={onShowSettings}
          onMouseEnter={() => onHoverAction("Open Settings")}
          onMouseLeave={() => onHoverAction(null)}
        />
      </div>
      <div className="relative flex gap-3 z-20">
        <IconButton
          icon={CheckIcon}
          onClick={onSetWallpaper}
          onMouseEnter={() => onHoverAction("Set As Wallpaper")}
          onMouseLeave={() => onHoverAction(null)}
        />
        <IconButton
          icon={FastForwardIcon}
          onClick={onNextImage}
          onMouseEnter={() => onHoverAction("Next Image")}
          onMouseLeave={() => onHoverAction(null)}
        />
      </div>
    </div>
  );
}

export default Options;