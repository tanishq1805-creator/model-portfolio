"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverEffect = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`bg-neutral-950/70 border border-neutral-800/80 transition-all duration-300 ${
        hoverEffect ? "hover:border-neutral-600 hover:shadow-2xl hover:shadow-black/60" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
