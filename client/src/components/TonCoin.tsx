import { motion } from "framer-motion";

interface TonCoinProps {
  size?: number;
  className?: string;
}

export function TonCoin({ size = 40, className = "" }: TonCoinProps) {
  return (
    <motion.div
      className={`ton-coin flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ 
        rotateY: [0, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
        scale: { duration: 1.5, repeat: Infinity }
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path 
          d="M12 2L3 9L12 16L21 9L12 2Z" 
          fill="white" 
          fillOpacity="0.9"
        />
        <path 
          d="M12 16L3 9V15L12 22L21 15V9L12 16Z" 
          fill="white" 
          fillOpacity="0.6"
        />
      </svg>
    </motion.div>
  );
}
