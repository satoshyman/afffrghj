import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Play, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ClaimModalProps {
  open: boolean;
  onClaim: () => void;
  reward: number;
}

export function ClaimModal({ open, onClaim, reward }: ClaimModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-none max-w-[400px] w-[90%] p-0 overflow-hidden [&>button]:hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
          
          <motion.div 
            className="absolute top-4 left-4"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <motion.div 
            className="absolute top-8 right-6"
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
          <motion.div 
            className="absolute top-16 left-8"
            animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-3 h-3 text-primary fill-primary" />
          </motion.div>

          <div className="relative z-10 p-8 pt-10">
            <motion.div 
              className="flex flex-col items-center mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <motion.div 
                className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.4)] mb-4"
                animate={{ 
                  boxShadow: [
                    "0 0 30px rgba(234,179,8,0.3)",
                    "0 0 60px rgba(234,179,8,0.5)",
                    "0 0 30px rgba(234,179,8,0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-black text-white mb-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Congratulations!
              </motion.h2>
              <p className="text-base text-white/60">You've successfully completed 100 taps</p>
            </motion.div>

            <motion.div 
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-yellow-500/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-4">
                <motion.div 
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Coins className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-left">
                  <p className="text-sm text-yellow-400/80 font-medium mb-1">Ad Reward</p>
                  <div className="flex items-baseline gap-2">
                    <motion.span 
                      className="text-4xl font-black text-white"
                      animate={{ textShadow: ["0 0 10px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {reward.toFixed(7)}
                    </motion.span>
                    <span className="text-lg font-bold text-yellow-400">TON</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                onClick={onClaim}
                className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-orange-400 text-black font-black h-16 rounded-2xl text-xl shadow-[0_4px_20px_rgba(234,179,8,0.4)] transition-all duration-300 hover:shadow-[0_4px_30_rgba(234,179,8,0.6)]"
                data-testid="button-claim"
              >
                <Play className="w-5 h-5 mr-2 fill-black" /> 
                Watch Ad to Claim
              </Button>
              
              <p className="text-center text-sm text-white/40 mt-4">
                Watch a short ad to receive your earnings
              </p>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
