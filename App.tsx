
import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { PostProcessing } from './components/PostProcessing';
import { UIOverlay } from './components/UIOverlay';
import { Loader } from '@react-three/drei';
import * as THREE from 'three';
import { MusicBox } from './utils/audio';

const App: React.FC = () => {
  const [assembled, setAssembled] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Use a Ref to hold the MusicBox instance (singleton logic)
  const musicBox = useRef<MusicBox | null>(null);
  
  // Ref to track first render to avoid playing SFX on page load
  const isFirstRender = useRef(true);

  useEffect(() => {
    musicBox.current = new MusicBox();
    return () => {
      musicBox.current?.stop();
    };
  }, []);

  // Effect to trigger SFX when 'assembled' state changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (musicBox.current) {
      if (assembled) {
        // Assemble -> Play "Swoosh" (Swapped as requested)
        musicBox.current.playSwoosh();
      } else {
        // Disassemble -> Play "Thud" (Swapped as requested)
        musicBox.current.playThud();
      }
    }
  }, [assembled]);

  // Handle Audio Toggle
  const toggleMusic = () => {
    if (musicBox.current) {
      if (isMusicPlaying) {
        musicBox.current.stop();
      } else {
        musicBox.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#051810] to-[#000000]">
      
      <UIOverlay 
        assembled={assembled} 
        setAssembled={setAssembled} 
        isMusicPlaying={isMusicPlaying}
        toggleMusic={toggleMusic}
      />

      <Canvas
        shadows
        dpr={[1, 2]} // Handle high-dpi screens
        gl={{ 
          antialias: false, // Postprocessing handles AA or we use manual
          toneMapping: THREE.CineonToneMapping,
          toneMappingExposure: 0.7, 
          powerPreference: "high-performance"
        }}
        camera={{ position: [0, 0, 18], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Scene assembled={assembled} />
          <PostProcessing />
        </Suspense>
      </Canvas>

      <Loader 
        containerStyles={{ background: '#051810' }}
        innerStyles={{ width: '200px', height: '2px', background: '#333' }}
        barStyles={{ background: '#D4AF37', height: '2px' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '1rem' }}
      />
    </div>
  );
};

export default App;
