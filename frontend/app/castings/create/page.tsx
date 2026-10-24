"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "@/lib/api";

const CATEGORIES = ["Editorial", "Runway", "Commercial", "Beauty", "Fitness", "Lifestyle", "Jewellery", "Promotional", "Fashion"];

export default function CreateCastingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    brand_name: "",
    campaign_name: "",
    description: "",
    category: "Editorial",
    location: "",
    is_remote: false,
    gender_requirement: "Any",
    min_age: "",
    max_age: "",
    min_height_cm: "",
    max_height_cm: "",
    experience_level: "Intermediate",
    skills_required: "",
    compensation: "",
    compensation_type: "paid",
    shoot_date: "",
    application_deadline: "",
    status: "active",
  });

  function set(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: any = { ...form };
      if (payload.min_age) payload.min_age = parseInt(payload.min_age);
      else delete payload.min_age;
      if (payload.max_age) payload.max_age = parseInt(payload.max_age);
      else delete payload.max_age;
      if (payload.min_height_cm) payload.min_height_cm = parseFloat(payload.min_height_cm);
      else delete payload.min_height_cm;
      if (payload.max_height_cm) payload.max_height_cm = parseFloat(payload.max_height_cm);
      else delete payload.max_height_cm;
      const result = await api.castings.create(payload);
      router.push(`/castings/${result.id}`);
    } catch (e: any) {
      setError(e.message || "Failed to create casting");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/castings" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to Castings
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Post a Casting Call</h1>
          <p className="text-zinc-400 text-sm mb-8">Find the perfect talent for your campaign.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Casting Details</h2>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Casting Title *</label>
                <input required value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Editorial Model — Winter Collection 2026" className={fieldClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Brand Name *</label>
                  <input required value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)}
                    placeholder="Your brand name" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Campaign Name</label>
                  <input value={form.campaign_name} onChange={(e) => set("campaign_name", e.target.value)}
                    placeholder="Campaign / project name" className={fieldClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Category *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} className={fieldClass}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className={fieldClass}>
                    <option value="active">Active</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Description *</label>
                <textarea required value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the casting, shoot details, what you're looking for..." rows={5}
                  className={`${fieldClass} resize-none`} />
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Location</h2>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Location *</label>
                <input required value={form.location} onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Mumbai, India" className={fieldClass} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_remote} onChange={(e) => set("is_remote", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#d4af37]" />
                <span className="text-sm text-zinc-300">Remote / virtual shoot friendly</span>
              </label>
            </section>

            {/* Requirements */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Model Requirements</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Gender</label>
                  <select value={form.gender_requirement} onChange={(e) => set("gender_requirement", e.target.value)} className={fieldClass}>
                    {["Any", "Female", "Male", "Non-binary", "Other"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Experience Level</label>
                  <select value={form.experience_level} onChange={(e) => set("experience_level", e.target.value)} className={fieldClass}>
                    {["Beginner", "Intermediate", "Professional", "Expert"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Min Age</label>
                  <input type="number" value={form.min_age} onChange={(e) => set("min_age", e.target.value)}
                    placeholder="e.g. 18" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Max Age</label>
                  <input type="number" value={form.max_age} onChange={(e) => set("max_age", e.target.value)}
                    placeholder="e.g. 32" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Min Height (cm)</label>
                  <input type="number" value={form.min_height_cm} onChange={(e) => set("min_height_cm", e.target.value)}
                    placeholder="e.g. 170" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Max Height (cm)</label>
                  <input type="number" value={form.max_height_cm} onChange={(e) => set("max_height_cm", e.target.value)}
                    placeholder="e.g. 185" className={fieldClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Required Skills</label>
                <input value={form.skills_required} onChange={(e) => set("skills_required", e.target.value)}
                  placeholder="e.g. Runway, Editorial, Commercial (comma-separated)" className={fieldClass} />
              </div>
            </section>

            {/* Compensation & Timeline */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Compensation & Timeline</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Compensation</label>
                  <input value={form.compensation} onChange={(e) => set("compensation", e.target.value)}
                    placeholder="e.g. ₹15,000/day" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Pay Type</label>
                  <select value={form.compensation_type} onChange={(e) => set("compensation_type", e.target.value)} className={fieldClass}>
                    <option value="paid">Paid</option>
                    <option value="tfcd">TFCd (Time for Content)</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Shoot Date</label>
                  <input value={form.shoot_date} onChange={(e) => set("shoot_date", e.target.value)}
                    placeholder="e.g. December 10-12, 2026" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Application Deadline</label>
                  <input value={form.application_deadline} onChange={(e) => set("application_deadline", e.target.value)}
                    placeholder="e.g. November 25, 2026" className={fieldClass} />
                </div>
              </div>
            </section>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-700/40 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-4">
              <button type="button" onClick={() => router.back()}
                className="flex-1 py-3.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold rounded-xl hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-[#d4af37] text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? "Publishing..." : <><Plus size={16} /> Publish Casting</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
