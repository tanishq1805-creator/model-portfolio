"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Briefcase, CheckCircle, BarChart3, Shield,
  Trash2, UserCheck, Star, ChevronDown, Search, Eye,
  XCircle, AlertCircle
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";
import Link from "next/link";

type Tab = "overview" | "users" | "verifications" | "castings";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [castings, setCastings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const user = getStoredUser();

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "overview") {
        const s = await api.admin.stats();
        setStats(s);
      } else if (tab === "users") {
        const data = await api.admin.listUsers({ per_page: 50 });
        setUsers(data.users || []);
      } else if (tab === "verifications") {
        const data = await api.admin.listVerifications("pending");
        setVerifications(data.requests || []);
      } else if (tab === "castings") {
        const data = await api.admin.listCastings();
        setCastings(data.castings || []);
      }
    } catch {}
    setLoading(false);
  }

  async function processVerification(id: number, status: string) {
    await api.admin.processVerification(id, { status });
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  }

  async function toggleUserActive(id: number, isActive: boolean) {
    await api.admin.updateUser(id, { is_active: !isActive });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !isActive } : u));
  }

  async function toggleCastingFeatured(id: number, featured: boolean) {
    await api.admin.updateCasting(id, { is_featured: !featured });
    setCastings((prev) => prev.map((c) => c.id === id ? { ...c, is_featured: !featured } : c));
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Shield size={40} className="text-zinc-600" />
        <p className="text-lg font-semibold">Admin Access Required</p>
        <p className="text-sm text-zinc-600">You don't have permission to view this page.</p>
        <Link href="/" className="text-[#d4af37] hover:underline text-sm">← Back to Home</Link>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "verifications", label: "Verifications", icon: CheckCircle },
    { id: "castings", label: "Castings", icon: Briefcase },
  ];

  const filteredUsers = users.filter((u) => {
    const matchSearch = !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.profile?.full_name?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = !userRole || u.role === userRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-[#d4af37]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-zinc-500 text-sm">Platform moderation and management</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Users", value: stats.users?.total, icon: Users },
                    { label: "Model Profiles", value: stats.profiles?.total, icon: UserCheck },
                    { label: "Active Castings", value: stats.castings?.active, icon: Briefcase },
                    { label: "Pending Verifications", value: stats.verification?.pending_requests, icon: AlertCircle },
                    { label: "Total Messages", value: stats.engagement?.total_messages, icon: BarChart3 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5">
                      <Icon size={18} className="text-[#d4af37] mb-2" />
                      <p className="text-white font-bold text-2xl">{value || 0}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Users by role */}
                {stats.users?.by_role && (
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-white mb-4">Users by Role</h2>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(stats.users.by_role).map(([role, count]: any) => (
                        <div key={role} className="bg-zinc-800 rounded-xl px-4 py-3">
                          <p className="text-white font-bold text-xl">{count}</p>
                          <p className="text-zinc-400 text-xs capitalize">{role.toLowerCase()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by email or name..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60" />
                  </div>
                  <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none">
                    <option value="">All Roles</option>
                    {["MODEL", "BRAND", "AGENCY", "PHOTOGRAPHER", "CASTING_DIRECTOR", "ADMIN"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">User</th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Role</th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Joined</th>
                        <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">{u.profile?.full_name || u.email}</p>
                              <p className="text-zinc-500 text-xs">{u.email}</p>
                              {u.profile?.username && (
                                <Link href={`/models/${u.profile.username}`} className="text-xs text-[#d4af37] hover:underline">
                                  @{u.profile.username}
                                </Link>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-xs">{u.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${u.is_active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                                {u.is_active ? "Active" : "Suspended"}
                              </span>
                              {u.profile?.is_identity_verified && (
                                <span className="text-[10px] text-[#d4af37] flex items-center gap-0.5">
                                  <CheckCircle size={10} /> Verified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => toggleUserActive(u.id, u.is_active)}
                                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${u.is_active ? "border-red-700/50 text-red-400 hover:bg-red-900/20" : "border-green-700/50 text-green-400 hover:bg-green-900/20"}`}>
                                {u.is_active ? "Suspend" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Verifications */}
            {tab === "verifications" && (
              <div className="space-y-4">
                <p className="text-zinc-400 text-sm">{verifications.length} pending verification request(s)</p>
                {verifications.length === 0 ? (
                  <div className="text-center py-16 text-zinc-600">
                    <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No pending verifications.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verifications.map((vr) => (
                      <div key={vr.id} className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4">
                        {vr.model?.profile_photo && (
                          <img src={vr.model.profile_photo} alt={vr.model.full_name}
                            className="w-12 h-12 rounded-full object-cover shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-white font-semibold">{vr.model?.full_name || "Unknown Model"}</p>
                              {vr.model?.username && (
                                <Link href={`/models/${vr.model.username}`} className="text-xs text-[#d4af37] hover:underline">
                                  @{vr.model.username}
                                </Link>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-xs capitalize">
                                  {vr.verification_type} verification
                                </span>
                                <span className="text-zinc-600 text-xs">
                                  {vr.created_at ? new Date(vr.created_at).toLocaleDateString() : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => processVerification(vr.id, "verified")}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-900/30 border border-green-700/40 text-green-400 rounded-xl text-xs font-semibold hover:bg-green-900/50 transition-colors">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => processVerification(vr.id, "rejected")}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 border border-red-700/40 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-900/50 transition-colors">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          </div>
                          {vr.notes && <p className="text-zinc-400 text-xs mt-2 italic">"{vr.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Castings moderation */}
            {tab === "castings" && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Casting</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium">Stats</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {castings.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <Link href={`/castings/${c.id}`} className="text-white font-medium hover:text-[#d4af37] transition-colors">
                              {c.title}
                            </Link>
                            <p className="text-zinc-500 text-xs">{c.brand_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-900/30 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          <div>{c.views_count} views · {c.applications_count} applications</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => toggleCastingFeatured(c.id, c.is_featured)}
                              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${c.is_featured ? "border-amber-700/50 text-amber-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                              <Star size={11} /> {c.is_featured ? "Unfeature" : "Feature"}
                            </button>
                            <select onChange={(e) => api.admin.updateCasting(c.id, { status: e.target.value })}
                              defaultValue={c.status}
                              className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none">
                              {["active", "closed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
