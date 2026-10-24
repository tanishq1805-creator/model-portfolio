"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, DollarSign, Users, Briefcase, ChevronRight,
  Search, Filter, Star, Clock, CheckCircle, Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/api";

const CATEGORIES = ["All", "Editorial", "Runway", "Commercial", "Beauty", "Fitness", "Lifestyle", "Jewellery", "Promotional"];
const COMPENSATION_TYPES = ["All", "paid", "tfcd", "negotiable"];

function CastingCard({ casting, index }: { casting: any; index: number }) {
  const categoryColors: Record<string, string> = {
    Editorial: "bg-purple-900/40 text-purple-300 border-purple-700/50",
    Runway: "bg-amber-900/40 text-amber-300 border-amber-700/50",
    Commercial: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    Beauty: "bg-pink-900/40 text-pink-300 border-pink-700/50",
    Fitness: "bg-green-900/40 text-green-300 border-green-700/50",
    Lifestyle: "bg-teal-900/40 text-teal-300 border-teal-700/50",
    Jewellery: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  };
  const catClass = categoryColors[casting.category] || "bg-zinc-800/60 text-zinc-300 border-zinc-700/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-[#d4af37]/40 hover:bg-zinc-900/90 transition-all duration-300"
    >
      {casting.is_featured && (
        <div className="flex items-center gap-1.5 mb-3">
          <Star size={12} className="text-[#d4af37]" fill="currentColor" />
          <span className="text-[10px] font-semibold tracking-widest text-[#d4af37] uppercase">Featured</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-2">
            {casting.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-1 font-medium">{casting.brand_name}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${catClass}`}>
          {casting.category}
        </span>
      </div>

      <p className="text-zinc-500 text-sm line-clamp-2 mb-5">{casting.description}</p>

      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <MapPin size={13} className="text-[#d4af37]" />
          <span className="truncate">{casting.location}</span>
        </div>
        {casting.shoot_date && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar size={13} className="text-[#d4af37]" />
            <span className="truncate">{casting.shoot_date}</span>
          </div>
        )}
        {casting.compensation && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <DollarSign size={13} className="text-[#d4af37]" />
            <span className="truncate">{casting.compensation}</span>
          </div>
        )}
        {casting.experience_level && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Briefcase size={13} className="text-[#d4af37]" />
            <span>{casting.experience_level}</span>
          </div>
        )}
        {casting.application_deadline && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 col-span-2">
            <Clock size={13} className="text-red-400" />
            <span>Deadline: {casting.application_deadline}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Users size={12} />
          <span>{casting.applications_count || 0} applied</span>
        </div>
        <Link
          href={`/castings/${casting.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-[#d4af37] hover:text-amber-300 transition-colors"
        >
          View Details <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

export default function CastingsPage() {
  const [castings, setCastings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [compensation, setCompensation] = useState("All");
  const [page, setPage] = useState(1);
  const user = getStoredUser();

  const perPage = 12;

  useEffect(() => {
    fetchCastings();
  }, [category, compensation, page]);

  async function fetchCastings() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: perPage, status: "active" };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (compensation !== "All") params.compensation_type = compensation;
      const data = await api.castings.list(params);
      setCastings(data.castings || []);
      setTotal(data.total || 0);
    } catch {
      setCastings([]);
    } finally {
      setLoading(false);
    }
  }

  const canPost = user && ["BRAND", "AGENCY", "CASTING_DIRECTOR"].includes(user.role);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/80 bg-black/95 backdrop-blur-xl sticky top-[68px] z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Casting Marketplace</h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                {loading ? "Loading..." : `${total.toLocaleString()} opportunities available`}
              </p>
            </div>
            {canPost && (
              <Link
                href="/castings/create"
                className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold text-sm rounded-xl hover:bg-amber-400 transition-colors"
              >
                + Post a Casting
              </Link>
            )}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search castings, brands, campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCastings()}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={compensation}
              onChange={(e) => { setCompensation(e.target.value); setPage(1); }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60"
            >
              {COMPENSATION_TYPES.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Pay Types" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                category === cat
                  ? "bg-[#d4af37] text-black border-[#d4af37]"
                  : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 bg-zinc-900/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : castings.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase size={40} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-zinc-400 text-lg font-semibold">No castings found</h3>
            <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {castings.map((c, i) => <CastingCard key={c.id} casting={c} index={i} />)}
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500 transition-colors"
                >
                  Previous
                </button>
                <span className="px-5 py-2 text-sm text-zinc-400">
                  Page {page} of {Math.ceil(total / perPage)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / perPage)}
                  className="px-5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
