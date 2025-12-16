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
    <div className="absolute w-full top-[var(--titlebar-height)] p-4 flex justify-between">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient h-full z-10"></div>
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