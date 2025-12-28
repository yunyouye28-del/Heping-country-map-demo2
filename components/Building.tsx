import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BuildingProps } from '../types';
import { THEME } from '../constants';
import { SketchEdges } from './SketchEdges';

export const Building: React.FC<BuildingProps> = ({
  position,
  rotation = [0, 0, 0],
  width,
  depth,
  height,
  variant = 'gable',
}) => {
  // Lingnan style often features "Wok Ear" gables, but we keep it geometric/minimalist.
  // We simulate the roof overhang and the main body.
  
  const roofHeight = variant === 'gable' ? width * 0.4 : 0.1;
  const bodyHeight = height - roofHeight;

  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      {/* Main Body */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <boxGeometry args={[width, bodyHeight, depth]} />
        <meshBasicMaterial color={THEME.fillColor} polygonOffset polygonOffsetFactor={1} />
        <SketchEdges />
      </mesh>

      {/* Roof */}
      {variant === 'gable' && (
        <group position={[0, bodyHeight, 0]}>
          {/* We use a cylinder segment (triangular prism) for the roof */}
          <mesh rotation={[0, 0, 0]} position={[0, roofHeight / 2, 0]}>
            <cylinderGeometry args={[0, width / 1.5, roofHeight, 4, 1]} />
            <meshBasicMaterial color={THEME.fillColor} polygonOffset polygonOffsetFactor={1} />
             {/* We manually rotate the geometry or the mesh to align the prism */}
          </mesh>
           {/* Alternative Geometric Roof: A simple prism using Extrude or Cone? 
               Let's stick to a rotated box or cylinder for simplicity in React Three Fiber.
               Actually, a ConeGeometry with 4 radial segments is a pyramid. 
               A Cylinder with 3 radial segments is a prism.
           */}
           <mesh rotation={[0, Math.PI / 4, 0]} position={[0, roofHeight / 2, 0]}>
              <coneGeometry args={[Math.max(width, depth) * 0.8, roofHeight, 4]} />
              <meshBasicMaterial color={THEME.fillColor} />
              <SketchEdges threshold={20} />
           </mesh>
        </group>
      )}

      {/* Detail: Small windows or doors (Abstracted) */}
      <mesh position={[0, bodyHeight * 0.3, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.2, bodyHeight * 0.4]} />
        <meshBasicMaterial color={THEME.fillColor} />
        <SketchEdges color={THEME.lineColor} />
      </mesh>
    </group>
  );
};
