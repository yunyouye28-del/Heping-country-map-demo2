import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS, TRANSITION_NEAR, TRANSITION_FAR } from '../constants';

// Helper for consistent noise
const seededRandom = (s: number) => {
    let mask = 0xffffffff;
    let m_w = (123456789 + s) & mask;
    let m_z = (987654321 - s) & mask;
    return () => {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    };
};

interface TerracedHillProps {
  position: [number, number, number];
  scale: number;
  height: number;
  seed: number;
}

const TerracedHill: React.FC<TerracedHillProps> = ({ position, scale, height, seed }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const treesRef = useRef<THREE.InstancedMesh>(null);
  const linesGroupRef = useRef<THREE.Group>(null);
  
  const { particles, lines, treeInstances } = useMemo(() => {
    const rng = seededRandom(seed);
    const p = [];
    const l = [];
    const t = [];
    
    // Hill parameters
    const layers = 24; // More layers
    const layerHeight = height / layers;
    
    const noiseFreq = 3 + rng() * 3;
    const noiseAmp = 0.15 + rng() * 0.2;
    const getRadiusBase = (angle: number) => {
        return 1 + Math.sin(angle * 3 + rng() * 10) * 0.1 + Math.cos(angle * noiseFreq) * noiseAmp;
    };

    for (let i = 0; i < layers; i++) {
      const y = i * layerHeight;
      const progress = i / layers; 
      
      // Sharper peak profile
      const slopeProfile = Math.pow(1 - progress, 1.2); 
      
      const currentLayerScale = scale * slopeProfile;
      const nextLayerScale = scale * Math.pow(1 - (i + 1) / layers, 1.2);

      if (currentLayerScale < 0.1) break;

      const points = [];
      const segments = 90; 
      
      const layerParticles = [];

      for(let s = 0; s < segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          const rBase = getRadiusBase(theta);
          const rOuter = rBase * currentLayerScale;
          const rInner = rBase * nextLayerScale; 
          
          points.push(new THREE.Vector3(Math.cos(theta) * rOuter, 0, Math.sin(theta) * rOuter));

          const arcLength = (rOuter * 2 * Math.PI) / segments;
          const radialDist = rOuter - rInner;
          
          // INCREASE DENSITY HERE: 8 -> 15
          const density = 15; 
          const count = Math.ceil(arcLength * radialDist * density);
          
          for(let k = 0; k < count; k++) {
              const r = rInner + Math.sqrt(rng()) * (rOuter - rInner);
              const a = theta + (rng() - 0.5) * (Math.PI * 2 / segments);
              
              // Edge smoothing logic:
              // If the particle is very close to the outer rim of the bottom layers, scale it down.
              // 'progress' is 0 at bottom.
              // rOuter is the max radius at this layer.
              let edgeScale = 1;
              if (i < 3) {
                  // Bottom 3 layers fade out at edges
                  const distFromEdge = rOuter - r;
                  if (distFromEdge < 1.0) {
                       edgeScale = Math.max(0, distFromEdge);
                  }
              }

              layerParticles.push({
                  pos: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
                  scale: (0.12 + rng() * 0.15) * edgeScale, 
                  rot: new THREE.Euler(0, rng() * Math.PI, 0),
                  yOffset: rng() * 0.08
              });
          }
      }
      
      // Skip lines on very bottom layer to avoid hard cut against ground
      if (i > 0) l.push({ y, points });
      p.push(...layerParticles);

      // Trees - more sparse
      if (i > layers * 0.6 && rng() > 0.85) {
           const idx = Math.floor(rng() * points.length);
           const pt = points[idx];
           t.push({
               pos: new THREE.Vector3(pt.x, y, pt.z),
               scale: 0.5 + rng() * 0.6,
               rot: new THREE.Euler(0, rng() * Math.PI, 0)
           });
      }
    }

    return { particles: p, lines: l, treeInstances: t };
  }, [scale, height, seed]);

  // Visibility Animation
  useFrame(({ camera }) => {
     const dist = camera.position.length();
     let t = (dist - TRANSITION_NEAR) / (TRANSITION_FAR - TRANSITION_NEAR);
     t = Math.max(0, Math.min(1, t));
     
     // Fade in hills ONLY when we are deep into the fog/transition
     // t=0 is full hills, t=1 is city
     // Show hills when t < 0.4
     const hillVisibility = Math.max(0, (0.4 - t) * 2.5); 
     
     // Smooth ease-out
     const smoothVis = hillVisibility * hillVisibility * (3 - 2 * hillVisibility);

     if (meshRef.current) {
        meshRef.current.visible = smoothVis > 0.01;
        // Scale up from center to feel like emerging
        meshRef.current.scale.setScalar(smoothVis);
     }
     if (treesRef.current) {
        treesRef.current.visible = smoothVis > 0.01;
        treesRef.current.scale.setScalar(smoothVis);
     }
     if (linesGroupRef.current) {
         linesGroupRef.current.visible = smoothVis > 0.01;
         linesGroupRef.current.scale.setScalar(smoothVis);
     }
  });

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempObj = new THREE.Object3D();
    
    // Update Bushes
    particles.forEach((p, i) => {
      tempObj.position.copy(p.pos);
      tempObj.position.y += p.yOffset;
      tempObj.scale.setScalar(p.scale);
      tempObj.rotation.copy(p.rot);
      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update Trees
    if (treesRef.current) {
        treeInstances.forEach((tr, i) => {
            tempObj.position.copy(tr.pos);
            tempObj.scale.setScalar(tr.scale);
            tempObj.rotation.copy(tr.rot);
            tempObj.updateMatrix();
            treesRef.current!.setMatrixAt(i, tempObj.matrix);
        });
        treesRef.current.instanceMatrix.needsUpdate = true;
    }

  }, [particles, treeInstances]);

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} /> 
        <meshStandardMaterial 
            color={COLORS.hillGreen} 
            roughness={0.9} 
            flatShading
        />
      </instancedMesh>

      <instancedMesh ref={treesRef} args={[undefined, undefined, treeInstances.length]} castShadow receiveShadow>
         <cylinderGeometry args={[0.05, 0.2, 3, 5]} />
         <meshStandardMaterial color={COLORS.hillGreen} roughness={0.9} />
      </instancedMesh>

      <group ref={linesGroupRef}>
          {lines.map((line, i) => (
             <lineLoop key={i} position={[0, line.y + 0.05, 0]}>
                 <bufferGeometry>
                    <bufferAttribute 
                        attach="attributes-position" 
                        count={line.points.length} 
                        array={new Float32Array(line.points.flatMap(v => [v.x, v.y, v.z]))} 
                        itemSize={3} 
                    />
                 </bufferGeometry>
                 <lineBasicMaterial color="#ffffff" opacity={0.4} transparent linewidth={1} />
             </lineLoop>
          ))}
      </group>
    </group>
  );
};

export const Hills: React.FC = () => {
  const hills = useMemo(() => {
    // "Scattered distribution" - Not just a ring, but depths.
    // Keep them relatively close to center so they are in the "Lens" after city parts
    return [
      { pos: [-5, -12, 10], scale: 16, height: 11, seed: 10 }, 
      { pos: [8, -10, 2], scale: 14, height: 9, seed: 23 },   
      { pos: [0, -14, -8], scale: 18, height: 13, seed: 33 }, 
      { pos: [15, -16, -15], scale: 20, height: 14, seed: 44 }, 
      { pos: [-15, -15, -5], scale: 15, height: 10, seed: 55 }, 
      // Distant ones for depth
      { pos: [-25, -20, 20], scale: 25, height: 15, seed: 66 },
      { pos: [20, -20, 25], scale: 22, height: 14, seed: 77 },
    ] as const;
  }, []);

  return (
    <group>
      {hills.map((h, i) => (
        <TerracedHill key={i} position={h.pos as [number, number, number]} scale={h.scale} height={h.height} seed={h.seed} />
      ))}
      <HillFloor />
    </group>
  );
};

const HillFloor = () => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ camera }) => {
        if(!ref.current) return;
        const dist = camera.position.length();
        let t = (dist - TRANSITION_NEAR) / (TRANSITION_FAR - TRANSITION_NEAR);
        t = Math.max(0, Math.min(1, t));
        
        // Floor opacity inverse to City
        const opacity = Math.max(0, 1 - t * 2); 
        (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        ref.current.visible = opacity > 0;
    })
    
    return (
        <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]} position={[0, -12, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial color={COLORS.dayBg} transparent opacity={0} />
        </mesh>
    )
}