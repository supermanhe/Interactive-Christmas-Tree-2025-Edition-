import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const PostProcessing: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* 
        Bloom is critical for the "Luxury" feel. 
        It makes the gold highlights glow.
      */}
      <Bloom 
        luminanceThreshold={1.5} // Increased from 1.1 to 1.5: only super bright specks will glow now
        luminanceSmoothing={0.5} 
        height={300} 
        intensity={0.2} // Reduced from 0.4 to 0.2
      />
      
      {/* Vignette focuses the eye on the center */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      
      {/* Slight noise for film grain/cinematic texture */}
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
};