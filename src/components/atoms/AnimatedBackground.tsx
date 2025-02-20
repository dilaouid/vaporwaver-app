import React from "react";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/90 via-fuchsia-950/90 to-indigo-950/90"></div>

      {/* Grid lines with animated gradient overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10">
        {/* Gradient overlay animé */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1),rgba(255,255,255,0.4),rgba(255,255,255,0.1))] bg-[length:200%_200%] animate-gradient-opacity"></div>
      </div>

      {/* Animated gradients */}
      <div className="absolute -inset-[100px] opacity-40">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl animate-float-slow"></div>
        <div className="absolute top-3/4 left-2/3 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl animate-float-medium"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl animate-float-fast"></div>
      </div>

      {/* Horizontal scan line effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-10"></div>

      {/* Stars */}
      <div className="absolute inset-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      {/* VHS scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="vhs-scanline"></div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette"></div>
    </div>
  );
};
