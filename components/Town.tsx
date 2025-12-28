import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS, TRANSITION_NEAR, TRANSITION_FAR } from '../constants';

const CityGrid = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Static data generation
  const { data, count } = useMemo(() => {
    const items = [];
    const gridSize = 24; // Larger grid for the "infinite" feel
    const gap = 2.5; 
    const offset = (gridSize * gap) / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const px = x * gap - offset + (Math.random() - 0.5) * 0.8;
        const pz = z * gap - offset + (Math.random() - 0.5) * 0.8;
        
        // Leave a gap in center? Let's make it smaller so we really fly THROUGH it.
        const distFromCenter = Math.sqrt(px*px + pz*pz);
        // Smaller hole (radius 2) so city feels tight around the "lens"
        if (distFromCenter < 2) continue; 

        // Randomize heights greatly for skyline effect
        const heightScale = 0.5 + Math.pow(Math.random(), 2) * 4.0;
        
        // Determine type/color
        const rand = Math.random();
        let colorHex = COLORS.cityTile; // Black default
        if (rand > 0.85) colorHex = COLORS.cityWhite;
        else if (rand > 0.6) colorHex = COLORS.cityGrey;

        const isHouse = rand > 0.95; // Rare glowing houses

        items.push({
          initialPos: new THREE.Vector3(px, heightScale/2 - 2, pz),
          scale: [0.8 + Math.random() * 0.5, heightScale, 0.8 + Math.random() * 0.5],
          color: new THREE.Color(colorHex),
          isHouse,
          // Store a random direction vector for the "parting" animation
          // We push them away from the Z-axis primarily to open a "path"
          dir: new THREE.Vector3(px, 0, pz).normalize().multiplyScalar(1.5)
        });
      }
    }
    return { data: items, count: items.length };
  }, []);

  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    
    const dist = camera.position.length();
    // t = 1 (City) -> 0 (Hills)
    let t = (dist - TRANSITION_NEAR) / (TRANSITION_FAR - TRANSITION_NEAR);
    t = Math.max(0, Math.min(1, t));

    const tempObj = new THREE.Object3D();
    // Stronger spread to really clear the view for the hills
    const spreadFactor = Math.pow((1 - t), 2) * 80; 
    
    data.forEach((item, i) => {
        // Move outwards
        const targetPos = item.initialPos.clone().add(item.dir.clone().multiplyScalar(spreadFactor));
        
        tempObj.position.copy(targetPos);
        
        // Scale down as they move away to disappear smoothly
        // We want them to stick around a bit longer before vanishing
        const scaleFade = Math.max(0, Math.min(1, t * 1.5)); 
        
        tempObj.scale.set(
            item.scale[0] * scaleFade, 
            item.scale[1] * scaleFade, 
            item.scale[2] * scaleFade
        );
        
        tempObj.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObj.matrix);
        
        // Color update
        // We darken the white buildings as they fade out to blend with dark city background logic
        // But since background turns white, maybe we lighten them?
        // Actually, let's just keep their intrinsic color but fade intensity if possible.
        // Standard material doesn't fade easily. We rely on scaleFade.
        
        if (item.isHouse) {
             const flicker = 1 + Math.sin(Date.now() * 0.005 + i) * 0.2;
             meshRef.current!.setColorAt(i, new THREE.Color(COLORS.cityLight).multiplyScalar(flicker));
        } else {
             meshRef.current!.setColorAt(i, item.color);
        }
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        roughness={0.3} 
        metalness={0.6}
      />
    </instancedMesh>
  );
};

// Dust that exists in the city
const DustSystem = () => {
  const count = 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = new THREE.Object3D();
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: (Math.random()) * 30 - 5,
      z: (Math.random() - 0.5) * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  useFrame(({ clock, camera }) => {
    if (!meshRef.current) return;
    
    const dist = camera.position.length();
    let t = (dist - TRANSITION_NEAR) / (TRANSITION_FAR - TRANSITION_NEAR);
    t = Math.max(0, Math.min(1, t));
    
    if (t <= 0.01) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;

    const time = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const y = p.y + Math.sin(time * 0.5 + p.phase) * 2;
      
      tempObj.position.set(p.x, y, p.z);
      tempObj.rotation.set(time * 0.1, time * 0.1, 0);
      tempObj.scale.setScalar(0.2 * t); // Shrink as we leave city
      tempObj.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={COLORS.particle} transparent opacity={0.6} />
    </instancedMesh>
  );
};

export const Town: React.FC = () => {
  return (
    <group>
      <CityGrid />
      <DustSystem />
    </group>
  );
};