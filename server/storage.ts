import { db } from "./db";
import {
  users,
  withdrawals,
  tasks,
  completedTasks,
  botSettings,
  type User,
  type InsertUser,
  type Withdrawal,
  type InsertWithdrawal,
  type Task,
  type InsertTask,
  type CompletedTask,
  type InsertCompletedTask,
  type BotSettings,
  type InsertBotSettings,
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amountToAdd: number): Promise<User>;
  updateUserDailyBonus(userId: number): Promise<User>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(userId: number): Promise<Withdrawal[]>;
  getReferrals(referrerId: number): Promise<User[]>;
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getCompletedTasks(userId: number): Promise<CompletedTask[]>;
  completeTask(data: InsertCompletedTask): Promise<CompletedTask>;
  isTaskCompleted(userId: number, taskId: number): Promise<boolean>;
  getSettings(): Promise<Record<string, string>>;
  updateSettings(settings: Record<string, string>): Promise<void>;
  getSetting(key: string): Promise<string | undefined>;
  markReferralRewardClaimed(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(userId: number, amountToAdd: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${amountToAdd}`,
        lastJumpTime: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserDailyBonus(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        lastDailyBonus: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [entry] = await db.insert(withdrawals).values(withdrawal).returning();
    return entry;
  }

  async getWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
  }

  async getReferrals(referrerId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.referrerId, referrerId));
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getCompletedTasks(userId: number): Promise<CompletedTask[]> {
    return await db.select().from(completedTasks).where(eq(completedTasks.userId, userId));
  }

  async completeTask(data: InsertCompletedTask): Promise<CompletedTask> {
    const [completed] = await db.insert(completedTasks).values(data).returning();
    return completed;
  }

  async isTaskCompleted(userId: number, taskId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(completedTasks)
      .where(and(eq(completedTasks.userId, userId), eq(completedTasks.taskId, taskId)));
    return !!result;
  }

  async getSettings(): Promise<Record<string, string>> {
    const settings = await db.select().from(botSettings);
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async updateSettings(newSettings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(newSettings)) {
      await db
        .insert(botSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: botSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(botSettings).where(eq(botSettings.key, key));
    return setting?.value;
  }

  async markReferralRewardClaimed(userId: number): Promise<void> {
    await db.update(users).set({ referralRewardClaimed: true }).where(eq(users.id, userId));
  }

  async getAllWithdrawals(): Promise<(Withdrawal & { username?: string })[]> {
    const allWithdrawals = await db.select().from(withdrawals);
    const result = [];
    for (const w of allWithdrawals) {
      const user = await this.getUser(w.userId);
      result.push({ ...w, username: user?.username });
    }
    return result;
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal> {
    const [updated] = await db
      .update(withdrawals)
      .set({ status })
      .where(eq(withdrawals.id, id))
      .returning();
    return updated;
  }

  async refundWithdrawal(id: number): Promise<void> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    if (withdrawal) {
      await this.updateUserBalance(withdrawal.userId, parseFloat(withdrawal.amount as string));
    }
  }
}

export const storage = new DatabaseStorage();
