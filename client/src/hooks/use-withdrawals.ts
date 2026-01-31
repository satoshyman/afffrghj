import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertWithdrawal } from "@shared/schema";

function getTelegramId(): string | null {
  return localStorage.getItem('telegramId');
}

export function useWithdrawals() {
  return useQuery({
    queryKey: [api.withdrawals.list.path],
    queryFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) return [];
      
      const res = await fetch(api.withdrawals.list.path, { 
        credentials: "include",
        headers: { "x-telegram-id": telegramId }
      });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return api.withdrawals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      const telegramId = getTelegramId();
      if (!telegramId) throw new Error("Not authenticated");
      
      const res = await fetch(api.withdrawals.create.path, {
        method: api.withdrawals.create.method,
        headers: { 
          "Content-Type": "application/json",
          "x-telegram-id": telegramId
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.withdrawals.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create withdrawal");
      }
      return api.withdrawals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
  });
}
