import React from 'react';

const IconButton = ({ icon: Icon, actionName, onClick, className = '', onMouseEnter, onMouseLeave, ...props }) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center
                  backdrop-blur-md bg-white/40 hover:bg-white/60 transition-colors duration-200
                  group ${className}`}
      {...props}
    >
      {Icon ? <Icon className="w-5 h-5 text-gray-800" /> : null} {/* Render the passed Icon component */}
    </button>
  );
};

export default IconButton;
