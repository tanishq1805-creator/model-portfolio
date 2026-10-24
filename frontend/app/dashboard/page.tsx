"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Layers,
  MapPin,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { api, getStoredUser, setToken, setStoredUser } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [callSheets, setCallSheets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    loadAllDashboardData(u);
  }, []);

  const loadAllDashboardData = async (currentUser: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [cs, inv, bk] = await Promise.all([
        api.callSheets.listMy().catch(() => []),
        api.invoices.listMy().catch(() => []),
        api.bookings.listMy().catch(() => []),
      ]);
      setCallSheets(cs || []);
      setInvoices(inv || []);
      setBookings(bk || []);

      if (currentUser.role === "MODEL") {
        const [st, apps] = await Promise.all([
          api.analytics.modelStats().catch(() => null),
          api.castings.myApplications().catch(() => []),
        ]);
        setStats(st);
        setApplications(apps || []);
      } else {
        const st = await api.analytics.brandStats().catch(() => null);
        setStats(st);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Demo Switcher for Hackathon Judging
  const handleQuickDemoSwitch = async (email: string) => {
    setSwitching(true);
    try {
      const res = await api.auth.login({ email, password: "password123" });
      setUser(res.user);
      await loadAllDashboardData(res.user);
    } catch (e: any) {
      alert("Demo login switch failed: " + e.message);
    } finally {
      setSwitching(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400 gap-4 pt-20">
        <div className="p-8 border border-neutral-800 bg-neutral-950 text-center max-w-md">
          <Sparkles className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
          <h2 className="text-xl font-serif text-white mb-1">Access Executive Dashboard</h2>
          <p className="text-xs text-neutral-400 mb-6">Sign in or use a one-click judge demo role to evaluate CMID MODEL HOUSE.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickDemoSwitch("model@modelhub.com")}
              className="py-2.5 px-4 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#e5c158]"
            >
              Demo as Talent (Model)
            </button>
            <button
              onClick={() => handleQuickDemoSwitch("brand@modelhub.com")}
              className="py-2.5 px-4 bg-neutral-900 border border-neutral-700 text-white text-xs uppercase tracking-wider hover:border-[#d4af37]"
            >
              Demo as Brand / Production Client
            </button>
            <Link
              href="/login"
              className="text-xs text-neutral-500 hover:text-white mt-2 font-mono"
            >
              Regular Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isModel = user.role === "MODEL";
  const isBrand = user.role === "BRAND" || user.role === "CASTING_DIRECTOR";
  const isAgency = user.role === "AGENCY";
  const isAdmin = user.role === "ADMIN";

  // Financial aggregates
  const totalNetEarnings = invoices
    .filter((inv) => inv.payment_status === "paid")
    .reduce((acc, inv) => acc + (inv.net_talent_amount || 0), 0);

  const pendingEscrow = invoices
    .filter((inv) => inv.payment_status === "in_escrow")
    .reduce((acc, inv) => acc + (inv.total_amount || 0), 0);

  const nextShoot = callSheets[0];

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Quick Demo Switcher Banner */}
        <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase text-neutral-400">
              Active Session: <strong className="text-white">{user.email}</strong> ({user.role})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-neutral-500 hidden sm:inline">1-Click Demo Switcher:</span>
            {[
              { role: "Model", email: "model@modelhub.com" },
              { role: "Brand", email: "brand@modelhub.com" },
              { role: "Agency", email: "agency@modelhub.com" },
              { role: "Admin", email: "admin@modelhub.com" },
            ].map((d) => (
              <button
                key={d.role}
                disabled={switching || user.email === d.email}
                onClick={() => handleQuickDemoSwitch(d.email)}
                className={`px-2.5 py-1 uppercase tracking-wider text-[11px] transition-all ${
                  user.email === d.email
                    ? "bg-[#d4af37] text-black font-bold"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 6 Executive Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light">
              {isModel ? "Talent Career" : isAgency ? "Agency Roster" : "Production Management"}{" "}
              <span className="text-[#d4af37]">Dashboard</span>
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
              Unified intelligence across contracts, call sheet schedules, active date holds, and escrow financial payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isModel && user.username && (
              <Link
                href={`/models/${user.username}/comp-card`}
                className="px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-white font-mono text-xs uppercase tracking-wider hover:border-[#d4af37] transition-all inline-flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Export Comp Card</span>
              </Link>
            )}
            <Link
              href="/notifications"
              className="px-4 py-2.5 bg-[#d4af37] text-black font-semibold font-mono text-xs uppercase tracking-wider hover:bg-[#e5c158] transition-all inline-flex items-center gap-2"
            >
              <span>Notifications Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isModel ? (
            <>
              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Net Disbursed Earnings</span>
                <div className="text-2xl font-serif text-emerald-400 mt-1 font-semibold">
                  ₹{totalNetEarnings.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Direct wire payouts received</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Secured in Escrow</span>
                <div className="text-2xl font-serif text-amber-300 mt-1 font-semibold">
                  ₹{pendingEscrow.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Guaranteed client funds pending wrap</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Direct Contract Offers</span>
                <div className="text-2xl font-serif text-white mt-1 font-semibold">
                  {bookings.length} Bookings
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Commercial proposals & contracts</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Profile Strength</span>
                <div className="text-2xl font-serif text-[#d4af37] mt-1 font-semibold">
                  {stats?.completion_score || 94}%
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Identity & portfolio verification</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Production Commitments</span>
                <div className="text-2xl font-serif text-white mt-1 font-semibold">
                  {callSheets.length} Shoots
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Scheduled call sheets</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Direct Contract Proposals</span>
                <div className="text-2xl font-serif text-[#d4af37] mt-1 font-semibold">
                  {bookings.length} Active Offers
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Pending and accepted agreements</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Escrow Vault Volume</span>
                <div className="text-2xl font-serif text-amber-300 mt-1 font-semibold">
                  ₹{invoices.reduce((a, b) => a + (b.total_amount || 0), 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Total contract invoicing volume</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Platform Status</span>
                <div className="text-2xl font-serif text-emerald-400 mt-1 font-semibold">
                  Verified Partner
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Full casting & booking privileges</p>
              </div>
            </>
          )}
        </div>

        {/* Active Production Itinerary Banner */}
        {nextShoot && (
          <div className="bg-neutral-950 border border-[#d4af37]/40 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-[#d4af37] mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Next Upcoming Production Shoot</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-white">
                  {nextShoot.shoot_title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-2 font-mono">
                  <span>📅 {nextShoot.shoot_date}</span>
                  <span>⏰ Call: {nextShoot.talent_call_time}</span>
                  <span>📍 {nextShoot.shoot_location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/call-sheets"
                  className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold font-mono text-xs uppercase tracking-wider hover:bg-[#e5c158] transition-colors"
                >
                  Open Live Call Sheet
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dual Column Layout: Workflows & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Quick Workflows & Core Sections */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Operational Portals & Workflows
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/bookings"
                className="p-5 border border-neutral-800 bg-neutral-950 hover:border-[#d4af37] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-neutral-900 text-[#d4af37]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-white">
                    {bookings.length} Contracts →
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white group-hover:text-[#d4af37] transition-colors">
                  Direct Bookings
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Review commercial proposals, negotiate rates, and accept binding agreements.
                </p>
              </Link>

              <Link
                href="/calendar"
                className="p-5 border border-neutral-800 bg-neutral-950 hover:border-[#d4af37] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-neutral-900 text-[#d4af37]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-white">
                    Ledger →
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white group-hover:text-[#d4af37] transition-colors">
                  Availability Calendar
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Set 1st/2nd option pencil holds, blackout travel days, and live shooting dates.
                </p>
              </Link>

              <Link
                href="/finances"
                className="p-5 border border-neutral-800 bg-neutral-950 hover:border-[#d4af37] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-neutral-900 text-[#d4af37]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-white">
                    Escrow Splits →
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white group-hover:text-[#d4af37] transition-colors">
                  Finances & Billing
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Automated 20% agency commissions, 80% net model payouts, and commercial GST invoices.
                </p>
              </Link>

              <Link
                href="/call-sheets"
                className="p-5 border border-neutral-800 bg-neutral-950 hover:border-[#d4af37] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-neutral-900 text-[#d4af37]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-white">
                    {callSheets.length} Active →
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white group-hover:text-[#d4af37] transition-colors">
                  Call Sheets & Set Logistics
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Real-time timeline schedules, crew contacts, and live talent attendance tracking.
                </p>
              </Link>
            </div>
          </div>

          {/* Right Column (5 cols): Activity Stream & Pipeline */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              {isModel ? "Casting Applications Pipeline" : "Production Activity"}
            </h2>

            <div className="border border-neutral-800 bg-neutral-950 divide-y divide-neutral-900">
              {isModel ? (
                applications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No active casting applications. Explore the Casting Marketplace to audition.
                  </div>
                ) : (
                  applications.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">{app.casting_title}</h4>
                        <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recent"}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        app.status === "shortlisted"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : app.status === "accepted"
                          ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))
                )
              ) : (
                bookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No contract proposals issued yet. Send a direct offer to represented talent.
                  </div>
                ) : (
                  bookings.slice(0, 5).map((b: any) => (
                    <div key={b.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">{b.project_title}</h4>
                        <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          Talent: @{b.model?.username || "model"} · ₹{b.rate_amount?.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                        {b.status}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
