"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, Plus, Trash2, MapPin, CheckCircle, ExternalLink,
  ChevronRight, Users, Sparkles, Filter, FileText
} from "lucide-react";
import Link from "next/link";
import { api, getStoredUser, getMediaUrl } from "@/lib/api";

const CASTING_STATUSES = [
  { value: "considering", label: "Considering", color: "text-zinc-400 bg-zinc-900 border-zinc-700" },
  { value: "shortlisted", label: "Shortlisted", color: "text-amber-300 bg-amber-950/60 border-amber-800/60" },
  { value: "backup", label: "Backup", color: "text-blue-300 bg-blue-950/60 border-blue-800/60" },
  { value: "booked", label: "Booked", color: "text-emerald-300 bg-emerald-950/60 border-emerald-800/60" },
  { value: "passed", label: "Passed", color: "text-rose-300 bg-rose-950/60 border-rose-800/60" },
];

export default function ShortlistsPage() {
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCampaign, setNewCampaign] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    loadShortlists();
  }, []);

  async function loadShortlists() {
    setLoading(true);
    try {
      const data = await api.shortlists.list();
      const list = Array.isArray(data) ? data : [];
      setShortlists(list);
      if (list.length > 0 && !activeBoard) {
        setActiveBoard(list[0]);
      } else if (activeBoard) {
        const updated = list.find((b: any) => b.id === activeBoard.id);
        setActiveBoard(updated || (list.length > 0 ? list[0] : null));
      }
    } catch {
      setShortlists([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.shortlists.create({
        title: newTitle,
        campaign_name: newCampaign || undefined,
        description: newDesc || undefined,
      });
      setNewTitle("");
      setNewCampaign("");
      setNewDesc("");
      setCreateModal(false);
      await loadShortlists();
      setActiveBoard(created);
    } catch (err: any) {
      alert(err.message || "Failed to create shortlist");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBoard(id: number) {
    if (!confirm("Are you sure you want to delete this casting board?")) return;
    try {
      await api.shortlists.delete(id);
      setActiveBoard(null);
      await loadShortlists();
    } catch (err: any) {
      alert(err.message || "Failed to delete board");
    }
  }

  async function handleItemStatusChange(shortlistId: number, itemId: number, status: string) {
    try {
      await api.shortlists.updateItem(shortlistId, itemId, { casting_status: status });
      await loadShortlists();
    } catch (err: any) {
      alert(err.message || "Failed to update item status");
    }
  }

  async function handleRemoveItem(shortlistId: number, itemId: number) {
    try {
      await api.shortlists.removeItem(shortlistId, itemId);
      await loadShortlists();
    } catch (err: any) {
      alert(err.message || "Failed to remove item");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-white">Casting Moodboards & Shortlists</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Curate, review, and organize talent lineups for runway shows, editorial features, and campaigns.
            </p>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors rounded-xl"
          >
            <Plus className="w-4 h-4" />
            New Casting Board
          </button>
        </div>

        {/* Board Selection Pills */}
        {shortlists.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Boards:</span>
            {shortlists.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBoard(b)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeBoard?.id === b.id
                    ? "bg-[#d4af37] text-black shadow-lg"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <span>{b.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeBoard?.id === b.id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {b.item_count || b.items?.length || 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Board View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : !activeBoard ? (
          <div className="text-center py-20 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-8">
            <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white">No casting shortlists yet</h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">
              Create your first board to curate and organize prospective talent for your upcoming productions.
            </p>
            <button
              onClick={() => setCreateModal(true)}
              className="px-5 py-2.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-amber-400"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active board metadata banner */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{activeBoard.title}</h2>
                  {activeBoard.campaign_name && (
                    <span className="text-xs text-[#d4af37] font-medium border border-[#d4af37]/30 px-2 py-0.5 rounded-full bg-[#d4af37]/10">
                      {activeBoard.campaign_name}
                    </span>
                  )}
                </div>
                {activeBoard.description && (
                  <p className="text-xs text-zinc-400">{activeBoard.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/discover"
                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-medium hover:border-zinc-500 transition-colors"
                >
                  + Add More Talent
                </Link>
                <button
                  onClick={() => handleDeleteBoard(activeBoard.id)}
                  title="Delete Board"
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Model Items Grid */}
            {(!activeBoard.items || activeBoard.items.length === 0) ? (
              <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-900 p-8">
                <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">This board is currently empty.</p>
                <Link
                  href="/discover"
                  className="inline-block mt-3 text-xs text-[#d4af37] font-semibold hover:underline uppercase tracking-wider"
                >
                  Explore talent to add →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeBoard.items.map((item: any) => {
                  const m = item.model;
                  const currentSt = CASTING_STATUSES.find((s) => s.value === item.casting_status) || CASTING_STATUSES[0];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-xl"
                    >
                      {/* Image & Header */}
                      <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                        <img
                          src={getMediaUrl(m?.profile_photo)}
                          alt={m?.full_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Remove item button */}
                        <button
                          onClick={() => handleRemoveItem(activeBoard.id, item.id)}
                          title="Remove from board"
                          className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-rose-900 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Model name & stats bottom overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-white text-base leading-tight drop-shadow-md">
                              {m?.full_name}
                            </h3>
                            {m?.is_identity_verified && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#d4af37]" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 font-mono">
                            {m?.city ? `${m.city} · ` : ""}{m?.height_cm ? `${m.height_cm}cm` : ""}
                          </p>
                          {m?.agency_name && (
                            <p className="text-[10px] text-[#d4af37] font-semibold tracking-wide uppercase truncate mt-0.5">
                              {m.agency_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Selector & Notes */}
                      <div className="p-4 space-y-3 bg-zinc-950 flex-1 flex flex-col justify-between">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono block mb-1">
                            Casting Status
                          </label>
                          <select
                            value={item.casting_status}
                            onChange={(e) => handleItemStatusChange(activeBoard.id, item.id, e.target.value)}
                            className={`w-full text-xs font-semibold uppercase tracking-wider rounded-xl px-3 py-2 border focus:outline-none ${currentSt.color}`}
                          >
                            {CASTING_STATUSES.map((st) => (
                              <option key={st.value} value={st.value} className="bg-zinc-900 text-white">
                                {st.label}
                              </option>
                            ))}
                          </select>

                          {item.internal_notes && (
                            <p className="text-xs text-zinc-400 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 mt-2">
                              "{item.internal_notes}"
                            </p>
                          )}
                        </div>

                        {/* Links */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                          <Link
                            href={`/models/${m?.username}`}
                            className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
                          >
                            Profile <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/models/${m?.username}/comp-card`}
                            className="text-[#d4af37] hover:underline font-mono text-[11px] uppercase tracking-wider"
                          >
                            Comp Card →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Create Casting Board</h3>
              <p className="text-xs text-zinc-400">
                Organize models for a specific runway show, campaign shoot, or luxury lookbook.
              </p>

              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Paris Haute Couture FW27"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1">
                    Campaign / Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chanel Autumn Monolith"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1">
                    Description & Brief Notes
                  </label>
                  <textarea
                    placeholder="Editorial tone, moodboard aesthetic, key model requirements..."
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#d4af37] text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400"
                  >
                    {submitting ? "Creating..." : "Create Board"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
