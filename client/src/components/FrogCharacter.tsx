import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FrogCharacterProps {
  isJumping: boolean;
  onClick: () => void;
}

export function FrogCharacter({ isJumping, onClick }: FrogCharacterProps) {
  const [eyesOpen, setEyesOpen] = useState(true);

  // Random blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setEyesOpen(false);
      setTimeout(() => setEyesOpen(true), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-72 h-72 flex items-center justify-center cursor-pointer select-none touch-manipulation" 
      onClick={onClick}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ 
          boxShadow: isJumping 
            ? "0 0 80px 20px rgba(57, 255, 20, 0.4)" 
            : "0 0 40px 10px rgba(57, 255, 20, 0.2)"
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Frog Container */}
      <motion.div
        animate={isJumping 
          ? { y: -140, scale: 1.15, rotate: -5 } 
          : { y: 0, scale: 1, rotate: 0 }
        }
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 12,
          mass: 0.7 
        }}
        className="relative z-10"
      >
        {/* Main Body */}
        <div className="w-44 h-36 bg-gradient-to-b from-secondary to-green-600 rounded-[45%] relative shadow-[0_0_60px_rgba(57,255,20,0.5)] border-4 border-green-800">
          
          {/* Body Highlight */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-10 bg-white/20 rounded-full blur-sm" />
          
          {/* Belly */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-12 bg-green-300/30 rounded-[50%]" />

          {/* Left Eye */}
          <motion.div 
            className="absolute -top-8 left-1 w-14 h-14 bg-gradient-to-b from-secondary to-green-600 rounded-full border-4 border-green-800 overflow-hidden"
            animate={{ scale: isJumping ? 1.1 : 1 }}
          >
            <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full" />
            <AnimatePresence>
              {eyesOpen && (
                <motion.div 
                  initial={{ scaleY: 0 }} 
                  animate={{ scaleY: 1 }} 
                  exit={{ scaleY: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full"
                >
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Eye */}
          <motion.div 
            className="absolute -top-8 right-1 w-14 h-14 bg-gradient-to-b from-secondary to-green-600 rounded-full border-4 border-green-800 overflow-hidden"
            animate={{ scale: isJumping ? 1.1 : 1 }}
          >
            <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full" />
            <AnimatePresence>
              {eyesOpen && (
                <motion.div 
                  initial={{ scaleY: 0 }} 
                  animate={{ scaleY: 1 }} 
                  exit={{ scaleY: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full"
                >
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mouth */}
          <motion.div 
            className="absolute bottom-7 left-1/2 -translate-x-1/2 w-16 h-2 bg-green-800 rounded-full"
            animate={isJumping ? { scaleX: 1.2 } : { scaleX: 1 }}
          />
          
          {/* Cheeks */}
          <div className="absolute bottom-6 left-3 w-5 h-3 bg-pink-400/40 rounded-full blur-[3px]" />
          <div className="absolute bottom-6 right-3 w-5 h-3 bg-pink-400/40 rounded-full blur-[3px]" />

          {/* Front Legs */}
          <motion.div 
            className="absolute -bottom-3 -left-6 w-14 h-18 bg-gradient-to-b from-green-600 to-green-700 rounded-3xl -z-10 rotate-12 border-4 border-green-800"
            animate={isJumping ? { rotate: 30 } : { rotate: 12 }}
          />
          <motion.div 
            className="absolute -bottom-3 -right-6 w-14 h-18 bg-gradient-to-b from-green-600 to-green-700 rounded-3xl -z-10 -rotate-12 border-4 border-green-800"
            animate={isJumping ? { rotate: -30 } : { rotate: -12 }}
          />
        </div>

        {/* Crown / TON Symbol */}
        <motion.div 
          className="absolute -top-14 left-1/2 -translate-x-1/2 w-10 h-10 ton-coin flex items-center justify-center"
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white font-bold text-xs">TON</span>
        </motion.div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        animate={isJumping 
          ? { scale: 0.4, opacity: 0.15 } 
          : { scale: 1, opacity: 0.4 }
        }
        className="absolute bottom-8 w-36 h-10 bg-black rounded-[100%] blur-lg z-0"
      />

      {/* Particle Effects on Jump */}
      <AnimatePresence>
        {isJumping && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0.5,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.5,
                  x: (Math.random() - 0.5) * 100,
                  y: 50 + Math.random() * 30
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-20 w-4 h-4 rounded-full bg-secondary/60"
                style={{ left: `${40 + Math.random() * 20}%` }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
