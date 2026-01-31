CREATE TABLE "bot_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bot_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "completed_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"reward" numeric(18, 10) DEFAULT '0.00001',
	"icon" text DEFAULT 'gift',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" text,
	"username" text,
	"balance" numeric(18, 10) DEFAULT '0.0000000000',
	"level" integer DEFAULT 1,
	"referral_code" text,
	"referrer_id" integer,
	"referral_reward_claimed" boolean DEFAULT false,
	"last_jump_time" timestamp,
	"last_daily_bonus" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(18, 10) NOT NULL,
	"wallet_address" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
