"use client";

import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-900 border border-neutral-800/40 ${className}`}
    />
  );
};

export const ModelCardSkeleton: React.FC = () => {
  return (
    <div className="border border-neutral-900 bg-neutral-950 p-3 space-y-3">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, description, actionText, onAction }) => {
  return (
    <div className="text-center py-16 px-4 border border-dashed border-neutral-800 bg-neutral-950/40">
      <h3 className="text-lg font-serif tracking-wide text-neutral-200 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="uppercase tracking-widest text-xs font-semibold text-white border border-white px-6 py-2.5 hover:bg-white hover:text-black transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
