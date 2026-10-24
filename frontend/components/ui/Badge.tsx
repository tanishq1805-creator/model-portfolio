"use client";

import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  type?: "identity" | "portfolio" | "measurements" | "agency" | "all";
  size?: "sm" | "md";
  showText?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = "all",
  size = "sm",
  showText = false,
}) => {
  const iconSizes = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <span
      title="Verified Professional Talent"
      className="inline-flex items-center gap-1 text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 border border-[#d4af37]/30 text-[10px] uppercase tracking-wider font-medium"
    >
      <CheckCircle2 className={`${iconSizes} text-[#d4af37]`} />
      {showText && <span>Verified</span>}
    </span>
  );
};

interface StatusBadgeProps {
  status: "available" | "partially_available" | "unavailable" | string;
}

export const AvailabilityBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status?.toLowerCase() || "available";

  if (normalized === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available
      </span>
    );
  }

  if (normalized === "partially_available") {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Limited
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
      Booked
    </span>
  );
};

export const CategoryPill: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1">
      {children}
    </span>
  );
};
