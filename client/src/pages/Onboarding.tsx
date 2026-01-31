import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-user";
import { Loader2, Sparkles, Coins, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { mutate: login, isPending } = useLogin();
  const [, setLocation] = useLocation();

  // Auto-login logic for Telegram WebApp
  useEffect(() => {
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      const tg = window.Telegram.WebApp;
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        login({
          telegramId: user.id.toString(),
          username: user.username || user.first_name,
          referralCode: tg.initDataUnsafe.start_param,
        }, {
          onSuccess: () => setLocation("/")
        });
      }
    }
  }, [login, setLocation]);

  const handleStart = () => {
    // Try to get data from Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    const telegramId = user?.id?.toString() || Math.floor(Math.random() * 1000000).toString();
    const username = user?.username || user?.first_name || "Frog_User";

    login({ 
      telegramId, 
      username,
      referralCode: new URLSearchParams(window.location.search).get('ref') || undefined
    }, {
      onSuccess: () => setLocation("/"),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-15%] right-[-15%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[60%] h-[60%] bg-secondary/15 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full" />
      
      <motion.div 
        className="z-10 text-center space-y-8 max-w-sm w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo / Frog Graphic */}
        <motion.div 
          className="mx-auto w-44 h-44 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-[40px] flex items-center justify-center rotate-3 border-4 border-secondary/40 animate-pulse-green relative overflow-hidden"
          whileHover={{ scale: 1.05, rotate: 0 }}
        >
          <div className="absolute inset-0 animate-shimmer" />
          {/* CSS Frog Face */}
          <div className="relative">
            <div className="w-24 h-20 bg-secondary rounded-[40%] relative border-4 border-green-800">
              {/* Eyes */}
              <div className="absolute -top-4 left-0 w-8 h-8 bg-secondary rounded-full border-3 border-green-800">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
              </div>
              <div className="absolute -top-4 right-0 w-8 h-8 bg-secondary rounded-full border-3 border-green-800">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
              </div>
              {/* Mouth */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-green-800 rounded-full" />
            </div>
          </div>
          
          {/* Floating TON coin */}
          <motion.div 
            className="absolute -top-2 -right-2 w-10 h-10 ton-coin flex items-center justify-center"
            animate={{ y: [0, -8, 0], rotate: [0, 360] }}
            transition={{ y: { duration: 2, repeat: Infinity }, rotate: { duration: 4, repeat: Infinity, ease: "linear" } }}
          >
            <Coins className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>

        <div className="space-y-3">
          <motion.h1 
            className="text-4xl font-black text-white leading-tight font-game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="gradient-text">Frog</span>{" "}
            <span className="text-white">Kingdom</span>
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Jump, collect TON coins, and withdraw instantly!
          </motion.p>
        </div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-3 gap-4 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Zap className="w-6 h-6 text-primary animate-icon-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Tap to Earn</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
              <Coins className="w-6 h-6 text-secondary animate-icon-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Real TON</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
              <Sparkles className="w-6 h-6 text-accent animate-icon-pulse" />
            </div>
            <span className="text-xs text-muted-foreground">Instant Pay</span>
          </div>
        </motion.div>

        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={handleStart} 
            disabled={isPending}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl shadow-primary/30 transition-all active:scale-95 animate-pulse-glow"
            data-testid="button-start"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Playing Now
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4 opacity-50">
            (Dev Mode: A test account will be created)
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
