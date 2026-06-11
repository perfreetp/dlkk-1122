import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 365) return format(d, "M月d日", { locale: zhCN });
  return format(d, "yyyy年M月d日", { locale: zhCN });
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: zhCN,
  });
}

export function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "yyyy-MM-dd HH:mm", { locale: zhCN });
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "yyyy-MM-dd", { locale: zhCN });
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number) {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const n = name.trim();
  if (/[\u4e00-\u9fa5]/.test(n)) return n.slice(-2);
  return n
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1C1C1E" : "#FFFFFF";
}

export function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractFirstImage(md: string): string | null {
  const match = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

export function getOSVersionLabel(value?: string): string {
  const map: Record<string, string> = {
    "macos-15": "macOS 15 Sequoia",
    "macos-14": "macOS 14 Sonoma",
    "macos-13": "macOS 13 Ventura",
    "macos-12": "macOS 12 Monterey",
    "macos-11": "macOS 11 Big Sur",
  };
  return value ? map[value] || value : "";
}

export function getMacModelLabel(value?: string): string {
  const map: Record<string, string> = {
    "mbp-16-m3": 'MacBook Pro 16" M3 Max',
    "mbp-14-m3": 'MacBook Pro 14" M3 Pro',
    "mbp-14-m2": 'MacBook Pro 14" M2 Pro',
    "mba-15-m3": 'MacBook Air 15" M3',
    "mba-13-m3": 'MacBook Air 13" M3',
    "imac-24-m3": 'iMac 24" M3',
    "mac-mini-m2": "Mac Mini M2 Pro",
    "mac-studio-m2": "Mac Studio M2 Ultra",
    "mac-pro-m2": "Mac Pro M2 Ultra",
  };
  return value ? map[value] || value : "";
}
