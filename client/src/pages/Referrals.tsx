import { useUser, useReferrals } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Users, Trophy, Sparkles, Clock, Timer, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const REFERRAL_BONUS = 0.00005;

export default function Referrals() {
  const { data: user } = useUser();
  const { data: referrals, isLoading } = useReferrals();
  const { toast } = useToast();

  const botUsername = 'Frogrewerd_bot';
  const referralLink = user?.telegramId 
    ? `https://t.me/${botUsername}?start=${user.telegramId}`
    : 'Loading...';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Share it with friends to earn rewards.",
      className: "bg-secondary text-secondary-foreground border-none"
    });
  };

  const totalEarned = referrals ? (referrals.filter(r => r.referralRewardClaimed).length * REFERRAL_BONUS).toFixed(5) : "0.00000";
  const pendingEarned = referrals ? (referrals.filter(r => !r.referralRewardClaimed).length * REFERRAL_BONUS).toFixed(5) : "0.00000";

  return (
    <div className="min-h-screen bg-cave-pattern px-4 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-black mb-2 gradient-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Invite Friends
        </motion.h1>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">
            Earn <span className="text-secondary font-bold font-num">{REFERRAL_BONUS}</span> TON for each active friend!
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-yellow-500/80 bg-yellow-500/5 py-1 px-3 rounded-full w-fit mx-auto border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            <span>Reward added after 1 hour of active play</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/60 border-primary/30 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer" />
            <CardContent className="p-4 flex flex-col items-center justify-center text-center relative z-10">
              <Users className="w-8 h-8 text-primary mb-2 animate-icon-pulse" />
              <span className="text-3xl font-bold font-num text-white">
                {isLoading ? "-" : referrals?.length || 0}
              </span>
              <span className="text-xs text-muted-foreground">Total Friends</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/60 border-secondary/30 backdrop-blur-sm neon-border">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Gift className="w-8 h-8 text-secondary mb-2 animate-icon-pulse" />
              <span className="text-3xl font-bold font-num text-white">
                {totalEarned}
              </span>
              <span className="text-xs text-muted-foreground">Completed (TON)</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-500/90">Pending Rewards:</span>
          </div>
          <span className="text-sm font-bold font-num text-yellow-500">+{pendingEarned} TON</span>
        </div>
      </motion.div>

      {/* Referral Link Action */}
      <motion.div 
        className="bg-gradient-to-r from-primary/15 to-secondary/10 border border-primary/30 rounded-2xl p-6 mb-8 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
        
        <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2 relative z-10">
          <Trophy className="w-5 h-5 text-yellow-400 animate-icon-pulse" /> 
          Your Referral Link
        </h3>
        
        <div className="bg-black/40 rounded-xl p-3 mb-4 break-all font-mono text-xs text-primary/90 border border-white/10 relative z-10">
          {referralLink}
        </div>

        <Button 
          onClick={copyLink}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl animate-pulse-glow"
          data-testid="button-copy-link"
        >
          <Copy className="w-4 h-4 mr-2" /> Copy Link
        </Button>

        <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1 relative z-10">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          Reward added after they play actively for 1 hour
        </p>
      </motion.div>

      {/* Friends List */}
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-muted-foreground" />
        Your Friends
      </h3>
      
      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card/30 rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1">
                <Skeleton className="w-24 h-4 bg-white/5 mb-2" />
                <Skeleton className="w-16 h-3 bg-white/5" />
              </div>
            </div>
          ))
        ) : referrals?.length === 0 ? (
          <motion.div 
            className="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-dashed border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No friends yet</p>
            <p className="text-sm mt-1">Share your link to start earning!</p>
          </motion.div>
        ) : (
          referrals?.map((ref, index) => (
            <motion.div 
              key={ref.id} 
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-white/5 hover:border-primary/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center text-xs font-bold border border-white/10">
                  {ref.username?.substring(0, 2).toUpperCase() || "??"}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{ref.username || "Unknown User"}</div>
                  <div className="text-xs text-muted-foreground font-num flex items-center gap-1">
                    Level {ref.level} • {ref.referralRewardClaimed ? (
                      <span className="text-green-500 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center gap-0.5">
                        <Timer className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-secondary font-num">+{REFERRAL_BONUS.toFixed(5)} TON</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
