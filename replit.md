# Ton Frog Jump - Telegram Mini App

## Overview

A Telegram Mini App game where users tap a frog character to earn TON cryptocurrency. The app features tap-to-earn gameplay with session-based mechanics, a tasks system for earning rewards, referral bonuses, and wallet functionality for withdrawals. Built as a full-stack TypeScript application with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with custom dark theme ("Dark Cave" aesthetic)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: Framer Motion for game animations and UI transitions
- **Telegram Integration**: Uses Telegram WebApp SDK for user authentication and native app feel

### Backend Architecture
- **Framework**: Express.js (v5) with TypeScript
- **Bot Integration**: Telegraf library for Telegram bot functionality
- **API Pattern**: REST API with typed routes using Zod validation
- **Build System**: Custom build script using tsx for development, compiled to CommonJS for production

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, withdrawals, tasks, completedTasks, botSettings
- **Migrations**: Drizzle Kit for schema management (`db:push` command)

### Authentication
- **Method**: Telegram WebApp authentication via `x-telegram-id` header
- **Session**: User's Telegram ID stored in localStorage for API requests
- **No traditional sessions**: Stateless authentication using Telegram identity

### Key Design Patterns
- **Shared Code**: Common types and schemas in `shared/` directory accessible by both client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **API Type Safety**: Routes defined with Zod schemas in `shared/routes.ts`
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` for database operations

### Game Mechanics
- Session-based tapping with configurable taps per session and cooldown
- Admin-configurable rewards for sessions, referrals, and daily bonuses
- Hidden admin panel (9 taps on top-left corner, PIN: 9999) for full bot control

## External Dependencies

### Telegram Integration
- **Telegram WebApp SDK**: Loaded via CDN in index.html for native mini app features
- **Telegraf Bot**: Server-side bot for `/start` command and referral link handling
- **Environment Variable**: `BOT_TOKEN` required for bot functionality

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Ad Integration
- **Monetag**: Placeholder integration in index.html (requires `YOUR_MONETAG_ID` replacement)

### External Deployment
- **Render**: Bot configured to use `https://ton-frog-jump.onrender.com` as WebApp URL

### Key NPM Dependencies
- `drizzle-orm` / `drizzle-zod`: Database ORM and validation
- `@tanstack/react-query`: Server state management
- `telegraf`: Telegram bot framework
- `framer-motion`: Animations
- `zod`: Runtime type validation
- Radix UI components: Accessible UI primitives