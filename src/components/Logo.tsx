import React from "react";

/**
 * Janus Arc logo component - abstract design suggesting dual faces or connecting arc
 * Optimized for dark theme with clean, minimalist aesthetic
 */

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="logo-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
          <feFlood floodColor="#2563eb" floodOpacity="0.5" result="offsetColor" />
          <feComposite
            in="offsetColor"
            in2="offsetBlur"
            operator="in"
            result="offsetBlurColor"
          />
          <feMerge>
            <feMergeNode in="offsetBlurColor" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#logo-shadow)">
        <path
          d="M50 10 C 20 20, 20 80, 50 90 S 80 80, 80 50 C 80 20, 50 10, 50 10 Z"
          stroke="url(#logo-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(45 50 50)"
        />
        <path
          d="M50 10 C 80 20, 80 80, 50 90 S 20 80, 20 50 C 20 20, 50 10, 50 10 Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.3"
          transform="rotate(45 50 50)"
        />
      </g>
    </svg>
  );
};

export default Logo;
