"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Camera,
  Layers,
  Search,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ChevronRight,
  Check,
} from "lucide-react";
import { ModelCard, ModelCardProps } from "@/components/ModelCard";
import { ModelCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { VerifiedBadge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

const PORTFOLIO_SAMPLES = [
  {
    category: "Editorial",
    title: "Vogue Italia Monolith",
    model: "Elena Rostova",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    category: "Runway",
    title: "Milan Fashion Week SS26",
    model: "Elena Rostova",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1",
  },
  {
    category: "Commercial",
    title: "Sartorial Precision Suit",
    model: "Aarav Mehta",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1",
  },
  {
    category: "Jewellery",
    title: "Royal Heritage Solitaires",
    model: "Zara Al-Mansoor",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1",
  },
  {
    category: "Beauty",
    title: "L'Étoile Pure Radiance",
    model: "Sofia Castillo",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1 md:col-span-2",
  },
  {
    category: "Fitness",
    title: "Kinetic Motion Series",
    model: "Sofia Castillo",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    span: "col-span-1",
  },
];

const CASTING_PREVIEWS = [
  {
    brand: "Maison De L'Ombre",
    campaign: "Autumn Haute Couture Lookbook",
    location: "Paris / Milan",
    category: "Runway / High Fashion",
    date: "Nov 14 - 18, 2026",
    compensation: "€4,200 / Day",
    deadline: "Nov 2, 2026",
    requirements: "Height 5'10\"+, High Fashion Runway Experience, Verified Measurements",
    applicantsCount: 28,
  },
  {
    brand: "Verve Fine Jewellery",
    campaign: "Celestial Diamond High-Jewellery Campaign",
    location: "Mumbai",
    category: "Jewellery / Editorial",
    date: "Dec 5 - 7, 2026",
    compensation: "₹3,50,000 Total",
    deadline: "Nov 15, 2026",
    requirements: "Macro beauty experience, pristine collar & hands, age 20-30",
    applicantsCount: 42,
  },
  {
    brand: "Kinetic Activewear",
    campaign: "Apex Motion Global Print & Video",
    location: "London",
    category: "Commercial / Fitness",
    date: "Dec 12 - 16, 2026",
    compensation: "£2,800 / Day",
    deadline: "Nov 20, 2026",
    requirements: "Athletic agility, verified fitness portfolio, full video casting reel",
    applicantsCount: 35,
  },
];

export default function LandingPage() {
  const [models, setModels] = useState<ModelCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activePortfolioTab, setActivePortfolioTab] = useState("ALL");

  useEffect(() => {
    async function loadModels() {
      try {
        setIsLoading(true);
        const data = await api.models.list({ limit: 8 });
        if (data && data.length > 0) {
          setModels(data);
        }
      } catch (err) {
        console.error("Failed to fetch models from API:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadModels();
  }, []);

  const categories = ["ALL", "EDITORIAL", "RUNWAY", "COMMERCIAL", "BEAUTY", "JEWELLERY"];

  const filteredModels = models.filter((m) => {
    if (activeCategory === "ALL") return true;
    return m.model_type?.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const portfolioTabs = [
    "ALL",
    "EDITORIAL",
    "RUNWAY",
    "COMMERCIAL",
    "BEAUTY",
    "FITNESS",
    "JEWELLERY",
  ];

  const filteredPortfolio = PORTFOLIO_SAMPLES.filter((p) => {
    if (activePortfolioTab === "ALL") return true;
    return p.category.toLowerCase() === activePortfolioTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#d4af37] selection:text-black">
      {/* SECTION 1 — CINEMATIC HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-neutral-900 pt-24 sm:pt-28">
        {/* Editorial Background Image with Cinematic Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85"
            alt="Editorial High Fashion Runway"
            className="w-full h-full object-cover object-center filter grayscale-[40%] contrast-125 opacity-35 scale-105 transition-transform duration-[12000ms] hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-16">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-950/80 border border-neutral-800 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Premier Model Network & Discovery Ecosystem</span>
          </div>

          {/* Large Editorial Headline */}
          <div className="space-y-1 sm:space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight font-normal leading-[1.05]">
              FIND TALENT.
            </h1>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight font-normal leading-[1.05] text-neutral-300 italic">
              BUILD IDENTITY.
            </h1>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight font-bold leading-[1.05] text-white">
              CREATE IMPACT.
            </h1>
          </div>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-neutral-400 font-light tracking-wide leading-relaxed">
            The professional network built specifically for the modelling industry. One structured, verified digital identity where luxury brands, agencies, and casting directors discover, evaluate, and book exceptional talent.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#discover"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>Discover Models</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-neutral-700 text-white font-medium text-xs uppercase tracking-[0.2em] hover:border-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Your Profile</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Editorial Key Metric Highlights */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-neutral-900/80 text-left">
            <div>
              <div className="text-xl sm:text-2xl font-serif font-light text-white">100%</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Verified Profiles</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-light text-white">40+</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Global Markets</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-light text-white">96%</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Matching Precision</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-light text-white">Direct</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Casting & Booking</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DISCOVER TALENT */}
      <section id="discover" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              Curated Talent Roster
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white tracking-tight">
              The right talent is already here.
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl">
              Filter by dimensional requirements, runway experience, agency status, and current market availability.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1 border border-neutral-900">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all font-mono ${
                  activeCategory === cat
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredModels.map((model) => (
              <ModelCard key={model.id || model.username} {...model} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-neutral-900">
            <p className="text-neutral-500 font-serif text-lg">No talent found under this filter category.</p>
            <button
              onClick={() => setActiveCategory("ALL")}
              className="mt-4 text-xs uppercase tracking-widest text-white border-b border-white pb-1"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-white border border-neutral-700 px-8 py-3.5 hover:border-white hover:bg-neutral-900 transition-all"
          >
            <span>Explore Full 2026 Roster</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 3 — PROFESSIONAL IDENTITY */}
      <section id="identity" className="py-24 bg-neutral-950/60 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              The Single Source of Truth
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
              One profile. Everything a professional needs.
            </h2>
            <p className="text-sm text-neutral-400">
              No more fragmented Instagram linktrees, outdated PDF comp cards, or untracked DMs. CMID MODEL HOUSE structures model profiles into an actionable casting asset.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Identity Card 1: Structured Measurements */}
            <div className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                  01 / Dimensional Profile
                </span>
                <VerifiedBadge />
              </div>
              <h3 className="text-xl font-serif text-white">Verified Measurements with Privacy</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Precise bust, waist, hips, inseam, collar, and shoe dimensions. Models control access levels: Public, Verified Brands only, or Confidential.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">HEIGHT</span>
                  <span className="text-white font-medium">5&apos;10.5&quot; / 179 cm</span>
                </div>
                <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">BUST / CHEST</span>
                  <span className="text-white font-medium">33.0 in</span>
                </div>
                <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">WAIST</span>
                  <span className="text-white font-medium">24.0 in</span>
                </div>
                <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">HIPS</span>
                  <span className="text-white font-medium">35.0 in</span>
                </div>
              </div>
            </div>

            {/* Identity Card 2: Runway & Campaign Timeline */}
            <div className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                  02 / Career Trajectory
                </span>
                <span className="text-[10px] font-mono text-emerald-400">TIMELINE</span>
              </div>
              <h3 className="text-xl font-serif text-white">Runway & Editorial Timeline</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Chronological proof of work with verified brand tags, fashion week seasons, and official campaign credits.
              </p>
              <div className="space-y-4 pt-2">
                <div className="border-l-2 border-[#d4af37] pl-3 py-0.5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Chanel Haute Couture</span>
                    <span className="font-mono text-neutral-500 text-[10px]">2026</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Lead Runway Model • Grand Palais, Paris</p>
                </div>
                <div className="border-l-2 border-neutral-800 pl-3 py-0.5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Saint Laurent Global</span>
                    <span className="font-mono text-neutral-500 text-[10px]">2025</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Summer Campaign Face • Marrakech</p>
                </div>
              </div>
            </div>

            {/* Identity Card 3: Agency & Direct Bookings */}
            <div className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                  03 / Industry Representation
                </span>
                <span className="text-[10px] font-mono text-[#d4af37]">VERIFIED REP</span>
              </div>
              <h3 className="text-xl font-serif text-white">Agency & Booking Governance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Clear representation statuses. Bookings can route through mother agencies or directly for independent talent with contract transparency.
              </p>
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                  <span className="text-neutral-400">Representation</span>
                  <span className="text-white font-mono">Elite Paris Roster</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                  <span className="text-neutral-400">Current Status</span>
                  <span className="text-emerald-400 font-mono">🟢 Available</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400">Primary Markets</span>
                  <span className="text-white font-mono">Paris • Milan • NYC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — PORTFOLIO MASONRY GALLERY */}
      <section id="portfolio" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              Editorial Curation
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
              Editorial Portfolio Gallery
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl">
              High-resolution tear sheets, runway captures, macro jewellery features, and beauty stills categorized with production credits.
            </p>
          </div>

          {/* Portfolio Tab Selectors */}
          <div className="flex flex-wrap gap-2">
            {portfolioTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePortfolioTab(tab)}
                className={`text-[10px] sm:text-xs uppercase font-mono tracking-widest px-3 py-1.5 border transition-all ${
                  activePortfolioTab === tab
                    ? "border-white bg-white text-black font-semibold"
                    : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPortfolio.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-neutral-950 border border-neutral-900 overflow-hidden aspect-[4/5]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                  {item.category}
                </span>
                <h4 className="text-lg font-serif text-white">{item.title}</h4>
                <p className="text-xs text-neutral-400">Featuring {item.model}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — CASTING MARKETPLACE */}
      <section id="castings" className="py-24 bg-neutral-950/70 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
                Live Opportunities
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
                Your next opportunity starts here.
              </h2>
              <p className="text-sm text-neutral-400 max-w-xl">
                Casting directors and fashion houses publish verified calls with guaranteed budgets, transparent criteria, and direct shortlist workflows.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-black bg-white px-6 py-3 hover:bg-neutral-200 transition-colors"
            >
              <span>Explore All Castings</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CASTING_PREVIEWS.map((c, i) => (
              <div
                key={i}
                className="bg-neutral-950 border border-neutral-800 p-6 space-y-5 flex flex-col justify-between hover:border-neutral-600 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#d4af37] uppercase tracking-wider">{c.brand}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{c.compensation}</span>
                  </div>

                  <h3 className="text-xl font-serif text-white">{c.campaign}</h3>

                  <div className="space-y-2 text-xs text-neutral-400 pt-2 border-t border-neutral-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{c.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{c.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Deadline: {c.deadline}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 line-clamp-2 pt-2">
                    {c.requirements}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {c.applicantsCount} Applicants
                  </span>
                  <Link
                    href="/register"
                    className="text-xs uppercase tracking-widest text-white hover:text-[#d4af37] font-semibold flex items-center gap-1"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — SMART MATCHING */}
      <section id="matching" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              Explainable AI Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white leading-tight">
              Find models that match your campaign requirements in seconds.
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Never browse hundreds of irrelevant submissions again. Our AI engine computes match percentages based on exact requirements, dimensional criteria, previous campaign tear-sheets, and schedule availability.
            </p>

            <div className="p-6 bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                  Campaign Query
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-900 text-neutral-400">
                  Target: Paris FW 2026
                </span>
              </div>
              <p className="text-sm italic font-serif text-neutral-200">
                &quot;Seeking high-fashion editorial female model, Paris-based, 5&apos;10&quot;+, with runway credentials and immediately available for Haute Couture week.&quot;
              </p>
            </div>
          </div>

          {/* Explainable AI Result Card */}
          <div className="bg-neutral-950 border border-neutral-800 p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-900">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                  Top Recommended Candidate
                </span>
                <h4 className="text-2xl font-serif text-white">Elena Rostova</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-serif font-bold text-[#d4af37]">96%</div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  Match Score
                </span>
              </div>
            </div>

            {/* Explainable Reasons List */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block">
                Why this model matches:
              </span>

              <div className="space-y-2 font-mono text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Location match: Paris / Milan primary residence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Height requirement satisfied: 5&apos;10.5&quot; (179 cm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-fashion specialization with Chanel runway credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Availability confirmed: 🟢 Available for Haute Couture dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified dimensional measurements on file</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-900 flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-neutral-500">
                AI Match Provider: Gemini / Rule Engine
              </span>
              <Link
                href="/models/elenarostova"
                className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-1 hover:underline"
              >
                <span>View Matched Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — TRUST & VERIFICATION */}
      <section id="verification" className="py-24 bg-neutral-950/80 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              Trust & Integrity
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
              Institutional Trust in Every Booking
            </h2>
            <p className="text-sm text-neutral-400">
              In an industry plagued by impersonation, catfish casting, and inaccurate measurements, CMID MODEL HOUSE introduces multi-tiered rigorous verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black border border-neutral-800 p-6 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-[#d4af37]" />
              <h3 className="text-base font-serif text-white">Identity Verified</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Government-issued ID verification and live biometric check to eliminate spoofing and fake representation.
              </p>
            </div>

            <div className="bg-black border border-neutral-800 p-6 space-y-3">
              <Camera className="w-6 h-6 text-[#d4af37]" />
              <h3 className="text-base font-serif text-white">Portfolio Verified</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Proof of authenticity for published editorial spreads, photographer tags, and tearsheets.
              </p>
            </div>

            <div className="bg-black border border-neutral-800 p-6 space-y-3">
              <Layers className="w-6 h-6 text-[#d4af37]" />
              <h3 className="text-base font-serif text-white">Measurements Verified</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Regularly updated dimensions with photo verification to prevent sizing discrepancies on set.
              </p>
            </div>

            <div className="bg-black border border-neutral-800 p-6 space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
              <h3 className="text-base font-serif text-white">Agency Verified</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mother agency validation confirming official representation, contract status, and authorized rep contacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CALL TO ACTION */}
      <section className="py-28 relative overflow-hidden text-center bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#d4af37]">
            Begin Your Career Evolution
          </span>

          <h2 className="text-4xl sm:text-6xl font-serif font-light text-white leading-tight">
            Your next opportunity could start with your profile.
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            Join thousands of professional models, luxury fashion houses, agencies, and casting directors shaping the future of fashion discovery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register?role=MODEL"
              className="w-full sm:w-auto px-10 py-4 bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-2xl"
            >
              Join as a Model
            </Link>
            <Link
              href="/register?role=BRAND"
              className="w-full sm:w-auto px-10 py-4 bg-transparent border border-neutral-700 text-white font-medium text-xs uppercase tracking-[0.2em] hover:border-white hover:bg-white/5 transition-all"
            >
              Hire Talent as Brand
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
