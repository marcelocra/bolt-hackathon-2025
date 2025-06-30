import React from 'react';

/**
 * Janus Arc logo component - abstract design suggesting dual faces or connecting arc
 * Optimized for dark theme with clean, minimalist aesthetic
 */

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      {/* Left arc representing one perspective */}
      <path
        d="M4 16C4 9.373 9.373 4 16 4C18.387 4 20.676 4.842 22.485 6.343"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-blue-400"
      />
      
      {/* Right arc representing another perspective */}
      <path
        d="M28 16C28 22.627 22.627 28 16 28C13.613 28 11.324 27.158 9.515 25.657"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-blue-400"
      />
      
      {/* Central connecting elements */}
      <circle
        cx="16"
        cy="10"
        r="1.5"
        fill="currentColor"
        className="text-blue-500"
      />
      <circle
        cx="16"
        cy="22"
        r="1.5"
        fill="currentColor"
        className="text-blue-500"
      />
      
      {/* Subtle gradient overlay */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;