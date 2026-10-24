"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-neutral-900/80 border text-neutral-100 placeholder:text-neutral-600 px-4 py-3 text-sm transition-colors duration-200 focus:outline-none focus:border-white focus:bg-neutral-900 ${
            error ? "border-rose-500/80" : "border-neutral-800"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 tracking-wide">{error}</p>}
        {helper && !error && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
