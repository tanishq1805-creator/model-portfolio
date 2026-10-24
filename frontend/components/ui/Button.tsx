"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-wider uppercase text-xs";

  const sizeStyles = {
    sm: "px-4 py-2 text-[11px] rounded-none",
    md: "px-6 py-3 text-xs rounded-none",
    lg: "px-8 py-4 text-sm rounded-none",
  };

  const variantStyles = {
    primary:
      "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 border border-white font-semibold",
    secondary:
      "bg-neutral-900 text-neutral-100 hover:bg-neutral-800 border border-neutral-800",
    outline:
      "bg-transparent text-white border border-neutral-700 hover:border-white hover:bg-white/5",
    ghost:
      "bg-transparent text-neutral-300 hover:text-white hover:bg-neutral-900/60 border border-transparent",
    gold:
      "bg-[#d4af37] text-black hover:bg-[#c39e2e] border border-[#d4af37] font-semibold",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
