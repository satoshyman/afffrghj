import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type User } from "@shared/schema";

// Helper to get stored telegram ID
function getTelegramId(): string | null {
  return localStorage.getItem('telegramId');
}

// Get current user
export function useUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) return null;
      
      const res = await fetch(api.users.me.path, { 
        credentials: "include",
        headers: { "x-telegram-id": telegramId }
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.me.responses[200].parse(await res.json());
    },
    retry: false, 
  });
}

// Login simulation
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { telegramId: string; username?: string; referralCode?: string }) => {
      const res = await fetch(api.users.login.path, {
        method: api.users.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      // Store telegram ID for future requests
      localStorage.setItem('telegramId', data.telegramId);
      return user; 
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.users.me.path], data);
    },
  });
}

// The core game loop: JUMP!
export function useJump() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) throw new Error("Not authenticated");
      
      const res = await fetch(api.users.jump.path, {
        method: api.users.jump.method,
        headers: { 
          "Content-Type": "application/json",
          "x-telegram-id": telegramId
        },
        body: "{}",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Jump failed");
      return api.users.jump.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.users.me.path], (oldUser: User | undefined) => {
        if (!oldUser) return oldUser;
        return {
          ...oldUser,
          balance: data.balance,
        };
      });
    },
  });
}

// Get referrals
export function useReferrals() {
  return useQuery({
    queryKey: [api.users.getReferrals.path],
    queryFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) return [];
      
      const res = await fetch(api.users.getReferrals.path, { 
        credentials: "include",
        headers: { "x-telegram-id": telegramId }
      });
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return api.users.getReferrals.responses[200].parse(await res.json());
    },
  });
}
