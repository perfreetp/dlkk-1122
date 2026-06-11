import { create } from "zustand";
import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: ReactNode;
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (options: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: ({ type, title, message, duration = 3500 }) => {
    const id = `toast-${Date.now()}-${++counter}`;
    const toast: ToastItem = { id, type, title, message, duration };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (duration > 0) {
      setTimeout(() => {
        const exists = get().toasts.find((t) => t.id === id);
        if (exists) get().dismiss(id);
      }, duration);
    }
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function useToast() {
  return {
    success: (message: ReactNode, title?: string, duration?: number) =>
      useToastStore.getState().show({ type: "success", title, message, duration }),
    error: (message: ReactNode, title?: string, duration?: number) =>
      useToastStore.getState().show({ type: "error", title, message, duration }),
    warning: (message: ReactNode, title?: string, duration?: number) =>
      useToastStore.getState().show({ type: "warning", title, message, duration }),
    info: (message: ReactNode, title?: string, duration?: number) =>
      useToastStore.getState().show({ type: "info", title, message, duration }),
    dismiss: (id: string) => useToastStore.getState().dismiss(id),
    clear: () => useToastStore.getState().clear(),
  };
}

export default useToast;
