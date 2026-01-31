import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useTasks, useCompleteTask, useDailyBonus, useClaimDailyBonus } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, ExternalLink, Users, Megaphone, Clock, CheckCircle2, 
  Sparkles, Coins, Trophy, Zap, Star, Timer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  gift: Gift,
  link: ExternalLink,
  users: Users,
  megaphone: Megaphone,
  star: Star,
  trophy: Trophy,
  zap: Zap,
  sparkles: Sparkles,
};

interface TaskCardProps {
  task: any;
  isCompleted: boolean;
  onClaim: (taskId: number) => void;
  isLoading: boolean;
}

function TaskCard({ task, isCompleted, onClaim, isLoading }: TaskCardProps) {
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const Icon = iconMap[task.icon] || Gift;

  const handleStart = () => {
    if (task.url) {
      window.open(task.url, "_blank");
    }
    setIsVerifying(true);
    setCountdown(10);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isVerifying && countdown === 0) {
      setCanClaim(true);
    }
  }, [countdown, isVerifying]);

  const handleClaim = () => {
    onClaim(task.id);
    setIsVerifying(false);
    setCanClaim(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className={`border-white/10 ${isCompleted ? 'bg-card/50 opacity-60' : 'bg-gradient-to-r from-card to-card/80'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isCompleted ? 'bg-green-500/20' : 'bg-primary/20'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Icon className="w-6 h-6 text-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-white">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">
                  +{parseFloat(task.reward).toFixed(5)} TON
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {isCompleted ? (
                <span className="text-xs text-green-500 font-bold">Completed</span>
              ) : isVerifying ? (
                countdown > 0 ? (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="font-num text-yellow-400">{countdown}s</span>
                  </div>
                ) : canClaim ? (
                  <Button
                    size="sm"
                    onClick={handleClaim}
                    disabled={isLoading}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground animate-pulse-green"
                  >
                    {isLoading ? "..." : "Claim"}
                  </Button>
                ) : null
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStart}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  Start
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Tasks() {
  const { data: user } = useUser();
  const { data: tasksData, isLoading: tasksLoading } = useTasks();
  const { data: dailyBonus } = useDailyBonus();
  const { mutate: completeTask, isPending: completingTask } = useCompleteTask();
  const { mutate: claimDailyBonus, isPending: claimingBonus } = useClaimDailyBonus();
  const { toast } = useToast();

  const handleCompleteTask = (taskId: number) => {
    completeTask(taskId, {
      onSuccess: () => {
        toast({
          title: "Reward Claimed!",
          description: "The reward has been added to your balance.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to claim reward.",
          variant: "destructive",
        });
      },
    });
  };

  const handleClaimDailyBonus = () => {
    claimDailyBonus(undefined, {
      onSuccess: () => {
        toast({
          title: "Daily Bonus Claimed!",
          description: "+0.00001 TON added to your balance.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Already claimed today.",
          variant: "destructive",
        });
      },
    });
  };

  const completedTaskIds = tasksData?.completedTasks?.map((ct: any) => ct.taskId) || [];
  const activeTasks = tasksData?.tasks?.filter((t: any) => t.isActive) || [];

  const canClaimDailyBonus = dailyBonus?.canClaim ?? false;

  return (
    <div className="min-h-screen bg-cave-pattern pb-24">
      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black gradient-text mb-2">EARN TON</h1>
          <p className="text-muted-foreground text-sm">Complete tasks and boost your balance</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-5 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent relative overflow-hidden group"
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Gift className="w-8 h-8 text-yellow-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg leading-tight">Daily Bonus</h3>
                  <p className="text-xs text-yellow-500/70 font-medium">Free reward every 24h</p>
                </div>
              </div>
              <Button
                onClick={handleClaimDailyBonus}
                disabled={!canClaimDailyBonus || claimingBonus}
                className={`h-12 px-6 rounded-xl font-black transition-all ${
                  canClaimDailyBonus 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95" 
                    : "bg-white/5 text-white/30 border border-white/10"
                }`}
              >
                {claimingBonus ? "..." : canClaimDailyBonus ? "CLAIM" : "DONE"}
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Available Tasks
          </h2>
          
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <Card className="border-white/10 bg-card/50">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tasks available right now</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {activeTasks.map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={completedTaskIds.includes(task.id)}
                    onClaim={handleCompleteTask}
                    isLoading={completingTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-card/30 rounded-xl border border-white/5">
          <p className="text-xs text-center text-muted-foreground">
            Complete all tasks to maximize your earnings!
          </p>
        </div>
      </div>
    </div>
  );
}
