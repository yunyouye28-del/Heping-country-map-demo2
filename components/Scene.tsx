import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { Town } from './Town';
import { Hills } from './Hills';
import { COLORS, TRANSITION_NEAR, TRANSITION_FAR } from '../constants';

const EnvironmentManager = () => {
  const { camera, scene } = useThree();
  
  useFrame(() => {
    const dist = camera.position.length();
    
    // Calculate transition factor 't'
    // t = 0 (Near/Hills)
    // t = 1 (Far/City)
    let t = (dist - TRANSITION_NEAR) / (TRANSITION_FAR - TRANSITION_NEAR);
    t = Math.max(0, Math.min(1, t));

    // Interpolate Background
    const cCity = new THREE.Color(COLORS.nightBg);
    const cHills = new THREE.Color(COLORS.dayBg);
    scene.background = cHills.lerp(cCity, t);

    // Interpolate Fog
    const fCity = new THREE.Color(COLORS.nightFog);
    const fHills = new THREE.Color(COLORS.dayFog);
    const currentFog = fHills.lerp(fCity, t);
    
    if (scene.fog) {
        (scene.fog as THREE.Fog).color.copy(currentFog);
        
        // Dynamic fog density
        const nearHills = 5; // Closer fog in hills for the misty look
        const farHills = 55;
        
        const nearCity = 10; 
        const farCity = 80;
        
        (scene.fog as THREE.Fog).near = THREE.MathUtils.lerp(nearHills, nearCity, t);
        (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(farHills, farCity, t);
    }
  });

  return null;
}

export const Scene: React.FC = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 30, 60], fov: 45 }} 
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <fog attach="fog" args={[COLORS.nightFog, 20, 100]} />
      
      <EnvironmentManager />

      <ambientLight intensity={0.4} />
      
      {/* City Light */}
      <pointLight position={[0, 20, 0]} intensity={1.5} color="#8888ff" distance={100} decay={2} />
      
      {/* Sun Light - Positioned to backlight/sidelight the terraces */}
      <directionalLight 
        position={[-50, 40, -20]} 
        intensity={2.0} 
        color="#fff5e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <CameraRig />
      
      <Town />
      <Hills />

    </Canvas>
  );
};
