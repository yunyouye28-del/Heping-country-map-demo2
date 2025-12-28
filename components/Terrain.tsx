import React from 'react';
import { COLORS } from '../constants';

export const Terrain: React.FC = () => {
  // Just a deep floor to catch shadows if any fall through, 
  // though mostly the tiles are self-contained.
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={COLORS.dayBg} />
    </mesh>
  );
};