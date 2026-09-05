import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
