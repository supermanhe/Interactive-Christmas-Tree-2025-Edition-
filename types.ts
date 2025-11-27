import * as THREE from 'three';

export type ParticleData = {
  // The position when the tree is formed
  targetPosition: THREE.Vector3;
  // The position when exploded/scattered
  startPosition: THREE.Vector3;
  // Rotation details
  rotation: THREE.Euler;
  // Scale
  scale: number;
  // Color of the specific particle
  color: THREE.Color;
};

export type TreeData = {
  foliage: ParticleData[];
  ornaments: ParticleData[];
  gifts: ParticleData[];
}

export enum AppState {
  EXPLODED = 'EXPLODED',
  ASSEMBLING = 'ASSEMBLING',
  ASSEMBLED = 'ASSEMBLED'
}

export const PALETTE = {
  GOLD: new THREE.Color('#FFD700').convertSRGBToLinear(),
  GOLD_ROSE: new THREE.Color('#E0BFB8').convertSRGBToLinear(),
  RUBY: new THREE.Color('#880015').convertSRGBToLinear(),
  DIAMOND: new THREE.Color('#E0F7FA').convertSRGBToLinear(),
  
  // Revised Greens for a richer, greener tree
  EMERALD: new THREE.Color('#006B3C').convertSRGBToLinear(), // Richer emerald
  FOREST: new THREE.Color('#1A3C25').convertSRGBToLinear(),   // Lighter than previous black-green
  PINE: new THREE.Color('#2D5A27').convertSRGBToLinear(),     // Classic pine green
  LEAF: new THREE.Color('#4A7023').convertSRGBToLinear(),     // Brighter highlight green

  // Gift Box Colors
  LIGHT_PURPLE: new THREE.Color('#D8B5FF').convertSRGBToLinear(), // Light Purple/Lavender
  DARK_RED: new THREE.Color('#500000').convertSRGBToLinear(),
  CREAM: new THREE.Color('#F5F5DC').convertSRGBToLinear(), // Keeping for reference or fallback
};