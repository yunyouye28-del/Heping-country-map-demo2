import React from 'react';
import { Edges } from '@react-three/drei';
import { THEME } from '../constants';

interface SketchEdgesProps {
  threshold?: number;
  color?: string;
}

// Wrapper around Drei's Edges to ensure consistent style
export const SketchEdges: React.FC<SketchEdgesProps> = ({ 
  threshold = 15, 
  color = THEME.lineColor 
}) => {
  return (
    <Edges
      threshold={threshold} // Display edges only when the angle between faces exceeds this value
      color={color}
      scale={1.005} // Slight scale to prevent z-fighting with the white fill
      renderOrder={1000}
    />
  );
};
