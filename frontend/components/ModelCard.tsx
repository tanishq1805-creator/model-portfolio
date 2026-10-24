"use client";

import React from "react";
import Link from "next/link";
import { VerifiedBadge, AvailabilityBadge, CategoryPill } from "./ui/Badge";
import { ArrowUpRight, MapPin, Ruler, Sparkles } from "lucide-react";

export interface ModelCardProps {
  id: number;
  username: string;
  full_name: string;
  profile_photo?: string | null;
  location?: string | null;
  city?: string | null;
  model_type?: string | null;
  height_feet_inches?: string | null;
  height_cm?: number | null;
  experience_level?: string | null;
  availability_status?: string | null;
  agency_status?: string | null;
  agency_name?: string | null;
  is_identity_verified?: boolean;
  match_score?: number;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  username,
  full_name,
  profile_photo,
  location,
  city,
  model_type,
  height_feet_inches,
  height_cm,
  experience_level,
  availability_status = "available",
  agency_name,
  is_identity_verified = true,
  match_score,
}) => {
  const fallbackImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  const displayImage = profile_photo || fallbackImg;
  const categories = model_type ? model_type.split(",").map((s) => s.trim()).slice(0, 2) : ["Fashion"];

  return (
    <div className="group relative bg-neutral-950 border border-neutral-900 overflow-hidden transition-all duration-500 hover:border-neutral-600 flex flex-col justify-between">
      {/* Visual Image Treatment */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
        <img
          src={displayImage}
          alt={full_name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[15%] group-hover:grayscale-0"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <AvailabilityBadge status={availability_status || "available"} />
            {is_identity_verified && <VerifiedBadge />}
          </div>
          {match_score && (
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-[#d4af37] text-black">
              {match_score}% MATCH
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <Link
            href={`/models/${username}`}
            className="w-full py-2.5 bg-white text-black text-center text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 shadow-xl"
          >
            <span>View Full Roster Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metadata Bottom Section */}
      <div className="p-4 space-y-3 bg-neutral-950">
        <div>
          <div className="flex items-center justify-between">
            <Link
              href={`/models/${username}`}
              className="text-base font-serif tracking-wide text-white group-hover:text-neutral-200 transition-colors"
            >
              {full_name}
            </Link>
            <span className="text-[11px] text-neutral-500 font-mono">@{username}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-500" />
              {city || location || "International"}
            </span>
            {(height_feet_inches || height_cm) && (
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Ruler className="w-3 h-3 text-neutral-500" />
                {height_feet_inches || `${height_cm} cm`}
              </span>
            )}
          </div>
        </div>

        {/* Categories & Experience */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-900/80">
          {categories.map((c) => (
            <CategoryPill key={c}>{c}</CategoryPill>
          ))}
          {experience_level && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 ml-auto">
              {experience_level}
            </span>
          )}
        </div>

        {/* Representation */}
        {agency_name ? (
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono truncate">
            Rep: <span className="text-neutral-300">{agency_name}</span>
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
            Independent Talent
          </div>
        )}
      </div>
    </div>
  );
};
