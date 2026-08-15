import React from 'react';

export default function PixelCube() {
  return (
    <svg width="36" height="18" viewBox="0 0 36 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Solid left columns (▓ - 95% opacity) */}
      <g opacity="0.95" fill="#ff70a9">
        <rect x="0" y="0" width="2.2" height="2.2" />
        <rect x="0" y="2.7" width="2.2" height="2.2" />
        <rect x="0" y="5.4" width="2.2" height="2.2" />
        <rect x="0" y="8.1" width="2.2" height="2.2" />
        <rect x="0" y="10.8" width="2.2" height="2.2" />
        <rect x="0" y="13.5" width="2.2" height="2.2" />
        <rect x="0" y="15.8" width="2.2" height="2.2" />

        <rect x="2.7" y="0" width="2.2" height="2.2" />
        <rect x="2.7" y="2.7" width="2.2" height="2.2" />
        <rect x="2.7" y="5.4" width="2.2" height="2.2" />
        <rect x="2.7" y="8.1" width="2.2" height="2.2" />
        <rect x="2.7" y="10.8" width="2.2" height="2.2" />
        <rect x="2.7" y="13.5" width="2.2" height="2.2" />
        <rect x="2.7" y="15.8" width="2.2" height="2.2" />

        <rect x="5.4" y="0" width="2.2" height="2.2" />
        <rect x="5.4" y="2.7" width="2.2" height="2.2" />
        <rect x="5.4" y="5.4" width="2.2" height="2.2" />
        <rect x="5.4" y="8.1" width="2.2" height="2.2" />
        <rect x="5.4" y="10.8" width="2.2" height="2.2" />
        <rect x="5.4" y="13.5" width="2.2" height="2.2" />
        <rect x="5.4" y="15.8" width="2.2" height="2.2" />

        <rect x="8.1" y="0" width="2.2" height="2.2" />
        <rect x="8.1" y="2.7" width="2.2" height="2.2" />
        <rect x="8.1" y="5.4" width="2.2" height="2.2" />
        <rect x="8.1" y="8.1" width="2.2" height="2.2" />
        <rect x="8.1" y="10.8" width="2.2" height="2.2" />
        <rect x="8.1" y="13.5" width="2.2" height="2.2" />
        <rect x="8.1" y="15.8" width="2.2" height="2.2" />
      </g>

      {/* Dissolving middle columns (▒ - 65% opacity) */}
      <g opacity="0.65" fill="#ff70a9">
        <rect x="10.8" y="0" width="2.2" height="2.2" />
        <rect x="10.8" y="5.4" width="2.2" height="2.2" />
        <rect x="10.8" y="8.1" width="2.2" height="2.2" />
        <rect x="10.8" y="10.8" width="2.2" height="2.2" />
        <rect x="10.8" y="15.8" width="2.2" height="2.2" />

        <rect x="13.5" y="2.7" width="2.2" height="2.2" />
        <rect x="13.5" y="5.4" width="2.2" height="2.2" />
        <rect x="13.5" y="10.8" width="2.2" height="2.2" />
        <rect x="13.5" y="13.5" width="2.2" height="2.2" />

        <rect x="16.2" y="0" width="2.2" height="2.2" />
        <rect x="16.2" y="5.4" width="2.2" height="2.2" />
        <rect x="16.2" y="8.1" width="2.2" height="2.2" />
        <rect x="16.2" y="15.8" width="2.2" height="2.2" />

        <rect x="18.9" y="2.7" width="2.2" height="2.2" />
        <rect x="18.9" y="8.1" width="2.2" height="2.2" />
        <rect x="18.9" y="13.5" width="2.2" height="2.2" />
      </g>

      {/* Scattered trailing columns (░ - 35% opacity) */}
      <g opacity="0.35" fill="#ff70a9">
        <rect x="21.6" y="0" width="2.2" height="2.2" />
        <rect x="21.6" y="10.8" width="2.2" height="2.2" />
        <rect x="21.6" y="15.8" width="2.2" height="2.2" />

        <rect x="24.3" y="2.7" width="2.2" height="2.2" />
        <rect x="24.3" y="13.5" width="2.2" height="2.2" />

        <rect x="27.0" y="5.4" width="2.2" height="2.2" />
        <rect x="27.0" y="10.8" width="2.2" height="2.2" />

        <rect x="29.7" y="0" width="2.2" height="2.2" />
        <rect x="29.7" y="8.1" width="2.2" height="2.2" />

        <rect x="32.4" y="2.7" width="2.2" height="2.2" />
        <rect x="32.4" y="13.5" width="2.2" height="2.2" />
      </g>
    </svg>
  );
}
