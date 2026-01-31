import { getCollection, getNextSequence } from "./db";
import {
  type User,
  type InsertUser,
  type Withdrawal,
  type InsertWithdrawal,
  type Task,
  type InsertTask,
  type CompletedTask,
  type InsertCompletedTask,
  type BotSettings,
} from "@shared/schema";

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

function normalizeUserForReturn(u: any): User {
  // Ensure the fields match the expected schema types
  return {
    id: u.id,
    telegramId: u.telegramId,
    username: u.username,
    balance: (u.balance ?? 0).toString(),
    level: u.level ?? 1,
    referralCode: u.referralCode,
    referrerId: u.referrerId,
    referralRewardClaimed: !!u.referralRewardClaimed,
    lastJumpTime: u.lastJumpTime ? new Date(u.lastJumpTime) : undefined,
    lastDailyBonus: u.lastDailyBonus ? new Date(u.lastDailyBonus) : undefined,
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
  } as User;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const col = getCollection('users');
    const u = await col.findOne({ id } as any);
    if (!u) return undefined;
    return normalizeUserForReturn(u);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const col = getCollection('users');
    const u = await col.findOne({ telegramId } as any);
    if (!u) return undefined;
    return normalizeUserForReturn(u);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const col = getCollection('users');
    const u = await col.findOne({ username } as any);
    if (!u) return undefined;
    return normalizeUserForReturn(u);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const col = getCollection('users');
    const id = await getNextSequence('users');
    const referralCode = `${id.toString(36)}${Math.floor(Math.random() * 1000)}`;
    const level = (insertUser as any).level ?? 1;
    const doc: any = {
      id,
      telegramId: insertUser.telegramId,
      username: insertUser.username,
      balance: 0, // store numeric balance, normalized when returning
      level,
      referralCode,
      referrerId: (insertUser as any).referrerId,
      referralRewardClaimed: false,
      lastJumpTime: (insertUser as any).lastJumpTime,
      lastDailyBonus: (insertUser as any).lastDailyBonus,
      createdAt: new Date(),
    };
    await col.insertOne(doc);
    return normalizeUserForReturn(doc);
  }

  async updateUserBalance(userId: number, amountToAdd: number): Promise<User> {
    const col = getCollection('users');
    const res = await col.findOneAndUpdate({ id: userId }, { $inc: { balance: amountToAdd }, $set: { lastJumpTime: new Date() } }, { returnDocument: 'after' });
    if (!res.value) throw new Error('User not found');
    return normalizeUserForReturn(res.value);
  }

  async updateUserDailyBonus(userId: number): Promise<User> {
    const col = getCollection('users');
    const res = await col.findOneAndUpdate({ id: userId }, { $set: { lastDailyBonus: new Date() } }, { returnDocument: 'after' });
    if (!res.value) throw new Error('User not found');
    return normalizeUserForReturn(res.value);
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const col = getCollection('withdrawals');
    const id = await getNextSequence('withdrawals');
    const doc: any = { id, ...withdrawal, createdAt: new Date() };
    await col.insertOne(doc);
    return doc as Withdrawal;
  }

  async getWithdrawals(userId: number): Promise<Withdrawal[]> {
    const col = getCollection('withdrawals');
    return await col.find({ userId } as any).toArray();
  }

  async getReferrals(referrerId: number): Promise<User[]> {
    const col = getCollection('users');
    const rows = await col.find({ referrerId } as any).toArray();
    return rows.map(normalizeUserForReturn);
  }

  async getTasks(): Promise<Task[]> {
    const col = getCollection('tasks');
    return await col.find().toArray();
  }

  async getTask(id: number): Promise<Task | undefined> {
    const col = getCollection('tasks');
    const t = await col.findOne({ id } as any);
    return (t as unknown as Task) ?? undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const col = getCollection('tasks');
    const id = await getNextSequence('tasks');
    const doc: any = { id, ...task, createdAt: new Date() };
    await col.insertOne(doc);
    return doc;
  }

  async deleteTask(id: number): Promise<void> {
    const col = getCollection('tasks');
    await col.deleteOne({ id });
  }

  async getCompletedTasks(userId: number): Promise<CompletedTask[]> {
    const col = getCollection('completedTasks');
    return await col.find({ userId } as any).toArray();
  }

  async completeTask(data: InsertCompletedTask): Promise<CompletedTask> {
    const col = getCollection('completedTasks');
    const doc: any = { ...data, completedAt: new Date() };
    await col.insertOne(doc);
    return doc as CompletedTask;
  }

  async isTaskCompleted(userId: number, taskId: number): Promise<boolean> {
    const col = getCollection('completedTasks');
    const found = await col.findOne({ userId, taskId });
    return !!found;
  }

  async getSettings(): Promise<Record<string, string>> {
    const col = getCollection('botSettings');
    const rows = await col.find().toArray();
    const result: Record<string, string> = {};
    for (const r of rows) result[r.key] = r.value;
    return result;
  }

  async updateSettings(newSettings: Record<string, string>): Promise<void> {
    const col = getCollection('botSettings');
    for (const [key, value] of Object.entries(newSettings)) {
      await col.updateOne({ key }, { $set: { key, value, updatedAt: new Date() } }, { upsert: true } as any);
    }
  }

  async getSetting(key: string): Promise<string | undefined> {
    const col = getCollection('botSettings');
    const s = await col.findOne({ key } as any);
    return s?.value;
  }

  async markReferralRewardClaimed(userId: number): Promise<void> {
    const col = getCollection('users');
    await col.updateOne({ id: userId }, { $set: { referralRewardClaimed: true } });
  }

  async getAllWithdrawals(): Promise<(Withdrawal & { username?: string })[]> {
    const col = getCollection('withdrawals');
    const allWithdrawals = await col.find().toArray();
    const result: (Withdrawal & { username?: string })[] = [];
    for (const w of allWithdrawals) {
      const user = await this.getUser(w.userId);
      result.push({ ...w, username: user?.username ?? undefined });
    }
    return result;
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal> {
    const col = getCollection('withdrawals');
    const res = await col.findOneAndUpdate({ id } as any, { $set: { status } } as any, { returnDocument: 'after' } as any);
    if (!res.value) throw new Error('Withdrawal not found');
    return res.value as Withdrawal;
  }

  async refundWithdrawal(id: number): Promise<void> {
    const col = getCollection('withdrawals');
    const w = await col.findOne({ id } as any);
    if (w) {
      await this.updateUserBalance(w.userId, parseFloat(w.amount as any));
    }
  }
}

export const storage = new DatabaseStorage();
