import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { TreeParticles } from './TreeParticles';
import * as THREE from 'three';

interface SceneProps {
  assembled: boolean;
}

export const Scene: React.FC<SceneProps> = ({ assembled }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the entire tree group for a display case effect
  useFrame((state) => {
    if (groupRef.current && assembled) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <>
      {/* Important: Set a scene background color to ensure PostProcessing works correctly over the canvas */}
      <color attach="background" args={['#051810']} />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={8}
        maxDistance={25}
        autoRotate={assembled}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
      />

      {/* Luxury Environment: City presets usually give good high-contrast reflections for metal */}
      {/* Increased blur slightly so matte boxes look smoother */}
      <Environment preset="city" blur={0.5} />

      {/* Dramatic Lighting - Reverted to darker, more dramatic values */}
      <ambientLight intensity={0.1} color="#001100" />
      
      {/* Main Key Light (Gold Warmth) - Reduced from 300 to 80 */}
      <spotLight
        position={[10, 20, 10]}
        angle={0.25}
        penumbra={1}
        intensity={80} 
        decay={0} 
        distance={100}
        color="#ffecd1"
        castShadow
        shadow-bias={-0.0001} 
      />
      
      {/* Rim Light (Cool/Emerald contrast) - Reduced from 200 to 50 */}
      <spotLight
        position={[-10, 5, -10]}
        angle={0.5}
        penumbra={1}
        intensity={50} 
        decay={0}
        distance={100}
        color="#cceeff"
      />

      {/* Fill Light (Reddish for depth) - Reduced from 100 to 20 */}
      <pointLight position={[0, -5, 5]} intensity={20} decay={0} color="#500000" />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating dust/sparkles for magical effect */}
      <Sparkles 
        count={200} 
        scale={12} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#D4AF37"
      />

      <group ref={groupRef} position={[0, -2, 0]}>
        <TreeParticles assembled={assembled} />
        
        {/* A reflective floor base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]} receiveShadow>
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial 
            color="#051810" 
            roughness={0.1} 
            metalness={0.8} 
          />
        </mesh>
      </group>
    </>
  );
};