# Ton Frog Jump - Telegram Mini App

## Overview
A Telegram Mini App where users tap a frog to earn TON coins. Features include:
- Tap-to-earn gameplay with 100 taps per session
- Tasks system with 10-second verification
- Daily bonus rewards
- Referral system
- Wallet and withdrawals
- Hidden admin panel for full bot control

## Project Structure
```
Ton-Frog-Jump/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # App pages
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── db.ts           # Database connection
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Database schemas
│   └── routes.ts        # API route definitions
└── drizzle.config.ts    # Database config
```

## Features

### Tasks Page
- Channel joining tasks
- External link tasks with 10-second verification
- Daily bonus (0.00001 TON)
- All tasks reward 0.00001 TON

### Hidden Admin Panel
- Access: Tap 9 times on the top-left corner
- PIN: 9999
- Controls:
  - Session cooldown time
  - Taps per session
  - Session reward
  - Referral reward
  - Daily bonus reward
  - Minimum withdrawal
  - Task management (add/delete tasks)
  - Withdrawal management (approve/reject)
- Status Colors:
  - Yellow: Processing (pending)
  - Green: Paid (completed)
  - Red: Rejected

### Database Tables
- `users` - User accounts with balance
- `withdrawals` - Withdrawal requests
- `tasks` - Available tasks
- `completed_tasks` - User completed tasks
- `bot_settings` - Bot configuration

## Running the App
```bash
npm run dev    # Start development server
npm run db:push  # Push database schema
```

## Tech Stack
- Frontend: React, Vite, TailwindCSS, Framer Motion
- Backend: Express, TypeScript
- Database: PostgreSQL with Drizzle ORM
- UI: Shadcn/ui components

## Recent Changes
- Added tasks page with verification system
- Added hidden admin panel with PIN protection
- Added daily bonus system
- Improved frontend design with animations
- Added bot settings management
