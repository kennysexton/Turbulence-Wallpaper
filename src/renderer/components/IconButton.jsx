import React from 'react';

const IconButton = ({ icon: Icon, actionName, onClick, className = '', ...props }) => { // Renamed iconName to icon
  return (
    <button
      onClick={onClick}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center
                  backdrop-blur-md bg-white/40 hover:bg-white/60 transition-colors duration-200
                  group ${className}`}
      {...props}
    >
      {Icon ? <Icon className="w-5 h-5 text-gray-800" /> : null} {/* Render the passed Icon component */}

      {/* Optional: More advanced tooltip for better styling */}
      {actionName && (
        <span className="absolute top-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {actionName}
        </span>
      )}
    </button>
  );
};

export default IconButton;
