import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#facc15" /> {/* Yellow */}
        <stop offset="50%" stopColor="#f97316" /> {/* Orange */}
        <stop offset="100%" stopColor="#db2777" /> {/* Pink/Red */}
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Chat Bubble Shape */}
    <path 
      d="M20 20 C 5 20, 5 45, 5 50 C 5 75, 25 85, 40 85 L 30 95 L 55 85 C 80 85, 95 70, 95 50 C 95 25, 75 20, 20 20 Z" 
      fill="url(#logoGradient)" 
      style={{ filter: 'drop-shadow(0px 4px 6px rgba(249, 115, 22, 0.3))' }}
    />
    
    {/* Flame/Wave Shape Inside (Simplified) */}
    <path 
      d="M50 25 C 50 25, 35 40, 35 55 C 35 70, 45 75, 50 75 C 65 75, 70 55, 50 25 M 50 25 C 60 40, 65 50, 60 60" 
      fill="#ffffff" 
      fillOpacity="0.2" 
    />
  </svg>
);