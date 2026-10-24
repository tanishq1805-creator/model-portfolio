import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeverity(severity: string) {
  switch (severity.toLowerCase()) {
    case "severe":
      return {
        label: "SEVERE",
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/30",
        badge: "bg-red-600 text-white",
        dot: "bg-red-500 shadow-red-500/50"
      };
    case "high":
      return {
        label: "HIGH",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        badge: "bg-amber-600 text-white",
        dot: "bg-amber-500 shadow-amber-500/50"
      };
    case "moderate":
      return {
        label: "MODERATE",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/30",
        badge: "bg-yellow-600 text-black",
        dot: "bg-yellow-500 shadow-yellow-500/50"
      };
    default:
      return {
        label: "LOW / NORMAL",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        badge: "bg-emerald-600 text-white",
        dot: "bg-emerald-500 shadow-emerald-500/50"
      };
  }
}
