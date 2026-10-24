"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Globe, Mail, Phone, Users, CheckCircle, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgencies();
  }, []);

  async function loadAgencies() {
    setLoading(true);
    try {
      const data = await api.agencies.list();
      setAgencies(Array.isArray(data) ? data : []);
    } catch {
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#d4af37] font-mono">
            Verified Representation Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-white font-light">
            Global Talent <span className="text-[#d4af37] font-normal italic">Agencies</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Leading fashion agencies and talent management firms representing verified runway, editorial, and commercial models worldwide.
          </p>
        </div>

        {/* Agency Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-8">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white">No agencies listed yet</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Verified model agencies will be showcased here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agencies.map((agency, i) => (
              <motion.div
                key={agency.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group bg-zinc-950 border border-zinc-800/90 hover:border-[#d4af37]/60 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors">
                          {agency.name}
                        </h2>
                        {agency.is_verified && (
                          <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{agency.headquarters}</p>
                    </div>

                    <div className="bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                      <Users className="w-3 h-3 text-[#d4af37]" />
                      <span>{agency.roster_count || 0} Models</span>
                    </div>
                  </div>

                  {agency.tagline && (
                    <p className="text-xs text-amber-200/80 italic font-serif">
                      "{agency.tagline}"
                    </p>
                  )}

                  {agency.bio && (
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {agency.bio}
                    </p>
                  )}

                  {agency.global_locations && (
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-2 border-t border-zinc-900">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="truncate">{agency.global_locations}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
                  {agency.website ? (
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  ) : <span />}

                  <Link
                    href={`/agencies/${agency.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#d4af37] group-hover:translate-x-0.5 transition-transform"
                  >
                    View Roster <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
