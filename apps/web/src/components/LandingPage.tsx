import React from 'react';
import { motion } from 'framer-motion';

const LandingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-mono flex items-center justify-center relative">
      {/* SCANNING LINES EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
      
      <main className="text-center px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
            <div className="ping-status"></div>
            <span className="text-[10px] tracking-[0.5em]">SYSTEM_INITIALIZING...</span>
          </div>
          
          <h1 className="text-[15vw] font-black leading-none tracking-tighter glitch-text mb-12">
            TRAINING <span className="text-brand">FR</span>
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-8 justify-center"
        >
          <button 
            onClick={onEnter}
            className="brutalist-button text-2xl"
          >
            EXECUTE_HANDSHAKE
          </button>
          <button className="brutalist-button text-2xl border-white/20 bg-transparent hover:bg-white hover:text-black">
            JOIN_DISCORD
          </button>
        </motion.div>
      </main>

      <div className="fixed bottom-10 left-10 text-[10px] tracking-[0.3em] opacity-30">
        NODE_ID: 01_FR_PAR <br />
        STATUS: CONNECTED
      </div>
      
      <div className="fixed bottom-10 right-10 text-[10px] tracking-[0.3em] opacity-30 text-right font-bold italic">
        "STEVE" ASSET_DUMP <br />
        V1.0.2_INDUSTRIAL
      </div>
    </div>
  );
};

export default LandingPage;
