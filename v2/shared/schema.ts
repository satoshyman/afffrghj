import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").unique(),
  username: text("username"),
  balance: decimal("balance", { precision: 18, scale: 10 }).default("0.0000000000"),
  level: integer("level").default(1),
  referralCode: text("referral_code"),
  referrerId: integer("referrer_id"),
  referralRewardClaimed: boolean("referral_reward_claimed").default(false),
  lastJumpTime: timestamp("last_jump_time"),
  lastDailyBonus: timestamp("last_daily_bonus"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 10 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  reward: decimal("reward", { precision: 18, scale: 10 }).default("0.00001"),
  icon: text("icon").default("gift"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const completedTasks = pgTable("completed_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  balance: true, 
  level: true, 
  createdAt: true 
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ 
  id: true, 
  status: true, 
  createdAt: true 
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCompletedTaskSchema = createInsertSchema(completedTasks).omit({ 
  id: true, 
  completedAt: true 
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({ 
  id: true, 
  updatedAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type CompletedTask = typeof completedTasks.$inferSelect;
export type InsertCompletedTask = z.infer<typeof insertCompletedTaskSchema>;

export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;

export type JumpRequest = {
  energyConsumed: number;
};

export type ClaimLevelRequest = {
  levelId: number;
};

export type WithdrawalRequest = InsertWithdrawal;
