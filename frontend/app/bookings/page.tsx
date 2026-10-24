"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Clock, DollarSign, ShieldCheck, CheckCircle2,
  XCircle, ArrowRightLeft, FileText, AlertCircle, Building2, User
} from "lucide-react";
import Link from "next/link";
import { api, getStoredUser, getMediaUrl } from "@/lib/api";

type BookingStatus = "all" | "pending" | "accepted" | "counter_offered" | "completed" | "declined";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus>("all");
  const [counterModal, setCounterModal] = useState<any | null>(null);
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [counterNotes, setCounterNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await api.bookings.listMy();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleResponse(bookingId: number, action: "accept" | "decline") {
    try {
      await api.bookings.respond(bookingId, { action });
      await loadBookings();
    } catch (e: any) {
      alert(e.message || "Failed to update booking offer");
    }
  }

  async function handleCounterSubmit() {
    if (!counterModal || !counterAmount) return;
    setSubmitting(true);
    try {
      await api.bookings.respond(counterModal.id, {
        action: "counter_offer",
        counter_offer_amount: parseFloat(counterAmount),
        response_notes: counterNotes,
      });
      setCounterModal(null);
      setCounterAmount("");
      setCounterNotes("");
      await loadBookings();
    } catch (e: any) {
      alert(e.message || "Failed to submit counter offer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(bookingId: number, status: string) {
    try {
      await api.bookings.updateStatus(bookingId, status);
      await loadBookings();
    } catch (e: any) {
      alert(e.message || "Failed to update booking status");
    }
  }

  const isModel = user?.role === "MODEL";

  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-white">Direct Bookings & Contracts</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Legally structured digital booking contracts, call times, usage rights, and agreed fees.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-widest hover:bg-amber-400 transition-colors rounded-xl"
          >
            Find & Book Talent
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "accepted", "counter_offered", "completed", "declined"] as BookingStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                filter === st
                  ? "bg-[#d4af37] text-black font-semibold"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-8">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white">No bookings found</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Direct booking offers sent or received will be archived and managed here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((b) => {
              const amModel = isModel && b.model?.username === user?.username;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Left: Project Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            b.status === "accepted"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                              : b.status === "pending"
                              ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                              : b.status === "counter_offered"
                              ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                              : b.status === "completed"
                              ? "bg-purple-950/80 text-purple-400 border-purple-800/60"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-zinc-500">#{String(b.id).padStart(4, "0")}</span>
                      </div>

                      <h2 className="text-xl font-bold text-white leading-snug">{b.project_title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                          <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                          {b.client_organization}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {b.shoot_location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {b.start_date} {b.end_date ? `to ${b.end_date}` : ""}
                        </span>
                        {b.call_time && (
                          <span className="flex items-center gap-1.5 text-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            Call Time: {b.call_time}
                          </span>
                        )}
                      </div>

                      {/* Terms pill grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Agreed Fee</p>
                          <p className="text-base font-bold text-[#d4af37] mt-0.5">
                            {b.currency} {b.compensation_amount.toLocaleString()}
                            <span className="text-xs text-zinc-400 font-normal ml-1">({b.rate_basis})</span>
                          </p>
                          {b.counter_offer_amount && (
                            <p className="text-xs text-blue-400 mt-0.5">
                              Counter: {b.currency} {b.counter_offer_amount.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Usage Rights</p>
                          <p className="text-xs font-semibold text-zinc-200 mt-1 line-clamp-2">{b.usage_rights}</p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Talent Assigned</p>
                          <div className="flex items-center gap-2 mt-1">
                            {b.model?.profile_photo && (
                              <img
                                src={getMediaUrl(b.model.profile_photo)}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <Link
                              href={`/models/${b.model?.username}`}
                              className="text-xs font-semibold text-white hover:text-[#d4af37] transition-colors"
                            >
                              {b.model?.full_name}
                            </Link>
                          </div>
                        </div>
                      </div>

                      {b.wardrobe_notes && (
                        <div className="text-xs text-zinc-400 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60">
                          <strong className="text-zinc-300">Wardrobe / Styling:</strong> {b.wardrobe_notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                      {amModel && b.status === "pending" && (
                        <div className="flex lg:flex-col gap-2 w-full">
                          <button
                            onClick={() => handleResponse(b.id, "accept")}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept Offer
                          </button>
                          <button
                            onClick={() => {
                              setCounterModal(b);
                              setCounterAmount(b.compensation_amount.toString());
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border border-zinc-700"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Counter
                          </button>
                          <button
                            onClick={() => handleResponse(b.id, "decline")}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border border-rose-800/40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      )}

                      {!amModel && b.status === "accepted" && (
                        <button
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="px-4 py-2 bg-[#d4af37] text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}

                      <Link
                        href={`/models/${b.model?.username}/comp-card`}
                        className="text-[11px] text-[#d4af37] hover:underline uppercase tracking-widest font-mono"
                      >
                        View Talent Zed Card →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      <AnimatePresence>
        {counterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Propose Counter-Offer</h3>
              <p className="text-xs text-zinc-400">
                Adjust your requested fee and provide notes regarding terms or availability for {counterModal.project_title}.
              </p>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1">
                  Proposed Compensation ({counterModal.currency})
                </label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1">
                  Note to Client
                </label>
                <textarea
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="e.g., Available on specified dates; rate reflects extended multi-territory digital rights."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCounterModal(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={handleCounterSubmit}
                  className="flex-1 py-2.5 bg-[#d4af37] text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400"
                >
                  {submitting ? "Submitting..." : "Send Counter"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
