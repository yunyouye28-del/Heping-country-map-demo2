import React from 'react';
import { OrbitControls } from '@react-three/drei';

export const CameraRig: React.FC = () => {
  return (
    <OrbitControls
      makeDefault
      enableDamping={true}
      dampingFactor={0.015} // Ultra smooth, heavy feel
      rotateSpeed={0.4}
      zoomSpeed={0.6}
      minDistance={2} // Allow getting very close to the hills
      maxDistance={90} // Far enough to see the whole city grid
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[0, 0, 0]}
    />
  );
};