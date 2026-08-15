import React from 'react';

export default function IsometricCube() {
  return (
    <svg width="34" height="38" viewBox="0 0 40 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Diamond Face */}
      <path d="M20,2 L35,10 L20,18 L5,10 Z" fill="rgba(255, 77, 153, 0.25)" stroke="#ff4d99" strokeWidth="1" strokeLinejoin="round" />
      {/* Left Face */}
      <path d="M5,10 L20,18 L20,36 L5,28 Z" fill="rgba(255, 77, 153, 0.4)" stroke="#ff4d99" strokeWidth="1" strokeLinejoin="round" />
      {/* Right Face */}
      <path d="M20,18 L35,10 L35,28 L20,36 Z" fill="rgba(255, 77, 153, 0.15)" stroke="#ff4d99" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
