"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Navigation,
  Sparkles,
  Phone,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  Coffee,
  Shirt,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

interface ScheduleBlock {
  time: string;
  activity: string;
  notes?: string;
}

interface CrewContact {
  role: string;
  name: string;
  phone?: string;
}

interface CallSheet {
  id: number;
  booking_offer_id?: number;
  shoot_title: string;
  production_company: string;
  shoot_date: string;
  general_call_time: string;
  talent_call_time: string;
  shoot_location: string;
  location_notes?: string;
  wardrobe_brief?: string;
  catering_notes?: string;
  attendance_status: string; // confirmed, en_route, on_set, wrapped
  attendance_updated_at?: string;
  schedule_blocks: ScheduleBlock[];
  crew_contacts: CrewContact[];
  creator?: { id: number; email: string };
  model?: {
    id: number;
    username: string;
    full_name: string;
    profile_photo?: string;
    agency_name?: string;
  };
}

export default function CallSheetsPage() {
  const [callSheets, setCallSheets] = useState<CallSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<CallSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    model_username: "elenarostova",
    shoot_title: "",
    production_company: "",
    shoot_date: new Date().toISOString().split("T")[0],
    general_call_time: "08:00 AM",
    talent_call_time: "08:30 AM",
    shoot_location: "",
    location_notes: "",
    wardrobe_brief: "",
    catering_notes: "",
    schedule_blocks: [
      { time: "08:00 AM", activity: "Crew Arrival & Set Prep", notes: "Stage lighting" },
      { time: "08:30 AM", activity: "Talent Call — Hair & Makeup", notes: "Dressing Room 2" },
      { time: "10:00 AM", activity: "First Look / Haute Couture Editorial", notes: "Main Stage" },
      { time: "01:00 PM", activity: "Catered Lunch Break", notes: "Terrace Dining" },
      { time: "02:00 PM", activity: "Afternoon Beauty & Closeups", notes: "Studio Cyc" },
      { time: "06:00 PM", activity: "Estimated Wrap", notes: "Debrief" },
    ],
    crew_contacts: [
      { role: "Director / Photographer", name: "Marcella Rossi", phone: "+91 98200 11223" },
      { role: "Production Coordinator", name: "Ananya Deshmukh", phone: "+91 98200 44556" },
      { role: "Lead Wardrobe Stylist", name: "Chloe Dupont", phone: "+91 98200 77889" },
    ],
  });

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    loadCallSheets();
  }, []);

  const loadCallSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.callSheets.listMy();
      setCallSheets(data || []);
      if (data && data.length > 0) {
        setSelectedSheet(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load call sheets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (sheetId: number, newStatus: string) => {
    try {
      const updated = await api.callSheets.updateAttendance(sheetId, newStatus);
      setCallSheets((prev) => prev.map((s) => (s.id === sheetId ? updated : s)));
      if (selectedSheet?.id === sheetId) {
        setSelectedSheet(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update attendance status");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await api.callSheets.create(formData);
      setCallSheets([created, ...callSheets]);
      setSelectedSheet(created);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create call sheet");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on_set":
        return <span className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-medium">On Set</span>;
      case "en_route":
        return <span className="px-2.5 py-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full font-medium">En Route</span>;
      case "wrapped":
        return <span className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full font-medium">Wrapped</span>;
      default:
        return <span className="px-2.5 py-1 text-xs bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-full font-medium">Confirmed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <FileText className="w-4 h-4" />
              <span>Phase 5 Production Logistics</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-wide">
              Production <span className="text-[#d4af37]">Call Sheets</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Real-time daily call sheets, live talent attendance tracking, crew contacts, and set itineraries for seamless shoot logistics.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest px-5 py-3 hover:bg-[#e5c158] transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Call Sheet</span>
          </button>
        </div>

        {/* Content Layout */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-mono text-sm">
            Accessing call sheet repository...
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-800 text-red-300 p-6 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : callSheets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/50">
            <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-serif text-white">No active call sheets</h3>
            <p className="text-neutral-400 text-sm mt-1 mb-6">Create a new call sheet or confirm a direct booking to generate one.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-neutral-900 border border-neutral-700 text-xs uppercase tracking-wider text-white hover:border-[#d4af37]"
            >
              Issue First Call Sheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Call Sheet List */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                All Scheduled Shoots ({callSheets.length})
              </h2>
              {callSheets.map((sheet) => {
                const isSelected = selectedSheet?.id === sheet.id;
                return (
                  <div
                    key={sheet.id}
                    onClick={() => setSelectedSheet(sheet)}
                    className={`cursor-pointer border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-[#d4af37] bg-neutral-900/80 shadow-lg shadow-[#d4af37]/5"
                        : "border-neutral-800 bg-neutral-950/40 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]">
                        {sheet.shoot_date}
                      </span>
                      {getStatusBadge(sheet.attendance_status)}
                    </div>
                    <h3 className="font-serif text-base text-white font-medium line-clamp-1">
                      {sheet.shoot_title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {sheet.production_company}
                    </p>

                    <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{sheet.model?.full_name || sheet.model?.username || "Talent"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Call: {sheet.talent_call_time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Comprehensive Call Sheet View */}
            {selectedSheet && (
              <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 rounded-none p-6 sm:p-8 space-y-8">
                {/* Call Sheet Header */}
                <div className="border-b border-neutral-800 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                        Official Call Sheet #{String(selectedSheet.id).padStart(4, "0")}
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl text-white font-light mt-1">
                        {selectedSheet.shoot_title}
                      </h2>
                      <p className="text-sm text-[#d4af37] font-medium mt-0.5">
                        {selectedSheet.production_company}
                      </p>
                    </div>

                    {/* Talent Live Status Control */}
                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">
                        Talent Check-in Status
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["confirmed", "en_route", "on_set", "wrapped"].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateAttendance(selectedSheet.id, st)}
                            className={`text-[10px] uppercase tracking-wider px-2.5 py-1 transition-all ${
                              selectedSheet.attendance_status === st
                                ? "bg-[#d4af37] text-black font-semibold"
                                : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white"
                            }`}
                          >
                            {st.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Date & Location Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-900 text-[#d4af37]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-neutral-500">Date</div>
                        <div className="text-sm font-medium text-white">{selectedSheet.shoot_date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-900 text-[#d4af37]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-neutral-500">Talent Call Time</div>
                        <div className="text-sm font-medium text-white">{selectedSheet.talent_call_time}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-900 text-[#d4af37]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-neutral-500">Location</div>
                        <div className="text-sm font-medium text-white truncate max-w-[180px]" title={selectedSheet.shoot_location}>
                          {selectedSheet.shoot_location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Notes Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSheet.wardrobe_brief && (
                    <div className="border border-neutral-900 bg-neutral-900/40 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#d4af37] font-mono mb-2">
                        <Shirt className="w-3.5 h-3.5" />
                        <span>Wardrobe & Styling Brief</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {selectedSheet.wardrobe_brief}
                      </p>
                    </div>
                  )}

                  {selectedSheet.catering_notes && (
                    <div className="border border-neutral-900 bg-neutral-900/40 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#d4af37] font-mono mb-2">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Catering & Dietary Provisions</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {selectedSheet.catering_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Day's Timeline & Schedule Blocks */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Run of Show / Shooting Schedule</span>
                  </h3>
                  <div className="space-y-2 border-l border-neutral-800 ml-3 pl-4">
                    {selectedSheet.schedule_blocks && selectedSheet.schedule_blocks.length > 0 ? (
                      selectedSheet.schedule_blocks.map((block, i) => (
                        <div key={i} className="relative py-2 group">
                          <div className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-neutral-800 border-2 border-black group-hover:bg-[#d4af37] transition-colors" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-mono text-[#d4af37] font-semibold">
                              {block.time}
                            </span>
                            <span className="text-sm text-white font-medium">
                              {block.activity}
                            </span>
                          </div>
                          {block.notes && (
                            <p className="text-xs text-neutral-400 mt-0.5">{block.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500 italic">No timeline blocks provided.</p>
                    )}
                  </div>
                </div>

                {/* Key Crew Contacts */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-4 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Production Directory & Emergency Contacts</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedSheet.crew_contacts && selectedSheet.crew_contacts.length > 0 ? (
                      selectedSheet.crew_contacts.map((crew, i) => (
                        <div key={i} className="border border-neutral-900 bg-neutral-900/50 p-3">
                          <div className="text-[10px] uppercase font-mono text-neutral-500">{crew.role}</div>
                          <div className="text-sm font-medium text-white mt-0.5">{crew.name}</div>
                          {crew.phone && (
                            <a
                              href={`tel:${crew.phone}`}
                              className="text-xs text-[#d4af37] hover:underline mt-1 block font-mono"
                            >
                              {crew.phone}
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500 italic">No crew contacts listed.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-serif text-xl text-white">Create Production Call Sheet</h3>
                <p className="text-xs text-neutral-400">Issue official schedule and crew contacts to booked talent</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Model Username</label>
                  <input
                    type="text"
                    required
                    value={formData.model_username}
                    onChange={(e) => setFormData({ ...formData, model_username: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="e.g. elena_rostova"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Shoot Date</label>
                  <input
                    type="date"
                    required
                    value={formData.shoot_date}
                    onChange={(e) => setFormData({ ...formData, shoot_date: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Shoot Title</label>
                  <input
                    type="text"
                    required
                    value={formData.shoot_title}
                    onChange={(e) => setFormData({ ...formData, shoot_title: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="Vogue Editorial October Shoot"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Production Company</label>
                  <input
                    type="text"
                    required
                    value={formData.production_company}
                    onChange={(e) => setFormData({ ...formData, production_company: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="Condé Nast Visuals"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">General Call Time</label>
                  <input
                    type="text"
                    value={formData.general_call_time}
                    onChange={(e) => setFormData({ ...formData, general_call_time: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Talent Call Time</label>
                  <input
                    type="text"
                    value={formData.talent_call_time}
                    onChange={(e) => setFormData({ ...formData, talent_call_time: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Shoot Location</label>
                <input
                  type="text"
                  required
                  value={formData.shoot_location}
                  onChange={(e) => setFormData({ ...formData, shoot_location: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="Famous Studios, Studio 3, Mahalaxmi, Mumbai"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Wardrobe Brief</label>
                <textarea
                  rows={2}
                  value={formData.wardrobe_brief}
                  onChange={(e) => setFormData({ ...formData, wardrobe_brief: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="Clean skin, nude seamless undergarments. High-fashion avant-garde wardrobe provided on set."
                />
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
                  disabled={submitting}
                  className="px-6 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e5c158] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Call Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
