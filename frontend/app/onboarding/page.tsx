"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  Camera,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api, getToken, getStoredUser } from "@/lib/api";

const MODEL_TYPES = [
  "Fashion",
  "Runway",
  "Commercial",
  "Editorial",
  "Beauty",
  "Fitness",
  "Lifestyle",
  "Jewellery",
  "Hand",
  "Foot",
  "Product",
  "Promotional",
];

const EXPERIENCE_LEVELS = [
  { label: "Beginner (0 - 1 Years)", value: "Beginner" },
  { label: "Intermediate (1 - 3 Years)", value: "Intermediate" },
  { label: "Professional (3 - 6 Years)", value: "Professional" },
  { label: "Expert / Veteran (6+ Years)", value: "Expert" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    full_name: "",
    username: "",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    cover_image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
    date_of_birth: "2000-01-15",
    gender: "Female",
    city: "Mumbai",
    country: "India",
    location: "Mumbai, India",
    bio: "",

    // Step 2: Professional
    selected_model_types: ["Fashion", "Editorial"] as string[],
    experience_level: "Professional",
    height_feet_inches: "5'10\"",
    height_cm: 178,
    shoe_size: "39 EU",
    hair_color: "Dark Brown",
    eye_color: "Brown",
    languages: "English, Hindi",
    skills: "Runway Stride, High-Fashion Posing, Editorial Close-ups",

    // Measurements
    bust: 33,
    waist: 24,
    hips: 35,
    inseam: 33,
    chest: 0,
    collar: 0,
    suit_jacket: "",
    measurements_visibility: "public",

    // Step 3: Portfolio Items
    portfolio_items: [
      {
        media_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        media_type: "image",
        category: "Editorial",
        caption: "Autumn Editorial Campaign",
        is_cover: true,
      },
      {
        media_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        media_type: "image",
        category: "Runway",
        caption: "Fashion Week Runway",
        is_cover: false,
      },
    ],

    // Step 4: Experience
    experiences: [
      {
        company_or_brand: "Vogue India",
        campaign_title: "Winter Monolith Editorial",
        role_title: "Lead Editorial Face",
        location: "Mumbai",
        year: "2026",
        description: "Featured on 6-page spread highlighting sustainable luxury apparel.",
      },
    ],

    // Step 5: Agency
    agency_status: "represented", // independent, represented
    agency_name: "Elite Talent Collective",

    // Step 6: Availability
    availability_status: "available", // available, partially_available, unavailable

    // Step 7: Social
    instagram: "talent_official",
    linkedin: "model-identity",
    website: "https://talentportfolio.me",
    youtube: "",
    other_portfolio_url: "",
  });

  // Calculate live completion score
  const [completionScore, setCompletionScore] = useState(40);

  useEffect(() => {
    // Check if user is logged in
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Attempt to load existing profile
    async function loadExisting() {
      try {
        const profile = await api.models.getMyProfile();
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            full_name: profile.full_name || prev.full_name,
            username: profile.username || prev.username,
            profile_photo: profile.profile_photo || prev.profile_photo,
            cover_image: profile.cover_image || prev.cover_image,
            bio: profile.bio || prev.bio,
            city: profile.city || prev.city,
            location: profile.location || prev.location,
            height_feet_inches: profile.height_feet_inches || prev.height_feet_inches,
            height_cm: profile.height_cm || prev.height_cm,
            agency_status: profile.agency_status || prev.agency_status,
            agency_name: profile.agency_name || prev.agency_name,
            availability_status: profile.availability_status || prev.availability_status,
            portfolio_items: profile.portfolio_items?.length ? profile.portfolio_items : prev.portfolio_items,
            experiences: profile.experiences?.length ? profile.experiences : prev.experiences,
          }));
          if (profile.completion_score) {
            setCompletionScore(profile.completion_score.percentage);
          }
        }
      } catch (err) {
        console.log("No existing profile or blank profile initialized.");
      }
    }
    loadExisting();
  }, [router]);

  const toggleModelType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.selected_model_types.includes(type);
      return {
        ...prev,
        selected_model_types: exists
          ? prev.selected_model_types.filter((t) => t !== type)
          : [...prev.selected_model_types, type],
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profile" | "cover" | "portfolio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const res = await api.upload.file(file, field === "profile" ? "profiles" : field === "cover" ? "covers" : "portfolio");
      if (field === "profile") {
        setFormData((prev) => ({ ...prev, profile_photo: res.url }));
      } else if (field === "cover") {
        setFormData((prev) => ({ ...prev, cover_image: res.url }));
      } else {
        setFormData((prev) => ({
          ...prev,
          portfolio_items: [
            ...prev.portfolio_items,
            {
              media_url: res.url,
              media_type: res.media_type || "image",
              category: "Editorial",
              caption: file.name,
              is_cover: false,
            },
          ],
        }));
      }
      setSuccessMsg("File uploaded successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "File upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          company_or_brand: "",
          campaign_title: "",
          role_title: "Model",
          location: "",
          year: "2026",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const saveCurrentProgress = async (markComplete = false) => {
    setError(null);
    try {
      setIsLoading(true);
      const payload = {
        full_name: formData.full_name,
        username: formData.username,
        profile_photo: formData.profile_photo,
        cover_image: formData.cover_image,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        location: formData.location || `${formData.city}, ${formData.country}`,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        model_type: formData.selected_model_types.join(", "),
        experience_level: formData.experience_level,
        height_cm: Number(formData.height_cm),
        height_feet_inches: formData.height_feet_inches,
        shoe_size: formData.shoe_size,
        hair_color: formData.hair_color,
        eye_color: formData.eye_color,
        languages: formData.languages,
        skills: formData.skills,
        measurements: {
          bust: Number(formData.bust),
          waist: Number(formData.waist),
          hips: Number(formData.hips),
          inseam: Number(formData.inseam),
          chest: Number(formData.chest),
          collar: Number(formData.collar),
          suit_jacket: formData.suit_jacket,
          visibility: formData.measurements_visibility,
        },
        portfolio_items: formData.portfolio_items,
        experiences: formData.experiences,
        agency_status: formData.agency_status,
        agency_name: formData.agency_name,
        availability_status: formData.availability_status,
        social_links: {
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          website: formData.website,
          youtube: formData.youtube,
          other_portfolio_url: formData.other_portfolio_url,
        },
        mark_completed: markComplete,
      };

      const res = await api.models.saveOnboarding(payload);
      if (res.completion_score) {
        setCompletionScore(res.completion_score.percentage);
      }

      if (markComplete) {
        router.push(`/models/${res.username}`);
      } else {
        setSuccessMsg("Step progress saved to database.");
        setTimeout(() => setSuccessMsg(null), 2500);
      }
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to save profile progress.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    const res = await saveCurrentProgress(false);
    if (res && currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    await saveCurrentProgress(true);
  };

  const stepsList = [
    "Basic Info",
    "Professional",
    "Portfolio",
    "Experience",
    "Agency",
    "Availability",
    "Social & Links",
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Score Banner */}
        <div className="bg-neutral-950 border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              Professional Model Onboarding
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-white">Build Your Digital Identity</h1>
            <p className="text-xs text-neutral-400">
              Complete your verification profile to access direct casting calls and luxury brand inquiries.
            </p>
          </div>

          {/* Profile Strength Score */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 shrink-0 min-w-[200px] text-right">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Profile Strength
              </span>
              <span className="text-xl font-serif font-bold text-[#d4af37]">
                {completionScore}%
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 mt-2">
              <div
                className="bg-[#d4af37] h-1.5 transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Navigation Pill Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 bg-neutral-950 p-1 border border-neutral-900 text-[10px] font-mono uppercase tracking-wider text-center">
          {stepsList.map((name, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;
            return (
              <button
                key={name}
                onClick={() => setCurrentStep(stepNum)}
                className={`py-2 px-1 transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : isDone
                    ? "text-[#d4af37] bg-neutral-900/60"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {stepNum}. {name}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-neutral-950 border border-neutral-800 p-8 sm:p-10 space-y-8">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-2xl font-serif text-white">Step 1 — Basic Information</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your primary identifying details as they will appear to casting teams and agencies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Legal / Professional Name"
                  placeholder="e.g. Elena Rostova"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />

                <Input
                  label="Unique Username"
                  placeholder="e.g. elenarostova"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  helper="Public URL: /models/[username]"
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { label: "Female", value: "Female" },
                    { label: "Male", value: "Male" },
                    { label: "Non-Binary / Fluid", value: "Non-Binary" },
                  ]}
                />

                <Input
                  label="Primary City"
                  placeholder="e.g. Mumbai, Paris, Milan, New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />

                <Input
                  label="Country"
                  placeholder="e.g. India, France, USA"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              {/* Bio & Bio AI Suggestions */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                  Professional Biography
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-neutral-900/80 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="Summarize your runway background, editorial specializations, and campaign aesthetics..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              {/* Photos Preview & Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                    Profile Portrait
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.profile_photo}
                      alt="Profile Preview"
                      className="w-20 h-24 object-cover border border-neutral-800 bg-neutral-900"
                    />
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-700 hover:border-white text-xs uppercase tracking-wider cursor-pointer bg-neutral-900">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Portrait</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "profile")}
                        />
                      </label>
                      <p className="text-[10px] text-neutral-500">Square or portrait 3:4 aspect ratio</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                    Editorial Cover Banner
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.cover_image}
                      alt="Cover Preview"
                      className="w-32 h-20 object-cover border border-neutral-800 bg-neutral-900"
                    />
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-700 hover:border-white text-xs uppercase tracking-wider cursor-pointer bg-neutral-900">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "cover")}
                        />
                      </label>
                      <p className="text-[10px] text-neutral-500">Wide 16:9 banner format</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL INFORMATION & MEASUREMENTS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-2xl font-serif text-white">Step 2 — Professional Information</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Dimensional measurements, specializations, and physical attributes.
                </p>
              </div>

              {/* Modeling Categories */}
              <div className="space-y-3">
                <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                  Select Modeling Categories (Select All That Apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MODEL_TYPES.map((type) => {
                    const isSelected = formData.selected_model_types.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleModelType(type)}
                        className={`px-3.5 py-2 text-xs uppercase tracking-wider font-mono border transition-all ${
                          isSelected
                            ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] font-semibold"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <Select
                  label="Experience Level"
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  options={EXPERIENCE_LEVELS}
                />

                <Input
                  label="Height (Feet & Inches)"
                  placeholder="e.g. 5'10.5&quot;"
                  value={formData.height_feet_inches}
                  onChange={(e) => setFormData({ ...formData, height_feet_inches: e.target.value })}
                />

                <Input
                  label="Height (Centimeters)"
                  type="number"
                  placeholder="178"
                  value={formData.height_cm || ""}
                  onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                />
              </div>

              {/* Structured Body Measurements */}
              <div className="bg-neutral-900/60 border border-neutral-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
                    Dimensional Measurements (Inches)
                  </h3>
                  <Select
                    className="py-1 text-xs"
                    value={formData.measurements_visibility}
                    onChange={(e) => setFormData({ ...formData, measurements_visibility: e.target.value })}
                    options={[
                      { label: "Public Visibility", value: "public" },
                      { label: "Verified Brands Only", value: "verified_only" },
                      { label: "Confidential / Private", value: "private" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Bust / Chest"
                    type="number"
                    value={formData.bust || ""}
                    onChange={(e) => setFormData({ ...formData, bust: Number(e.target.value) })}
                  />
                  <Input
                    label="Waist"
                    type="number"
                    value={formData.waist || ""}
                    onChange={(e) => setFormData({ ...formData, waist: Number(e.target.value) })}
                  />
                  <Input
                    label="Hips"
                    type="number"
                    value={formData.hips || ""}
                    onChange={(e) => setFormData({ ...formData, hips: Number(e.target.value) })}
                  />
                  <Input
                    label="Inseam"
                    type="number"
                    value={formData.inseam || ""}
                    onChange={(e) => setFormData({ ...formData, inseam: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input
                  label="Shoe Size"
                  placeholder="e.g. 39 EU / 8.5 US"
                  value={formData.shoe_size}
                  onChange={(e) => setFormData({ ...formData, shoe_size: e.target.value })}
                />
                <Input
                  label="Hair Color"
                  placeholder="e.g. Dark Blonde"
                  value={formData.hair_color}
                  onChange={(e) => setFormData({ ...formData, hair_color: e.target.value })}
                />
                <Input
                  label="Eye Color"
                  placeholder="e.g. Hazel / Green"
                  value={formData.eye_color}
                  onChange={(e) => setFormData({ ...formData, eye_color: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Languages Spoken"
                  placeholder="English, French, Hindi"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                />
                <Input
                  label="Skills & Performance Tags"
                  placeholder="Runway Stride, Haute Couture Posing, Movement"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 3: PORTFOLIO UPLOAD */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div>
                  <h2 className="text-2xl font-serif text-white">Step 3 — Portfolio Collections</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Upload editorial tear sheets, runway captures, and commercial lookbooks.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs uppercase tracking-widest font-semibold cursor-pointer hover:bg-neutral-200 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Media</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "portfolio")}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.portfolio_items.map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-neutral-900 border border-neutral-800 overflow-hidden"
                  >
                    <img
                      src={item.media_url}
                      alt={item.caption || "Portfolio"}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="p-3 space-y-2 bg-neutral-950">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#d4af37] uppercase">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              portfolio_items: prev.portfolio_items.filter((_, i) => i !== index),
                            }));
                          }}
                          className="text-neutral-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2 py-1 text-neutral-200 focus:outline-none"
                        value={item.caption || ""}
                        placeholder="Caption / Production credit"
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const updated = [...prev.portfolio_items];
                            updated[index].caption = val;
                            return { ...prev, portfolio_items: updated };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: EXPERIENCE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div>
                  <h2 className="text-2xl font-serif text-white">Step 4 — Campaign & Runway Experience</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Document verified fashion week credits, major designer lookbooks, and brand campaigns.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Credit</span>
                </Button>
              </div>

              <div className="space-y-4">
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} className="bg-neutral-900/60 border border-neutral-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                        Credit #{idx + 1}
                      </span>
                      {formData.experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(idx)}
                          className="text-neutral-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Brand / Company"
                        placeholder="e.g. Chanel Haute Couture"
                        value={exp.company_or_brand}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const updated = [...prev.experiences];
                            updated[idx].company_or_brand = val;
                            return { ...prev, experiences: updated };
                          });
                        }}
                      />
                      <Input
                        label="Campaign / Show Name"
                        placeholder="e.g. Autumn Paris Runway"
                        value={exp.campaign_title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const updated = [...prev.experiences];
                            updated[idx].campaign_title = val;
                            return { ...prev, experiences: updated };
                          });
                        }}
                      />
                      <Input
                        label="Year"
                        placeholder="2026"
                        value={exp.year}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const updated = [...prev.experiences];
                            updated[idx].year = val;
                            return { ...prev, experiences: updated };
                          });
                        }}
                      />
                    </div>

                    <Input
                      label="Role & Location"
                      placeholder="Lead Runway Model • Grand Palais, Paris"
                      value={exp.description || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const updated = [...prev.experiences];
                          updated[idx].description = val;
                          return { ...prev, experiences: updated };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: AGENCY REPRESENTATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-2xl font-serif text-white">Step 5 — Agency Representation</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Specify whether you are signed with an agency or working independently.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, agency_status: "independent", agency_name: "" })}
                  className={`p-6 border cursor-pointer transition-all ${
                    formData.agency_status === "independent"
                      ? "border-white bg-neutral-900"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <h3 className="text-base font-semibold text-white">Independent Talent</h3>
                  <p className="text-xs text-neutral-400 mt-2">
                    Direct booking by casting directors and brands with self-managed contract terms.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, agency_status: "represented" })}
                  className={`p-6 border cursor-pointer transition-all ${
                    formData.agency_status === "represented"
                      ? "border-white bg-neutral-900"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <h3 className="text-base font-semibold text-white">Represented by Agency</h3>
                  <p className="text-xs text-neutral-400 mt-2">
                    Managed by a mother agency or regional agency with standardized representation.
                  </p>
                </div>
              </div>

              {formData.agency_status === "represented" && (
                <div className="pt-2">
                  <Input
                    label="Agency Name"
                    placeholder="e.g. Elite Paris / Inez Talent Management"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 6: AVAILABILITY CALENDAR */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-2xl font-serif text-white">Step 6 — Production Availability</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Help casting directors understand your immediate readiness for production calls.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, availability_status: "available" })}
                  className={`p-6 border cursor-pointer transition-all ${
                    formData.availability_status === "available"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Available Now</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    Ready for bookings, tests, and travel immediately.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, availability_status: "partially_available" })}
                  className={`p-6 border cursor-pointer transition-all ${
                    formData.availability_status === "partially_available"
                      ? "border-amber-500 bg-amber-950/20"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Limited Availability</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    Specific shoot dates or selective projects only.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, availability_status: "unavailable" })}
                  className={`p-6 border cursor-pointer transition-all ${
                    formData.availability_status === "unavailable"
                      ? "border-neutral-500 bg-neutral-900"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    <h3 className="text-sm font-semibold text-white">Fully Booked</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    Currently under exclusive production schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SOCIAL LINKS & FINAL CONFIRMATION */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-2xl font-serif text-white">Step 7 — Social Links & Verification Ready</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect your public handles to streamline brand discovery and social proof.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Instagram Username"
                  placeholder="e.g. yourhandle"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
                <Input
                  label="LinkedIn Profile or Vanity URL"
                  placeholder="e.g. in/your-name"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
                <Input
                  label="Personal Portfolio or Website"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
                <Input
                  label="YouTube or Video Reel Link"
                  placeholder="https://youtube.com/..."
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                />
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#d4af37]">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-sm font-serif font-semibold text-white">
                    Verification Eligibility
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Upon finishing onboarding, your profile will be queued for official badge evaluation (Identity, Measurements, and Portfolio Verification).
                </p>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS (BOTTOM) */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-900">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handlePrevStep} disabled={isLoading}>
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                <span>Previous Step</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => saveCurrentProgress(false)} isLoading={isLoading}>
                Save Draft
              </Button>

              {currentStep < 7 ? (
                <Button onClick={handleNextStep} isLoading={isLoading}>
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              ) : (
                <Button variant="gold" onClick={handleFinalSubmit} isLoading={isLoading}>
                  <span>Publish Profile</span>
                  <CheckCircle2 className="w-3.5 h-3.5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
