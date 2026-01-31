import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.users.me.path, async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  app.post(api.users.login.path, async (req, res) => {
    try {
      const { telegramId, username, referralCode } = api.users.login.input.parse(req.body);
      
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        let referrerId: number | null = null;
        if (referralCode) {
           // Find referrer by their telegramId which is passed as referralCode in the start param
           const referrer = await storage.getUserByTelegramId(referralCode);
           if (referrer) {
             referrerId = referrer.id;
             // Reward will be granted after the referred user plays for 1 hour (handled on /api/users/jump)
           }
        }

        user = await storage.createUser({
          telegramId,
          username: username || `user_${telegramId}`,
          referralCode: telegramId, // Using telegramId as the referral code for "smart" links
          referrerId: referrerId,
        });
        
        return res.status(201).json(user);
      }
      
      res.json(user);
    } catch (err) {
       console.error(err);
       res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post(api.users.jump.path, async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sessionReward = await storage.getSetting("sessionReward") || "0.0000005";
    const earned = sessionReward;
    const updatedUser = await storage.updateUserBalance(user.id, parseFloat(earned));

    // Check for referral reward condition: 1 hour since registration
    if (updatedUser.referrerId && !updatedUser.referralRewardClaimed) {
      const oneHour = 60 * 60 * 1000;
      const timeSinceReg = Date.now() - new Date(updatedUser.createdAt!).getTime();
      
      if (timeSinceReg >= oneHour) {
        const referralReward = await storage.getSetting("referralReward") || "0.00005";
        await storage.updateUserBalance(updatedUser.referrerId, parseFloat(referralReward));
        console.log(`[REFERRAL] ${new Date().toISOString()} Granted ${referralReward} TON to referrerId=${updatedUser.referrerId} for referredUser=${user.telegramId}`);
        await storage.markReferralRewardClaimed(user.id);
      }
    }

    res.json({
      balance: updatedUser.balance,
      earned: earned
    });
  });

  app.get(api.users.getReferrals.path, async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const referrals = await storage.getReferrals(user.id);
    res.json(referrals);
  });

  app.post(api.withdrawals.create.path, async (req, res) => {
    try {
      const input = api.withdrawals.create.input.parse(req.body);
      
      const user = await storage.getUser(input.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const minWithdrawal = await storage.getSetting("minWithdrawal") || "0.01";
      
      if (parseFloat(input.amount as string) < parseFloat(minWithdrawal)) {
        return res.status(400).json({ message: `Minimum withdrawal is ${minWithdrawal} TON` });
      }
      
      if (parseFloat(user.balance as string) < parseFloat(input.amount as string)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawal(input);
      
      await storage.updateUserBalance(user.id, -parseFloat(input.amount as string));

      console.log(`[TELEGRAM NOTIFICATION] User ${user.username} requested withdrawal of ${input.amount} TON to ${input.walletAddress}`);
      
      res.status(201).json(withdrawal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.withdrawals.list.path, async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const withdrawals = await storage.getWithdrawals(user.id);
    res.json(withdrawals);
  });

  app.get("/api/tasks", async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allTasks = await storage.getTasks();
    const completedTasks = await storage.getCompletedTasks(user.id);

    res.json({ tasks: allTasks, completedTasks });
  });

  app.post("/api/tasks/complete", async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { taskId } = req.body;
    
    const isCompleted = await storage.isTaskCompleted(user.id, taskId);
    if (isCompleted) {
      return res.status(400).json({ message: "Task already completed" });
    }

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await storage.completeTask({ userId: user.id, taskId });
    
    const reward = parseFloat(task.reward as string);
    const updatedUser = await storage.updateUserBalance(user.id, reward);

    res.json({ success: true, balance: updatedUser.balance });
  });

  app.get("/api/daily-bonus/status", async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lastClaim = user.lastDailyBonus;
    const now = new Date();
    const canClaim = !lastClaim || (now.getTime() - new Date(lastClaim).getTime() > 24 * 60 * 60 * 1000);

    res.json({ canClaim });
  });

  app.post("/api/daily-bonus/claim", async (req, res) => {
    const telegramId = req.headers['x-telegram-id'] as string;
    if (!telegramId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lastClaim = user.lastDailyBonus;
    const now = new Date();
    const canClaim = !lastClaim || (now.getTime() - new Date(lastClaim).getTime() > 24 * 60 * 60 * 1000);

    if (!canClaim) {
      return res.status(400).json({ message: "Already claimed today" });
    }

    const dailyBonusReward = await storage.getSetting("dailyBonusReward") || "0.00001";
    const reward = parseFloat(dailyBonusReward);
    
    const updatedUser = await storage.updateUserBalance(user.id, reward);
    await storage.updateUserDailyBonus(user.id);

    res.json({ success: true, balance: updatedUser.balance, reward });
  });

  app.get("/api/admin/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/admin/settings", async (req, res) => {
    const settings = req.body;
    await storage.updateSettings(settings);
    res.json({ success: true });
  });

  app.get("/api/admin/tasks", async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/admin/tasks", async (req, res) => {
    const task = await storage.createTask(req.body);
    res.json(task);
  });

  app.delete("/api/admin/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.json({ success: true });
  });

  app.get("/api/admin/withdrawals", async (req, res) => {
    const withdrawals = await storage.getAllWithdrawals();
    res.json(withdrawals);
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
    const id = parseInt(req.params.id);
    const withdrawal = await storage.updateWithdrawalStatus(id, "completed");
    res.json(withdrawal);
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.refundWithdrawal(id);
    const withdrawal = await storage.updateWithdrawalStatus(id, "rejected");
    res.json(withdrawal);
  });

  return httpServer;
}
