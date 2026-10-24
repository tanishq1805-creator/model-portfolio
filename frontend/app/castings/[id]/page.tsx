"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, DollarSign, Briefcase, Users, Clock,
  ArrowLeft, CheckCircle, Star, User, Send, ChevronRight
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

export default function CastingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [casting, setCasting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const user = getStoredUser();

  useEffect(() => {
    if (id) loadCasting();
  }, [id]);

  async function loadCasting() {
    setLoading(true);
    try {
      const data = await api.castings.get(Number(id));
      setCasting(data);
      // If owner, load applications
      if (user && data.poster_id === user.id) {
        const apps = await api.castings.listApplications(Number(id));
        setApplications(Array.isArray(apps) ? apps : []);
      }
    } catch {
      setCasting(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!user) { router.push("/login"); return; }
    setApplying(true);
    setError("");
    try {
      await api.castings.apply(Number(id), { cover_note: coverNote });
      setApplied(true);
      setShowApplyForm(false);
    } catch (e: any) {
      setError(e.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  }

  async function updateAppStatus(appId: number, status: string) {
    await api.castings.updateApplicationStatus(Number(id), appId, status);
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
    </div>
  );

  if (!casting) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
      <p>Casting not found.</p>
      <Link href="/castings" className="text-[#d4af37] hover:underline">← Back to Castings</Link>
    </div>
  );

  const isOwner = user && casting.poster_id === user.id;
  const isModel = user?.role === "MODEL";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link href="/castings" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to Castings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {casting.is_featured && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Star size={13} className="text-[#d4af37]" fill="currentColor" />
                  <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase">Featured Opportunity</span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-white leading-tight">{casting.title}</h1>
              <p className="text-zinc-400 text-lg mt-1">{casting.brand_name}{casting.campaign_name ? ` — ${casting.campaign_name}` : ""}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300">
                  {casting.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  casting.status === "active" ? "bg-green-900/30 text-green-400 border-green-700/40" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {casting.status === "active" ? "✓ Accepting Applications" : casting.status}
                </span>
                {casting.is_remote && (
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-700/40 rounded-full text-xs font-semibold">
                    Remote Friendly
                  </span>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-zinc-800">About This Casting</h2>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{casting.description}</p>
            </motion.section>

            {/* Requirements */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-zinc-800">Requirements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Gender", value: casting.gender_requirement || "Any" },
                  { label: "Age Range", value: casting.min_age || casting.max_age ? `${casting.min_age || "Any"}–${casting.max_age || "Any"} years` : "Any" },
                  { label: "Height", value: casting.min_height_cm || casting.max_height_cm ? `${casting.min_height_cm || ""}–${casting.max_height_cm || ""}cm` : "Any" },
                  { label: "Experience", value: casting.experience_level || "Any" },
                  { label: "Compensation", value: casting.compensation || "TBD" },
                  { label: "Pay Type", value: casting.compensation_type || "paid" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wide">{label}</div>
                    <div className="text-white font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>
              {casting.skills_required && (
                <div className="mt-4">
                  <div className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wide">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {casting.skills_required.split(",").map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs border border-zinc-700">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            {/* Applications (owner view) */}
            {isOwner && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-zinc-800">
                  Applications ({applications.length})
                </h2>
                {applications.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div key={app.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          {app.applicant_photo ? (
                            <img src={app.applicant_photo} alt={app.applicant_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User size={18} className="text-zinc-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-white font-semibold text-sm">{app.applicant_name}</p>
                              {app.applicant_username && (
                                <Link href={`/models/${app.applicant_username}`} className="text-xs text-[#d4af37] hover:underline">
                                  @{app.applicant_username}
                                </Link>
                              )}
                            </div>
                            <select
                              value={app.status}
                              onChange={(e) => updateAppStatus(app.id, e.target.value)}
                              className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
                            >
                              {["pending", "shortlisted", "selected", "rejected"].map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          {app.cover_note && <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{app.cover_note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Key details card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              {[
                { icon: MapPin, label: "Location", value: casting.location },
                { icon: Calendar, label: "Shoot Date", value: casting.shoot_date || "TBD" },
                { icon: Clock, label: "Apply By", value: casting.application_deadline || "Open" },
                { icon: DollarSign, label: "Compensation", value: casting.compensation || "TBD" },
                { icon: Users, label: "Applications", value: `${casting.applications_count || 0} received` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={16} className="text-[#d4af37] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500">{label}</div>
                    <div className="text-white text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Apply button */}
            {isModel && !isOwner && casting.status === "active" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                {applied ? (
                  <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl p-4 text-green-400">
                    <CheckCircle size={18} />
                    <span className="font-semibold text-sm">Application Submitted!</span>
                  </div>
                ) : showApplyForm ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-white">Apply to this Casting</h3>
                    <textarea
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Write a brief cover note — why are you a great fit? (optional)"
                      rows={4}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60 resize-none"
                    />
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => setShowApplyForm(false)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleApply} disabled={applying} className="flex-1 py-2.5 bg-[#d4af37] text-black rounded-xl text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-60">
                        {applying ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="w-full py-3.5 bg-[#d4af37] text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Apply Now
                  </button>
                )}
              </motion.div>
            )}

            {!user && (
              <Link href="/login" className="block w-full py-3.5 bg-[#d4af37] text-black font-semibold rounded-xl text-center hover:bg-amber-400 transition-colors text-sm">
                Login to Apply
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
