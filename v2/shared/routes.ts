import { z } from 'zod';
import { insertUserSchema, insertWithdrawalSchema, users, withdrawals } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    login: { // Simulation for TG login
      method: 'POST' as const,
      path: '/api/users/login',
      input: z.object({
        telegramId: z.string(),
        username: z.string().optional(),
        referralCode: z.string().optional(), // If they came via referral
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        201: z.custom<typeof users.$inferSelect>(),
      },
    },
    jump: {
      method: 'POST' as const,
      path: '/api/users/jump',
      input: z.object({}), // Just a trigger
      responses: {
        200: z.object({
          balance: z.string(),
          earned: z.string(),
        }),
      },
    },
    getReferrals: {
      method: 'GET' as const,
      path: '/api/users/referrals',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
  },
  withdrawals: {
    create: {
      method: 'POST' as const,
      path: '/api/withdrawals',
      input: insertWithdrawalSchema,
      responses: {
        201: z.custom<typeof withdrawals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/withdrawals',
      responses: {
        200: z.array(z.custom<typeof withdrawals.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
