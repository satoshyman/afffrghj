import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Gift, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AdModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdModal({ open, onClose }: AdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (open) {
      setCountdown(5);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && canClose) onClose(); }}>
      <DialogContent className="bg-card border-primary/30 max-w-[400px] w-[90%] p-6">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Gift className="w-6 h-6 text-yellow-400 animate-icon-pulse" />
            <span className="gradient-text">Bonus Opportunity!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Watch this ad to earn extra TON coins
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          {/* Mock Ad Content - Monetag Integration Space */}
          <motion.div 
            className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 text-center border border-white/10"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-20 h-20 mx-auto mb-4 ton-coin flex items-center justify-center animate-pulse-glow">
              <Coins className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Monetag Ad Space</h3>
            <p className="text-sm text-muted-foreground">
              Premium advertising placement
            </p>
            <div className="mt-4 text-xs text-primary/60 font-mono">
              Ad ID: MONETAG-{Math.random().toString(36).substring(7).toUpperCase()}
            </div>
          </motion.div>
        </div>

        <DialogFooter className="sm:justify-center">
          {!canClose ? (
            <div className="text-center w-full">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 mb-2">
                <span className="text-2xl font-bold font-num text-primary">{countdown}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wait to close...</p>
            </div>
          ) : (
            <Button 
              onClick={onClose}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-12 rounded-xl"
              data-testid="button-close-ad"
            >
              <X className="w-4 h-4 mr-2" /> Close & Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
