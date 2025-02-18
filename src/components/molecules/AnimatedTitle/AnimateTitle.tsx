import React from 'react';

export const AnimatedTitle: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 animate-gradient-x">
        vaporwaver
      </h1>
      <p className="text-gray-200">Transform your images into vaporwave aesthetics</p>
      <p className="text-gray-400 text-sm mt-1">A modern web interface for the vaporwaver-ts library</p>
    </div>
  );
};