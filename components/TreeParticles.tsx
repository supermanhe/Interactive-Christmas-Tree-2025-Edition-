import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeData, PALETTE } from '../types';
import { generateTreeData } from '../utils/geometry';

interface TreeParticlesProps {
  assembled: boolean;
}

const FOLIAGE_COUNT = 7000; 
const ORNAMENT_COUNT = 225; 
const GIFT_COUNT = 225;

const ANIMATION_SPEED = 2.0;

export const TreeParticles: React.FC<TreeParticlesProps> = ({ assembled }) => {
  // Layer 1: Foliage
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  
  // Layer 2: Ornaments
  const ornamentsRef = useRef<THREE.InstancedMesh>(null);
  
  // Layer 3: Gifts (Composite Object)
  // We break the gift into 3 parts to simulate a complex model without downloading GLBs
  const giftsBaseRef = useRef<THREE.InstancedMesh>(null); // The box
  const giftsLidRef = useRef<THREE.InstancedMesh>(null);  // The lid
  const giftsBowRef = useRef<THREE.InstancedMesh>(null);  // The golden ribbon/bow

  const progress = useRef(0);
  
  // Generate Data
  const { foliage, ornaments, gifts } = useMemo(
    () => generateTreeData(FOLIAGE_COUNT, ORNAMENT_COUNT, GIFT_COUNT), 
    []
  );
  
  const dummyObj = useMemo(() => new THREE.Object3D(), []);

  // Pre-transform Geometries for the Gift Components
  const giftLidGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.05, 0.15, 1.05); // Slightly wider, thin
    geo.translate(0, 0.45, 0); // Move up to sit on top of the base box
    return geo;
  }, []);

  const giftBowGeometry = useMemo(() => {
    // TorusKnot simulates a complex ribbon bow
    const geo = new THREE.TorusKnotGeometry(0.22, 0.05, 64, 8); 
    geo.translate(0, 0.65, 0); // Move up to sit on top of the lid
    return geo;
  }, []);

  // Initialization Helper
  const initMesh = (mesh: THREE.InstancedMesh, data: typeof foliage, fixedColor?: THREE.Color) => {
    data.forEach((particle, i) => {
      dummyObj.position.copy(particle.startPosition);
      dummyObj.rotation.copy(particle.rotation);
      // Fixed: Start at 60% scale instead of 10%
      dummyObj.scale.setScalar(particle.scale * 0.6); 
      dummyObj.updateMatrix();
      mesh.setMatrixAt(i, dummyObj.matrix);
      
      // If a fixedColor is provided (e.g. Gold for bows), use it. Otherwise use particle color.
      mesh.setColorAt(i, fixedColor || particle.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useLayoutEffect(() => {
    if (foliageRef.current) initMesh(foliageRef.current, foliage);
    if (ornamentsRef.current) initMesh(ornamentsRef.current, ornaments);
    
    // Initialize all 3 layers of the gifts
    if (giftsBaseRef.current) initMesh(giftsBaseRef.current, gifts);
    if (giftsLidRef.current) initMesh(giftsLidRef.current, gifts);
    // Bows are always Gold
    if (giftsBowRef.current) initMesh(giftsBowRef.current, gifts, PALETTE.GOLD); 

  }, [foliage, ornaments, gifts]);

  // Animation Loop
  useFrame((state, delta) => {
    const targetProgress = assembled ? 1 : 0;
    const step = delta * ANIMATION_SPEED;
    
    // Animation State Logic
    if (Math.abs(progress.current - targetProgress) > 0.001) {
      if (progress.current < targetProgress) {
        progress.current = Math.min(progress.current + step, 1);
      } else {
        progress.current = Math.max(progress.current - step, 0);
      }
    }

    const t = progress.current;
    // Easing: cubic in-out
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Helper to animate a mesh
    const animateMesh = (
      mesh: THREE.InstancedMesh, 
      data: typeof foliage, 
      type: 'foliage' | 'ornament' | 'gift',
      scaleMultiplier: number = 1
    ) => {
      data.forEach((particle, i) => {
        // Position
        dummyObj.position.lerpVectors(particle.startPosition, particle.targetPosition, eased);
        
        // Rotation
        if (type === 'gift') {
          // Gifts do not spin on their own axis, they stay fixed orientation logic
          dummyObj.rotation.copy(particle.rotation);
        } else {
          // Foliage and Ornaments spin slowly for sparkle effect
          const rotSpeed = type === 'foliage' ? 0.1 : 0.3;
          dummyObj.rotation.x = particle.rotation.x + state.clock.elapsedTime * rotSpeed;
          dummyObj.rotation.y = particle.rotation.y + state.clock.elapsedTime * (rotSpeed * 0.5);
        }
        
        // Scale
        // Fixed: Interpolate from 0.6 to 1.0 (instead of 0.1 to 1.0)
        const currentScale = particle.scale * (0.6 + 0.4 * eased) * scaleMultiplier;
        dummyObj.scale.setScalar(currentScale);

        dummyObj.updateMatrix();
        mesh.setMatrixAt(i, dummyObj.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (foliageRef.current) animateMesh(foliageRef.current, foliage, 'foliage');
    if (ornamentsRef.current) animateMesh(ornamentsRef.current, ornaments, 'ornament');

    // Animate all 3 Gift Layers with EXACTLY the same logic so they stay attached
    if (giftsBaseRef.current) animateMesh(giftsBaseRef.current, gifts, 'gift');
    if (giftsLidRef.current) animateMesh(giftsLidRef.current, gifts, 'gift');
    if (giftsBowRef.current) animateMesh(giftsBowRef.current, gifts, 'gift');
  });

  return (
    <group>
      {/* 
        LAYER 1: FOLIAGE
        Matte Green Cubes
      */}
      <instancedMesh
        ref={foliageRef}
        args={[undefined, undefined, FOLIAGE_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.9}
          metalness={0.0}
          envMapIntensity={0.1}
        />
      </instancedMesh>

      {/* 
        LAYER 2: ORNAMENTS
        Shiny Spheres
      */}
      <instancedMesh
        ref={ornamentsRef}
        args={[undefined, undefined, ORNAMENT_COUNT]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          roughness={0.1} 
          metalness={1.0}
          envMapIntensity={1.0}
        />
      </instancedMesh>

      {/* 
        LAYER 3: LUXURY GIFTS (Composite)
      */}
      
      {/* 3A: Gift Base (The Box) */}
      <instancedMesh
        ref={giftsBaseRef}
        args={[undefined, undefined, GIFT_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial
          roughness={0.2} 
          metalness={0.1} // More like paper/cardboard, less metallic
          envMapIntensity={0.5}
        />
      </instancedMesh>

      {/* 3B: Gift Lid */}
      <instancedMesh
        ref={giftsLidRef}
        args={[undefined, undefined, GIFT_COUNT]}
        castShadow
        receiveShadow
        geometry={giftLidGeometry} // Pre-translated
      >
        <meshStandardMaterial
          roughness={0.2} 
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </instancedMesh>

      {/* 3C: Gift Bow (Gold Ribbon) */}
      <instancedMesh
        ref={giftsBowRef}
        args={[undefined, undefined, GIFT_COUNT]}
        castShadow
        receiveShadow
        geometry={giftBowGeometry} // Pre-translated
      >
        <meshStandardMaterial
          roughness={0.1} 
          metalness={1.0} // Pure Gold
          color={PALETTE.GOLD}
          envMapIntensity={1.5}
        />
      </instancedMesh>
    </group>
  );
};