import React from "react";
import { GitHubIcon } from "@/components/atoms/GithubIcon";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 pb-8 relative z-10 overflow-hidden">
      {/* Decorative grid line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      <div className="relative mt-10 text-center">
        <a
          href="https://github.com/dilaouid/vaporwaver-app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full 
                    text-gray-300 hover:text-white border border-purple-500/20 hover:border-purple-500/50
                    transition-all duration-300 hover:shadow-neon group"
        >
          <span className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
            <GitHubIcon />
            <span className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
          </span>
          <span className="relative z-10">Source Code</span>
        </a>

        <div className="mt-6 space-y-2">
          <p className="text-gray-400 text-sm">
            Created by{" "}
            <a
              href="https://github.com/dilaouid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              dilaouid
            </a>{" "}
            • Powered by{" "}
            <a
              href="https://github.com/dilaouid/vaporwaver"
              target="_blank"
              rel="noopener noreferrer"
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 transition-colors"
            >
              vaporwaver-ts
            </a>
          </p>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} • All aesthetic rights reserved
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-1/4 w-48 h-24 bg-cyan-500/5 blur-3xl rounded-full"></div>
    </footer>
  );
};
