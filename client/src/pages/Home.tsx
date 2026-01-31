import { useUser, useJump } from "@/hooks/use-user";
import { FrogCharacter } from "@/components/FrogCharacter";
import { TonCoin } from "@/components/TonCoin";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Coins, Clock, Gift, Play } from "lucide-react";
import { AdModal } from "@/components/AdModal";
import { ClaimModal } from "@/components/ClaimModal";

const SESSION_REWARD = 0.0000005;
const CLICKS_PER_SESSION = 100;
const AD_INTERVAL = 20;
const SESSION_COOLDOWN = 3600; // 1 hour in seconds

const FloatingCoin = ({ x, y, id }: { x: number; y: number; id: number }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: 0.5 }}
    animate={{ opacity: 0, y: -120, scale: 1.2 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="fixed z-50 pointer-events-none flex items-center gap-2"
    style={{ left: x - 30, top: y - 20 }}
  >
    <div className="w-8 h-8 ton-coin flex items-center justify-center">
      <span className="text-white text-xs font-bold">T</span>
    </div>
  </motion.div>
);

export default function Home() {
  const { data: user } = useUser();
  const { mutate: jump } = useJump();
  
  const [isJumping, setIsJumping] = useState(false);
  const [clicks, setClicks] = useState<{id: number; x: number; y: number}[]>([]);
  const [showAd, setShowAd] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [jumpCount, setJumpCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [pendingAdForClaim, setPendingAdForClaim] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('frogGameState');
    if (savedState) {
      const state = JSON.parse(savedState);
      const now = Date.now();
      
      if (state.cooldownEnd && now < state.cooldownEnd) {
        setCooldownTimer(Math.ceil((state.cooldownEnd - now) / 1000));
        setSessionComplete(true);
      } else {
        setJumpCount(state.jumpCount || 0);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      jumpCount,
      cooldownEnd: sessionComplete ? Date.now() + cooldownTimer * 1000 : null
    };
    localStorage.setItem('frogGameState', JSON.stringify(state));
  }, [jumpCount, sessionComplete, cooldownTimer]);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldownTimer > 0) {
      const interval = setInterval(() => {
        setCooldownTimer(prev => {
          if (prev <= 1) {
            setSessionComplete(false);
            setJumpCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownTimer]);

  const handleJump = (e: React.MouseEvent | React.TouchEvent) => {
    if (isJumping || sessionComplete) return;
    
    const newCount = jumpCount + 1;
    
    // Check if session complete (100 clicks)
    if (newCount >= CLICKS_PER_SESSION) {
      setJumpCount(newCount);
      setShowClaim(true);
      return;
    }
    
    // Check if ad should show (every 20 clicks)
    if (newCount > 0 && newCount % AD_INTERVAL === 0) {
      setJumpCount(newCount);
      setShowAd(true);
      return;
    }

    setIsJumping(true);
    setJumpCount(newCount);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setClicks(prev => [...prev, {
      id: Date.now(),
      x: clientX,
      y: clientY - 50,
    }]);

    setTimeout(() => setIsJumping(false), 150);
  };

  const handleAdClose = () => {
    setShowAd(false);
    if (pendingAdForClaim) {
      // After claim ad, actually claim the reward
      jump(undefined, {
        onSuccess: () => {
          setSessionComplete(true);
          setCooldownTimer(SESSION_COOLDOWN);
          setPendingAdForClaim(false);
        }
      });
    }
  };

  const handleClaim = () => {
    setShowClaim(false);
    setPendingAdForClaim(true);
    setShowAd(true);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (jumpCount / CLICKS_PER_SESSION) * 100;

  return (
    <div className="min-h-screen bg-cave-pattern flex flex-col items-center pb-24 relative overflow-hidden">
      <AdModal open={showAd} onClose={handleAdClose} />
      <ClaimModal 
        open={showClaim} 
        onClaim={handleClaim} 
        reward={SESSION_REWARD}
      />

      {/* Top HUD */}
      <div className="w-full p-4 flex flex-col gap-4 z-20 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="flex justify-between items-center gap-4">
          {/* Session Progress */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/40 animate-pulse-glow"
              whileTap={{ scale: 0.95 }}
            >
              {user?.username ? (
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-black font-num text-primary">{jumpCount}</span>
              )}
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{user?.username || 'Guest'}</span>
              <span className="text-sm font-bold text-white flex items-center gap-1">
                <Gift className="w-3 h-3 text-secondary animate-icon-pulse" /> 
                <span className="font-num">{CLICKS_PER_SESSION - jumpCount} left</span>
              </span>
            </div>
          </div>

          {/* Balance Display */}
          <motion.div 
            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 neon-border-blue"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-icon-pulse" />
            <span className="text-lg font-bold font-num tracking-wide">
              {user?.balance ? parseFloat(user.balance.toString()).toFixed(7) : "0.0000000"}
            </span>
            <span className="text-xs font-bold text-primary">TON</span>
          </motion.div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex justify-between text-xs font-bold mb-1 px-1">
            <span className="flex items-center gap-1 text-secondary">
              <Zap className="w-3 h-3 fill-secondary animate-icon-pulse" /> Progress
            </span>
            <span className="font-num text-white/80">{jumpCount}/{CLICKS_PER_SESSION}</span>
          </div>
          <div className="h-4 bg-black/40 border border-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 shadow-[0_0_15px_rgba(57,255,20,0.5)]" 
              style={{ width: `${progress}%` }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Ad markers every 20 taps */}
            {[20, 40, 60, 80].map(mark => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/50"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        {/* Background Glow Effects */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-[120px]" />

        {sessionComplete ? (
          /* Cooldown State */
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center animate-pulse-glow">
              <Clock className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-4">Next session available in:</p>
            <div className="text-4xl font-black font-num text-primary neon-text">
              {formatTime(cooldownTimer)}
            </div>
            <p className="text-sm text-secondary mt-4">
              You earned {SESSION_REWARD.toFixed(7)} TON
            </p>
          </motion.div>
        ) : (
          <>
            {/* The Frog */}
            <div className="mt-4 relative z-10">
              <FrogCharacter isJumping={isJumping} onClick={() => {}} />
              
              {/* Invisible overlay to capture clicks */}
              <div 
                className="absolute -inset-24 z-20 cursor-pointer" 
                onClick={handleJump}
                onTouchStart={handleJump}
                data-testid="button-jump"
              />
            </div>

            {/* Hint Text */}
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="mt-10 text-muted-foreground text-sm font-semibold tracking-wide"
            >
              Tap {CLICKS_PER_SESSION} times to claim reward!
            </motion.p>

            {/* Next Ad Indicator */}
            <div className="mt-6 glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Next Ad</span>
                <span className="font-num font-bold text-yellow-400">
                  {AD_INTERVAL - (jumpCount % AD_INTERVAL)} taps
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Ad Reward</span>
                <span className="font-num font-bold text-secondary">
                  {SESSION_REWARD.toFixed(7)} TON
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Coins Animation */}
      <AnimatePresence>
        {clicks.map(click => (
          <FloatingCoin key={click.id} x={click.x} y={click.y} id={click.id} />
        ))}
      </AnimatePresence>
    </div>
  );
}
