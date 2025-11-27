import * as THREE from 'three';
import { PALETTE, ParticleData, TreeData } from '../types';

const generateParticles = (count: number, type: 'foliage' | 'ornament' | 'gift'): ParticleData[] => {
  const data: ParticleData[] = [];
  const spread = 20; 

  for (let i = 0; i < count; i++) {
    // 1. Calculate Target Position (The Tree Cone)
    const p = i / (count - 1);
    const y = -4.5 + p * 9; // Height range
    
    // Cone Radius
    // Foliage forms the core, Ornaments/Gifts sit slightly further out or embedded
    let radius = (1 - p) * 3.5; 
    
    // Golden angle for organic distribution
    // We add a random offset to theta for decorations so they don't align perfectly with foliage lines
    const thetaOffset = type !== 'foliage' ? Math.random() * Math.PI : 0;
    const theta = i * 2.39996 + thetaOffset; 
    
    // Position Calculation
    let x = Math.cos(theta) * radius;
    let z = Math.sin(theta) * radius;

    // Jitter: Foliage needs to look like a messy organic pile of cubes
    // Ornaments/Gifts need to look like they are hanging
    const jitter = type === 'foliage' ? 0.35 : 0.1; 
    
    if (type !== 'foliage') {
      // Push ornaments and gifts slightly outward to be visible
      const pushOut = 1.05;
      x *= pushOut;
      z *= pushOut;
    }

    const targetPos = new THREE.Vector3(
      x + (Math.random() - 0.5) * jitter,
      y + (Math.random() - 0.5) * jitter,
      z + (Math.random() - 0.5) * jitter
    );

    // 2. Start Position (Chaos)
    const rStart = spread * Math.cbrt(Math.random());
    const thetaStart = Math.random() * 2 * Math.PI;
    const phiStart = Math.acos(2 * Math.random() - 1);
    
    const startPos = new THREE.Vector3(
      rStart * Math.sin(phiStart) * Math.cos(thetaStart),
      rStart * Math.sin(phiStart) * Math.sin(thetaStart),
      rStart * Math.cos(phiStart)
    );

    // 3. Color & Scale Logic
    let color = PALETTE.FOREST;
    let scale = 1.0;

    if (type === 'foliage') {
      // Varied Greens using new palette
      const roll = Math.random();
      if (roll > 0.75) color = PALETTE.LEAF;     // Highlights
      else if (roll > 0.5) color = PALETTE.EMERALD;
      else if (roll > 0.25) color = PALETTE.PINE;
      else color = PALETTE.FOREST;
      
      // Much smaller cubes for "fine" texture
      scale = 0.08 + Math.random() * 0.12; 
    } else if (type === 'ornament') {
        const roll = Math.random();
        if (roll > 0.6) color = PALETTE.GOLD;
        else if (roll > 0.8) color = PALETTE.DIAMOND;
        else if (roll > 0.4) color = PALETTE.RUBY;
        else color = PALETTE.GOLD_ROSE;
        
        // Reduced to 2/3 of previous size (previous was 0.15 + random * 0.2)
        scale = (0.15 + Math.random() * 0.2) * (2/3);
    } else {
        // GIFTS
        // Boxes are mostly Light Purple, Deep Red or Deep Green
        const roll = Math.random();
        if (roll > 0.6) color = PALETTE.LIGHT_PURPLE; // Elegant light purple boxes
        else if (roll > 0.3) color = PALETTE.DARK_RED; // Luxury red boxes
        else color = PALETTE.EMERALD; // Matching green boxes
        
        // Slightly larger for visibility
        scale = 0.3 + Math.random() * 0.1; 
    }

    data.push({
      targetPosition: targetPos,
      startPosition: startPos,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      scale,
      color
    });
  }
  return data;
};

export const generateTreeData = (foliageCount: number, ornamentCount: number, giftCount: number): TreeData => {
  return {
    foliage: generateParticles(foliageCount, 'foliage'),
    ornaments: generateParticles(ornamentCount, 'ornament'),
    gifts: generateParticles(giftCount, 'gift'),
  };
};