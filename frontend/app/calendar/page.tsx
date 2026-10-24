"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plane,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

interface AvailabilityEntry {
  id: number;
  model_profile_id: number;
  date: string; // YYYY-MM-DD
  status: string; // available, option_1, option_2, booked, blackout, travel
  city_location?: string;
  project_label?: string;
  is_private: boolean;
}

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("elenarostova");
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month Navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal / Add Hold State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState({
    date: "",
    status: "booked",
    city_location: "Mumbai",
    project_label: "",
    is_private: false,
  });

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (u?.username && u?.role === "MODEL") {
      setSelectedUsername(u.username);
    }
  }, []);

  useEffect(() => {
    if (selectedUsername) {
      loadCalendar(selectedUsername);
    }
  }, [selectedUsername]);

  const loadCalendar = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.calendar.getTalentCalendar(username);
      setEntries(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Map entries by date YYYY-MM-DD
  const entriesByDate: Record<string, AvailabilityEntry> = {};
  entries.forEach((e) => {
    entriesByDate[e.date] = e;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "option_1":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "option_2":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "blackout":
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
      case "travel":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "available":
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  const handleOpenAddModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = entriesByDate[dateStr];
    setFormData({
      date: dateStr,
      status: existing ? existing.status : "booked",
      city_location: existing?.city_location || "Mumbai",
      project_label: existing?.project_label || "",
      is_private: existing?.is_private || false,
    });
    setIsModalOpen(true);
  };

  const handleSaveHold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.calendar.setAvailability(formData);
      await loadCalendar(selectedUsername);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save hold");
    }
  };

  const handleDeleteHold = async (id: number) => {
    if (!confirm("Remove this date hold?")) return;
    try {
      await api.calendar.deleteAvailability(id);
      await loadCalendar(selectedUsername);
    } catch (err: any) {
      alert(err.message || "Failed to delete hold");
    }
  };

  // Stats calculation
  const bookedCount = entries.filter((e) => e.status === "booked").length;
  const optionCount = entries.filter((e) => e.status.startsWith("option")).length;
  const blackoutCount = entries.filter((e) => e.status === "blackout" || e.status === "travel").length;

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <CalendarIcon className="w-4 h-4" />
              <span>Phase 5 Availability & Date Holds</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-wide">
              Model <span className="text-[#d4af37]">Availability Calendar</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Real-time booking holds, option pencil-ins (Option 1/2), blackout travel dates, and direct scheduling.
            </p>
          </div>

          {/* Model Selector Bar */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 self-start md:self-auto">
            <span className="text-xs uppercase font-mono text-neutral-400 px-2">Viewing Talent:</span>
            {["elenarostova", "aaravmehta", "ananyasen", "kaitanaka"].map((uname) => (
              <button
                key={uname}
                onClick={() => setSelectedUsername(uname)}
                className={`text-xs px-3 py-1.5 uppercase font-mono tracking-wider transition-all ${
                  selectedUsername === uname
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                @{uname}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar KPI Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Confirmed Bookings</span>
            <div className="text-2xl font-serif text-rose-400 mt-1 font-semibold">{bookedCount} Days</div>
          </div>
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Pencil Holds (1st/2nd)</span>
            <div className="text-2xl font-serif text-amber-400 mt-1 font-semibold">{optionCount} Days</div>
          </div>
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Blackout / Travel</span>
            <div className="text-2xl font-serif text-neutral-300 mt-1 font-semibold">{blackoutCount} Days</div>
          </div>
          <div className="border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono uppercase text-neutral-500 mb-2">Color Legend</span>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">Booked</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">Option 1</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">Option 2</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">Travel</span>
            </div>
          </div>
        </div>

        {/* Calendar Navigation Bar */}
        <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-serif text-xl sm:text-2xl text-white font-light">
              {monthName} <span className="text-[#d4af37] font-normal">{year}</span>
            </h2>
            <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest mt-0.5">
              Availability Ledger for @{selectedUsername}
            </p>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Monthly Grid */}
        {loading ? (
          <div className="text-center py-24 text-neutral-500 font-mono text-sm">
            Synchronizing availability ledger...
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-800 text-red-300 p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-800">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-neutral-800 text-center font-mono text-xs uppercase text-neutral-500 py-3 bg-neutral-900/60">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-900">
              {/* Empty leading slots */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[105px] sm:min-h-[125px] bg-neutral-950/30 p-2 opacity-30" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const entry = entriesByDate[dateStr];
                const isToday = new Date().toISOString().split("T")[0] === dateStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleOpenAddModal(dateStr)}
                    className={`min-h-[105px] sm:min-h-[125px] p-2.5 transition-all cursor-pointer relative group ${
                      isToday ? "bg-neutral-900/70 border border-[#d4af37]/40" : "hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isToday ? "text-[#d4af37] font-bold" : "text-neutral-400 group-hover:text-white"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {entry?.is_private && <Lock className="w-3 h-3 text-neutral-500" />}
                    </div>

                    {/* Entry Badge */}
                    {entry ? (
                      <div className={`mt-2 p-1.5 rounded border text-[11px] leading-tight ${getStatusColor(entry.status)}`}>
                        <div className="font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                          <span>{entry.status.replace("_", " ")}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHold(entry.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-400 transition-opacity"
                            title="Remove hold"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {entry.project_label && (
                          <div className="truncate mt-0.5 font-medium">{entry.project_label}</div>
                        )}
                        {entry.city_location && (
                          <div className="text-[9px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{entry.city_location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 text-[10px] text-neutral-600 font-mono mt-4 text-center">
                        + Hold
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Date Hold Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-white">Date Hold & Availability</h3>
                <p className="text-xs text-[#d4af37] font-mono">{selectedDate}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHold} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Status Type</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="booked">Booked (Confirmed Shoot)</option>
                  <option value="option_1">Option 1 (First Hold)</option>
                  <option value="option_2">Option 2 (Second Hold)</option>
                  <option value="blackout">Blackout (Unavailable)</option>
                  <option value="travel">Travel (In Transit / Abroad)</option>
                  <option value="available">Available (Open)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Project / Campaign Label</label>
                <input
                  type="text"
                  value={formData.project_label}
                  onChange={(e) => setFormData({ ...formData, project_label: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. Sabyasachi Bridal Campaign"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">City / Location</label>
                <input
                  type="text"
                  value={formData.city_location}
                  onChange={(e) => setFormData({ ...formData, city_location: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. Mumbai / Paris / Milan"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="private_hold"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="rounded bg-neutral-900 border-neutral-800 text-[#d4af37] focus:ring-0"
                />
                <label htmlFor="private_hold" className="text-xs text-neutral-400 select-none">
                  Keep Project Label Private (shows as "Private Hold" to public)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e5c158] transition-colors"
                >
                  Save Date Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
