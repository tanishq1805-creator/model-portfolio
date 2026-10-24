"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Ruler, Star, CheckCircle, Zap, X, Filter } from "lucide-react";
import { api, getMediaUrl } from "@/lib/api";
import Link from "next/link";

const MODEL_TYPES = ["Fashion", "Runway", "Commercial", "Editorial", "Beauty", "Fitness", "Lifestyle", "Jewellery", "Promotional", "Fitness"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Professional", "Expert"];
const AVAILABILITY_OPTIONS = [
  { value: "", label: "Any" },
  { value: "available", label: "Available Now" },
  { value: "partially_available", label: "Partially Available" },
];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Paris", "Milan", "London", "New York"];

function MatchBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-zinc-500";
  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
      <Zap size={11} />
      {score}% {label}
    </div>
  );
}

function ModelCard({ model, index, aiActive }: { model: any; index: number; aiActive: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="group bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#d4af37]/40 transition-all duration-300"
    >
      {/* Portfolio preview */}
      <div className="relative h-56 bg-zinc-800 overflow-hidden">
        {model.portfolio_preview?.[0]?.url ? (
          <img
            src={getMediaUrl(model.portfolio_preview[0].url)}
            alt={model.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <img
            src={getMediaUrl(model.profile_photo)}
            alt={model.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* AI Match */}
        {aiActive && model.match_score !== undefined && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full">
            <MatchBadge score={model.match_score} label={model.match_label || "Match"} />
          </div>
        )}
        {/* Availability */}
        <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${
          model.availability_status === "available" ? "bg-green-500" :
          model.availability_status === "partially_available" ? "bg-amber-500" : "bg-red-500"
        }`} />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-semibold text-base leading-snug">{model.full_name}</h3>
              {model.is_identity_verified && <CheckCircle size={13} className="text-[#d4af37]" />}
            </div>
            <p className="text-zinc-500 text-xs">@{model.username}</p>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <MapPin size={11} />
            <span className="text-xs">{model.city || model.location || "—"}</span>
          </div>
        </div>

        {model.model_type && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {model.model_type.split(",").slice(0, 3).map((t: string) => (
              <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[10px] border border-zinc-700">
                {t.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-3">
          <div className="flex items-center gap-3">
            {model.height_cm && (
              <span className="flex items-center gap-1"><Ruler size={11} /> {model.height_cm}cm</span>
            )}
            {model.experience_level && <span>{model.experience_level}</span>}
          </div>
          {model.agency_name && (
            <span className="text-[#d4af37] text-[10px] font-medium truncate max-w-[100px]">{model.agency_name}</span>
          )}
        </div>

        <Link
          href={`/models/${model.username}`}
          className="mt-3 block w-full py-2 text-center text-sm font-semibold text-black bg-[#d4af37] rounded-xl hover:bg-amber-400 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [aiActive, setAiActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [filters, setFilters] = useState({
    search: "",
    model_type: "",
    location: "",
    gender: "",
    min_height_cm: "",
    max_height_cm: "",
    experience_level: "",
    availability: "",
    verified_only: false,
    has_agency: "",
    // AI matching
    match_category: "",
    match_location: "",
    match_experience: "",
    match_gender: "",
  });

  function setFilter(key: string, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  useEffect(() => {
    search();
  }, [page, filters.verified_only, filters.model_type, filters.experience_level, filters.availability]);

  async function search() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: perPage };
      if (filters.search) params.search = filters.search;
      if (filters.model_type) params.model_type = filters.model_type;
      if (filters.location) params.location = filters.location;
      if (filters.gender) params.gender = filters.gender;
      if (filters.min_height_cm) params.min_height_cm = filters.min_height_cm;
      if (filters.max_height_cm) params.max_height_cm = filters.max_height_cm;
      if (filters.experience_level) params.experience_level = filters.experience_level;
      if (filters.availability) params.availability = filters.availability;
      if (filters.verified_only) params.verified_only = true;
      if (filters.has_agency === "yes") params.has_agency = true;
      if (filters.has_agency === "no") params.has_agency = false;
      // AI matching
      if (filters.match_category) params.match_category = filters.match_category;
      if (filters.match_location) params.match_location = filters.match_location;
      if (filters.match_experience) params.match_experience = filters.match_experience;
      if (filters.match_gender) params.match_gender = filters.match_gender;

      const data = await api.discover.search(params);
      setModels(data.models || []);
      setTotal(data.total || 0);
      setAiActive(data.ai_matching_active || false);
    } catch {
      setModels([]);
    } finally {
      setLoading(false);
    }
  }

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    v !== "" && v !== false && !["search"].includes(k)
  ).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/80 bg-black/95 backdrop-blur-xl sticky top-[68px] z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Discover Models</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {loading ? "Searching..." : `${total.toLocaleString()} models found`}
                {aiActive && <span className="ml-2 text-[#d4af37] font-semibold">· AI Match Active</span>}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                showFilters ? "bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]" : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters {activeFilterCount > 0 && <span className="bg-[#d4af37] text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, skills, location..."
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <button onClick={search} className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold text-sm rounded-xl hover:bg-amber-400 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-72 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Filters</h3>
                    <button onClick={() => setFilters({ search: "", model_type: "", location: "", gender: "", min_height_cm: "", max_height_cm: "", experience_level: "", availability: "", verified_only: false, has_agency: "", match_category: "", match_location: "", match_experience: "", match_gender: "" })} className="text-xs text-zinc-500 hover:text-zinc-300">
                      Clear all
                    </button>
                  </div>

                  {/* Model Type */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Model Type</label>
                    <select value={filters.model_type} onChange={(e) => setFilter("model_type", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60">
                      <option value="">Any Type</option>
                      {MODEL_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Location</label>
                    <input value={filters.location} onChange={(e) => setFilter("location", e.target.value)}
                      placeholder="City or country"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#d4af37]/60" />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {CITIES.slice(0, 6).map((c) => (
                        <button key={c} onClick={() => setFilter("location", c)}
                          className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                            filters.location === c ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/50" : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                          }`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Gender</label>
                    <select value={filters.gender} onChange={(e) => setFilter("gender", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60">
                      <option value="">Any</option>
                      {["Female", "Male", "Non-binary"].map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Height (cm)</label>
                    <div className="flex gap-2">
                      <input type="number" value={filters.min_height_cm} onChange={(e) => setFilter("min_height_cm", e.target.value)}
                        placeholder="Min" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60" />
                      <input type="number" value={filters.max_height_cm} onChange={(e) => setFilter("max_height_cm", e.target.value)}
                        placeholder="Max" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60" />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Experience</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {EXPERIENCE_LEVELS.map((l) => (
                        <button key={l} onClick={() => setFilter("experience_level", filters.experience_level === l ? "" : l)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                            filters.experience_level === l ? "bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Availability</label>
                    <div className="space-y-1.5">
                      {AVAILABILITY_OPTIONS.map(({ value, label }) => (
                        <button key={value} onClick={() => setFilter("availability", value)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-colors ${
                            filters.availability === value ? "bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                          }`}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Verified only */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={filters.verified_only} onChange={(e) => setFilter("verified_only", e.target.checked)}
                      className="w-4 h-4 rounded accent-[#d4af37]" />
                    <span className="text-sm text-zinc-300 flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-[#d4af37]" /> Verified Only
                    </span>
                  </label>

                  {/* Agency */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">Agency</label>
                    <select value={filters.has_agency} onChange={(e) => setFilter("has_agency", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60">
                      <option value="">Any</option>
                      <option value="yes">Agency Represented</option>
                      <option value="no">Independent</option>
                    </select>
                  </div>

                  {/* AI Match */}
                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={14} className="text-[#d4af37]" />
                      <h4 className="text-sm font-semibold text-white">AI Campaign Matching</h4>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">Define your campaign requirements to see AI match scores.</p>
                    <div className="space-y-2">
                      <select value={filters.match_category} onChange={(e) => setFilter("match_category", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60">
                        <option value="">Campaign Category</option>
                        {MODEL_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input value={filters.match_location} onChange={(e) => setFilter("match_location", e.target.value)}
                        placeholder="Shoot location" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60" />
                      <select value={filters.match_experience} onChange={(e) => setFilter("match_experience", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/60">
                        <option value="">Any experience</option>
                        {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <button onClick={search}
                    className="w-full py-3 bg-[#d4af37] text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm">
                    Apply Filters
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Category quick filters */}
            <div className="flex gap-2 flex-wrap mb-6">
              {MODEL_TYPES.map((t) => (
                <button key={t} onClick={() => setFilter("model_type", filters.model_type === t ? "" : t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    filters.model_type === t ? "bg-[#d4af37] text-black border-[#d4af37]" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                  }`}>{t}</button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-zinc-900/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-24">
                <Search size={40} className="text-zinc-700 mx-auto mb-4" />
                <h3 className="text-zinc-400 text-lg font-semibold">No models found</h3>
                <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {models.map((m, i) => (
                    <ModelCard key={m.username} model={m} index={i} aiActive={aiActive} />
                  ))}
                </div>

                {total > perPage && (
                  <div className="flex justify-center gap-3 mt-10">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500 transition-colors">
                      Previous
                    </button>
                    <span className="px-5 py-2 text-sm text-zinc-400">Page {page} of {Math.ceil(total / perPage)}</span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / perPage)}
                      className="px-5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500 transition-colors">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
