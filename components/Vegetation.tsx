import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeProps } from '../types';
import { THEME } from '../constants';
import { SketchEdges } from './SketchEdges';

export const Tree: React.FC<TreeProps> = ({ position, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle sway animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.8, 5]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges />
      </mesh>

      {/* Foliage - Minimalist Sphere/Icosahedron */}
      <mesh position={[0, 1.2, 0]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges threshold={10} />
      </mesh>
      
      {/* Optional second detail cluster */}
      <mesh position={[0.3, 0.9, 0.2]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges threshold={10} />
      </mesh>
    </group>
  );
};

export const Bush: React.FC<TreeProps> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.2, 0]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges />
      </mesh>
       <mesh position={[0.2, 0.15, 0.1]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges />
      </mesh>
    </group>
  )
}
