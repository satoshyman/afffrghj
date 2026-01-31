import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User } from "@shared/schema";

function getTelegramId(): string | null {
  return localStorage.getItem('telegramId');
}

export function useTasks() {
  return useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) return { tasks: [], completedTasks: [] };
      
      const res = await fetch("/api/tasks", { 
        credentials: "include",
        headers: { "x-telegram-id": telegramId }
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const telegramId = getTelegramId();
      if (!telegramId) throw new Error("Not authenticated");
      
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-telegram-id": telegramId
        },
        body: JSON.stringify({ taskId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to complete task");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.setQueryData(["/api/users/me"], (oldUser: User | undefined) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, balance: data.balance };
      });
    },
  });
}

export function useDailyBonus() {
  return useQuery({
    queryKey: ["/api/daily-bonus/status"],
    queryFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) return { canClaim: false };
      
      const res = await fetch("/api/daily-bonus/status", { 
        credentials: "include",
        headers: { "x-telegram-id": telegramId }
      });
      if (!res.ok) throw new Error("Failed to fetch daily bonus status");
      return res.json();
    },
  });
}

export function useClaimDailyBonus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const telegramId = getTelegramId();
      if (!telegramId) throw new Error("Not authenticated");
      
      const res = await fetch("/api/daily-bonus/claim", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-telegram-id": telegramId
        },
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to claim daily bonus");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-bonus/status"] });
      queryClient.setQueryData(["/api/users/me"], (oldUser: User | undefined) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, balance: data.balance };
      });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { 
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });
}

export function useAdminTasks() {
  return useQuery({
    queryKey: ["/api/admin/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tasks", { 
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useAdminWithdrawals() {
  return useQuery({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: async () => {
      const res = await fetch("/api/admin/withdrawals", { 
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return res.json();
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (withdrawalId: number) => {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (withdrawalId: number) => {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
  });
}
