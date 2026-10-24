"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Globe, Mail, Phone, Users, CheckCircle,
  ArrowLeft, ExternalLink, Ruler, Sparkles, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { api, getMediaUrl } from "@/lib/api";

export default function AgencyShowroomPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [agency, setAgency] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadAgency();
  }, [slug]);

  async function loadAgency() {
    setLoading(true);
    try {
      const data = await api.agencies.get(slug as string);
      setAgency(data);
    } catch {
      setAgency(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Building2 className="w-12 h-12 text-zinc-600" />
        <h2 className="text-xl font-bold text-white">Agency Not Found</h2>
        <p className="text-sm">The requested agency does not exist in the verified network.</p>
        <Link href="/agencies" className="text-[#d4af37] text-xs uppercase tracking-widest font-mono hover:underline">
          ← Back to Agency Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Back Link */}
        <Link
          href="/agencies"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Agency Directory
        </Link>

        {/* Agency Profile Header */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full">
                  Verified Representation
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> {agency.headquarters}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-white font-light">
                {agency.name}
              </h1>

              {agency.tagline && (
                <p className="text-lg text-amber-200/90 font-serif italic">
                  "{agency.tagline}"
                </p>
              )}

              {agency.bio && (
                <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  {agency.bio}
                </p>
              )}

              {agency.global_locations && (
                <p className="text-xs text-zinc-400 font-mono pt-2">
                  <span className="text-zinc-500 uppercase tracking-widest">Offices:</span> {agency.global_locations}
                </p>
              )}
            </div>

            {/* Quick Contact Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 min-w-[260px] shrink-0">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] pb-2 border-b border-zinc-800">
                Agency Booking Desk
              </h3>

              {agency.contact_email && (
                <a
                  href={`mailto:${agency.contact_email}`}
                  className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  {agency.contact_email}
                </a>
              )}

              {agency.phone && (
                <p className="flex items-center gap-2 text-xs text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  {agency.phone}
                </p>
              )}

              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#d4af37] hover:underline pt-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Official Website <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Represented Roster */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl font-serif text-white">Agency Roster</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {agency.roster?.length || 0} represented talent officially affiliated with {agency.name}
              </p>
            </div>
          </div>

          {(!agency.roster || agency.roster.length === 0) ? (
            <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-900 p-8">
              <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No models currently listed in this digital showroom.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {agency.roster.map((m: any) => (
                <motion.div
                  key={m.username}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#d4af37]/60 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                    <img
                      src={getMediaUrl(m.profile_photo)}
                      alt={m.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base drop-shadow-md">
                          {m.full_name}
                        </h3>
                        {m.is_identity_verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#d4af37]" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 font-mono">
                        {m.city ? `${m.city} · ` : ""}{m.height_cm ? `${m.height_cm}cm` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-zinc-950">
                    {m.model_type && (
                      <p className="text-xs text-zinc-400 line-clamp-1">{m.model_type}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                      <Link
                        href={`/models/${m.username}`}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
                      >
                        Profile <ChevronRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href={`/models/${m.username}/comp-card`}
                        className="text-[#d4af37] hover:underline font-mono text-[11px] uppercase tracking-wider"
                      >
                        Zed Card →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
