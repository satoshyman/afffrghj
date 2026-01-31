import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, ListTodo, Plus, Trash2, Lock, 
  Clock, Coins, Users, Gift, ExternalLink, Megaphone,
  Save, ArrowLeft, Star, Zap, Trophy, Wallet,
  Check, X, AlertCircle
} from "lucide-react";
import { 
  useSettings, useUpdateSettings, useAdminTasks, useCreateTask, useDeleteTask,
  useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal
} from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PIN = "9999";

const taskIcons = [
  { value: "gift", label: "Gift", icon: Gift },
  { value: "link", label: "Link", icon: ExternalLink },
  { value: "users", label: "Channel", icon: Users },
  { value: "megaphone", label: "Ads", icon: Megaphone },
  { value: "star", label: "Star", icon: Star },
  { value: "zap", label: "Bonus", icon: Zap },
  { value: "trophy", label: "Trophy", icon: Trophy },
];

const taskTypes = [
  { value: "channel", label: "Join Channel" },
  { value: "link", label: "External Link" },
  { value: "ads", label: "Watch Ads" },
  { value: "bonus", label: "Bonus Task" },
];

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "tasks" | "withdrawals">("settings");
  const { toast } = useToast();

  const { data: settings } = useSettings();
  const { mutate: updateSettings, isPending: updatingSettings } = useUpdateSettings();
  const { data: tasksData, isLoading: tasksLoading } = useAdminTasks();
  const { mutate: createTask, isPending: creatingTask } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useAdminWithdrawals();
  const { mutate: approveWithdrawal, isPending: approvingWithdrawal } = useApproveWithdrawal();
  const { mutate: rejectWithdrawal, isPending: rejectingWithdrawal } = useRejectWithdrawal();

  const [newTask, setNewTask] = useState({
    type: "link",
    title: "",
    description: "",
    url: "",
    reward: "0.00001",
    icon: "gift",
    isActive: true,
  });

  const [settingsForm, setSettingsForm] = useState({
    sessionTime: settings?.sessionTime || "3600",
    sessionsCount: settings?.sessionsCount || "100",
    sessionReward: settings?.sessionReward || "0.0000005",
    finalReward: settings?.finalReward || "0.0000005",
    minWithdrawal: settings?.minWithdrawal || "0.01",
    referralReward: settings?.referralReward || "0.00005",
    dailyBonusReward: settings?.dailyBonusReward || "0.00001",
    taskReward: settings?.taskReward || "0.00001",
  });

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPin("");
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid PIN code",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = () => {
    updateSettings(settingsForm, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "Bot settings have been updated.",
        });
      },
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    createTask(newTask, {
      onSuccess: () => {
        toast({
          title: "Task Created",
          description: "New task has been added.",
        });
        setNewTask({
          type: "link",
          title: "",
          description: "",
          url: "",
          reward: "0.00001",
          icon: "gift",
          isActive: true,
        });
      },
    });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId, {
      onSuccess: () => {
        toast({
          title: "Task Deleted",
          description: "Task has been removed.",
        });
      },
    });
  };

  const handleApproveWithdrawal = (id: number) => {
    approveWithdrawal(id, {
      onSuccess: () => {
        toast({
          title: "Withdrawal Approved",
          description: "Payment marked as completed.",
        });
      },
    });
  };

  const handleRejectWithdrawal = (id: number) => {
    rejectWithdrawal(id, {
      onSuccess: () => {
        toast({
          title: "Withdrawal Rejected",
          description: "Amount refunded to user balance.",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 text-green-500 bg-green-500/20 px-2 py-1 rounded-full text-xs font-bold">
            <Check className="w-3 h-3" /> Paid
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-500 bg-red-500/20 px-2 py-1 rounded-full text-xs font-bold">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-sm border-primary/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Enter PIN</Label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="text-center text-2xl tracking-widest"
                maxLength={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePinSubmit}>
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background overflow-auto pb-20"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
          <div className="w-20" />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            size="sm"
          >
            <Settings className="w-4 h-4 mr-1" /> Settings
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "outline"}
            onClick={() => setActiveTab("tasks")}
            size="sm"
          >
            <ListTodo className="w-4 h-4 mr-1" /> Tasks
          </Button>
          <Button
            variant={activeTab === "withdrawals" ? "default" : "outline"}
            onClick={() => setActiveTab("withdrawals")}
            size="sm"
          >
            <Wallet className="w-4 h-4 mr-1" /> Withdrawals
          </Button>
        </div>

        {activeTab === "settings" && (
          <div className="space-y-4">
            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Session Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Session Cooldown (seconds)</Label>
                  <Input
                    type="number"
                    value={settingsForm.sessionTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sessionTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Taps Per Session</Label>
                  <Input
                    type="number"
                    value={settingsForm.sessionsCount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sessionsCount: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" /> Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Session Reward (TON)</Label>
                  <Input
                    value={settingsForm.sessionReward}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sessionReward: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Final Session Reward (TON)</Label>
                  <Input
                    value={settingsForm.finalReward}
                    onChange={(e) => setSettingsForm({ ...settingsForm, finalReward: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Referral Reward (TON)</Label>
                  <Input
                    value={settingsForm.referralReward}
                    onChange={(e) => setSettingsForm({ ...settingsForm, referralReward: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Daily Bonus Reward (TON)</Label>
                  <Input
                    value={settingsForm.dailyBonusReward}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dailyBonusReward: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Task Reward (TON)</Label>
                  <Input
                    value={settingsForm.taskReward}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taskReward: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" /> Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Minimum Withdrawal (TON)</Label>
                  <Input
                    value={settingsForm.minWithdrawal}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={handleSaveSettings}
              disabled={updatingSettings}
            >
              <Save className="w-4 h-4 mr-2" />
              {updatingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Add New Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Task Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border bg-background"
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  >
                    {taskTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Join our Telegram channel"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Subscribe to get updates"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={newTask.url}
                    onChange={(e) => setNewTask({ ...newTask, url: e.target.value })}
                    placeholder="https://t.me/..."
                  />
                </div>
                <div>
                  <Label>Reward (TON)</Label>
                  <Input
                    value={newTask.reward}
                    onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Icon</Label>
                  <div className="flex gap-2 flex-wrap">
                    {taskIcons.map((icon) => {
                      const IconComp = icon.icon;
                      return (
                        <Button
                          key={icon.value}
                          type="button"
                          variant={newTask.icon === icon.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewTask({ ...newTask, icon: icon.value })}
                        >
                          <IconComp className="w-4 h-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateTask}
                  disabled={creatingTask}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creatingTask ? "Creating..." : "Create Task"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Existing Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : tasksData?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {tasksData?.map((task: any) => {
                      const IconComp = taskIcons.find(i => i.value === task.icon)?.icon || Gift;
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-card/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                +{parseFloat(task.reward).toFixed(5)} TON
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" /> Withdrawal Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !withdrawalsData || withdrawalsData.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No withdrawal requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawalsData.map((withdrawal: any) => (
                      <div
                        key={withdrawal.id}
                        className="p-4 bg-card/50 rounded-xl border border-white/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-white">
                              {withdrawal.username || `User #${withdrawal.userId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(withdrawal.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <span className="font-bold text-yellow-400">
                              {parseFloat(withdrawal.amount).toFixed(5)} TON
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Wallet:</span>
                            <span className="text-xs font-mono text-white break-all max-w-[200px]">
                              {withdrawal.walletAddress}
                            </span>
                          </div>
                        </div>

                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveWithdrawal(withdrawal.id)}
                              disabled={approvingWithdrawal || rejectingWithdrawal}
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleRejectWithdrawal(withdrawal.id)}
                              disabled={approvingWithdrawal || rejectingWithdrawal}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
}
