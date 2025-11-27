import React from 'react';

interface UIOverlayProps {
  assembled: boolean;
  setAssembled: (val: boolean) => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  assembled, 
  setAssembled, 
  isMusicPlaying, 
  toggleMusic 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Top Bar: Title Left, Sound Toggle Right */}
      <div className="flex justify-between items-start w-full">
        {/* Header */}
        <header className="flex flex-col items-center md:items-start text-center md:text-left fade-in">
          <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase font-sans mb-2 font-bold opacity-80">
            The 2025 Collection
          </h2>
          <h1 className="text-4xl md:text-6xl font-serif text-white drop-shadow-lg max-w-lg leading-tight">
            Grand <span className="text-luxury-gold italic">Luxury</span> <br/>
            Christmas Tree
          </h1>
        </header>

        {/* Sound Toggle */}
        <button 
          onClick={toggleMusic}
          className="pointer-events-auto group flex items-center gap-3 px-4 py-2 rounded-full border border-luxury-gold/20 bg-black/20 backdrop-blur-sm hover:bg-luxury-gold/10 transition-all duration-300"
        >
          <span className="text-luxury-gold text-xs font-sans tracking-widest uppercase hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
            {isMusicPlaying ? 'Sound On' : 'Sound Off'}
          </span>
          <div className="text-luxury-gold w-6 h-6">
             {isMusicPlaying ? (
               // Speaker On Icon
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
               </svg>
             ) : (
               // Speaker Off Icon
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
               </svg>
             )}
          </div>
        </button>
      </div>

      {/* Footer / Controls */}
      <footer className="flex flex-col items-center justify-end pointer-events-auto">
        <button
          onClick={() => setAssembled(!assembled)}
          className={`
            group relative px-8 py-4 bg-transparent overflow-hidden rounded-full
            border border-luxury-gold/30 transition-all duration-500
            hover:border-luxury-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
            backdrop-blur-md
          `}
        >
          <div className={`
            absolute inset-0 bg-luxury-gold transition-transform duration-500 ease-out origin-left
            ${assembled ? 'scale-x-100 opacity-10' : 'scale-x-0 opacity-0'}
          `}></div>
          
          <span className="relative z-10 font-sans text-sm md:text-base tracking-widest text-white font-semibold uppercase group-hover:text-luxury-gold transition-colors duration-300">
            {assembled ? 'Disassemble Collection' : 'Assemble The Tree'}
          </span>
        </button>

        <p className="mt-6 text-white/30 text-xs font-sans tracking-widest uppercase">
          Drag to Rotate &bull; Scroll to Zoom
        </p>
      </footer>
    </div>
  );
};