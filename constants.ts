export const COLORS = {
  // Mode 1: Green Hills (Inner World)
  dayBg: '#ffffff', // Pure white fog/background for that high-key look
  dayFog: '#ffffff',
  hillGreen: '#5c7a50', // Warm olive green
  hillHighlight: '#a3c298', 
  
  // Mode 2: Dark City (Outer World)
  nightBg: '#050505',
  nightFog: '#000000',
  cityTile: '#0a0a0a',
  cityWhite: '#e0e0e0', // New: White buildings
  cityGrey: '#333333',  // New: Grey buildings
  cityLight: '#fffeb0', // Warm yellow/white light
  particle: '#ffdd40',
};

export const THEME = {
  lineColor: '#333333',
  fillColor: '#ffffff',
};

export const WORLD_SIZE = 120;

// Reversed Logic:
// We start Far (City) and Zoom In to Near (Hills)
// Thresholds determine the blending factor 't'
// t = 0 (Near/Hills) <-> t = 1 (Far/City)
export const TRANSITION_NEAR = 10; // Hills are fully visible here
export const TRANSITION_FAR = 70;  // Start transitioning earlier for a longer journey
