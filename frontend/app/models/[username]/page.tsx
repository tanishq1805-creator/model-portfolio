"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Ruler,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Globe,
  Mail,
  Sparkles,
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronRight,
  ExternalLink,
  Lock,
  Star,
  Plus,
  Trash2,
  Award,
  Upload,
  Check,
  Building,
  UserCheck,
  Users,
  UserPlus,
} from "lucide-react";
import { VerifiedBadge, AvailabilityBadge, CategoryPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api, getMediaUrl, getStoredUser } from "@/lib/api";

export default function ModelProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(3840);
  const [followingCount, setFollowingCount] = useState<number>(184);
  const [followToast, setFollowToast] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Modals State
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);
  const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] = useState(false);
  const [isAddAchievementModalOpen, setIsAddAchievementModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    projectName: "",
    shootDate: "",
    location: "",
    budget: "",
    message: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New Portfolio Item Form
  const [newPortfolio, setNewPortfolio] = useState({
    media_url: "",
    category: "Editorial",
    caption: "",
    photographer_credit: "",
    stylist_credit: "",
    brand_credit: "",
  });

  // New Experience Form
  const [newExperience, setNewExperience] = useState({
    company_or_brand: "",
    campaign_title: "",
    role_title: "Model",
    location: "",
    year: new Date().getFullYear().toString(),
    description: "",
  });

  // New Achievement Form
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    organization_or_event: "",
    year: new Date().getFullYear().toString(),
    category: "Fashion Week",
    description: "",
  });

  // New Review Form
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    project_name: "",
  });

  // Verification Request Form
  const [verificationForm, setVerificationForm] = useState({
    verification_type: "identity",
    document_url: "",
    notes: "",
  });
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    async function fetchModel() {
      if (!username) return;
      try {
        setIsLoading(true);
        const data = await api.models.getByUsername(username);
        setProfile(data);
        const baseFollowers = data.username === "elenarostova" ? 3840 : data.username === "aaravmehta" ? 2420 : 1250;
        setFollowersCount(baseFollowers);
        setFollowingCount(184);
      } catch (err: any) {
        setError(err.message || "Model profile could not be retrieved.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchModel();
  }, [username]);

  const isOwner = currentUser && profile && currentUser.id === profile.user_id;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
      setFollowToast(`Unfollowed @${profile?.username}`);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      setFollowToast(`Now following @${profile?.username}`);
    }
    setTimeout(() => setFollowToast(null), 3000);
  };

  const handlePrivacyChange = async (newVisibility: string) => {
    try {
      const updated = await api.models.updatePrivacy(newVisibility);
      setProfile((prev: any) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          ...updated,
          visibility: newVisibility,
        },
      }));
    } catch (err: any) {
      alert("Failed to update privacy setting: " + err.message);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolio.media_url) return;
    try {
      const item = await api.models.addPortfolioItem(newPortfolio);
      setProfile((prev: any) => ({
        ...prev,
        portfolio_items: [...prev.portfolio_items, item],
      }));
      setIsAddPortfolioModalOpen(false);
      setNewPortfolio({
        media_url: "",
        category: "Editorial",
        caption: "",
        photographer_credit: "",
        stylist_credit: "",
        brand_credit: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to add portfolio item");
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!confirm("Are you sure you want to remove this portfolio item?")) return;
    try {
      await api.models.deletePortfolioItem(id);
      setProfile((prev: any) => ({
        ...prev,
        portfolio_items: prev.portfolio_items.filter((item: any) => item.id !== id),
      }));
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exp = await api.models.addExperience(newExperience);
      setProfile((prev: any) => ({
        ...prev,
        experiences: [...prev.experiences, exp],
      }));
      setIsAddExperienceModalOpen(false);
      setNewExperience({
        company_or_brand: "",
        campaign_title: "",
        role_title: "Model",
        location: "",
        year: new Date().getFullYear().toString(),
        description: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to add experience");
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ach = await api.models.addAchievement(newAchievement);
      setProfile((prev: any) => ({
        ...prev,
        achievements: [...(prev.achievements || []), ach],
      }));
      setIsAddAchievementModalOpen(false);
      setNewAchievement({
        title: "",
        organization_or_event: "",
        year: new Date().getFullYear().toString(),
        category: "Fashion Week",
        description: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to add achievement");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rev = await api.models.submitReview(profile.username, newReview);
      setProfile((prev: any) => ({
        ...prev,
        reviews: [...(prev.reviews || []), rev],
        reviews_count: (prev.reviews_count || 0) + 1,
      }));
      setIsAddReviewModalOpen(false);
      setNewReview({ rating: 5, comment: "", project_name: "" });
    } catch (err: any) {
      alert(err.message || "Failed to post review");
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.models.submitVerificationRequest(verificationForm);
      setVerificationSubmitted(true);
      setTimeout(() => {
        setVerificationSubmitted(false);
        setIsVerificationModalOpen(false);
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to submit verification request");
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.bookings.create({
        model_username: profile.username,
        project_title: bookingForm.projectName,
        client_organization: currentUser?.email || "Direct Client",
        shoot_location: bookingForm.location || "On Location",
        start_date: bookingForm.shootDate || new Date().toISOString().split("T")[0],
        compensation_amount: parseFloat(bookingForm.budget) || 50000,
        wardrobe_notes: bookingForm.message,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setIsBookingModalOpen(false);
        setBookingForm({ projectName: "", shootDate: "", location: "", budget: "", message: "" });
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to submit booking offer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-20 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-mono text-neutral-400">Loading Editorial Roster Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 p-8 text-center space-y-4">
          <h2 className="text-2xl font-serif text-white">Profile Not Found</h2>
          <p className="text-xs text-neutral-400">
            {error || "The requested talent username does not exist on our active roster."}
          </p>
          <Link
            href="/#discover"
            className="inline-block mt-4 text-xs uppercase tracking-widest font-semibold bg-white text-black px-6 py-2.5"
          >
            Explore Talent Roster
          </Link>
        </div>
      </div>
    );
  }

  const categories = profile.model_type
    ? profile.model_type.split(",").map((s: string) => s.trim())
    : ["Fashion"];

  const portfolioTabs = ["ALL", "EDITORIAL", "RUNWAY", "COMMERCIAL", "BEAUTY", "FITNESS", "JEWELLERY", "CAMPAIGNS"];

  const filteredPortfolio = profile.portfolio_items?.filter((item: any) => {
    if (activeTab === "ALL") return true;
    return item.category?.toLowerCase() === activeTab.toLowerCase();
  }) || [];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24 selection:bg-[#d4af37] selection:text-black">
      {/* COVER BANNER */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full bg-neutral-900 overflow-hidden border-b border-neutral-900">
        <img
          src={getMediaUrl(profile.cover_image)}
          alt={`${profile.full_name} Cover`}
          className="w-full h-full object-cover filter contrast-125 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/#discover"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-neutral-800 text-xs uppercase tracking-widest text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Talent Directory</span>
          </Link>
        </div>

        {isOwner && (
          <div className="absolute top-6 right-4 sm:right-8 z-10 flex items-center gap-2">
            <Link
              href="/onboarding"
              className="px-3.5 py-1.5 bg-[#d4af37] text-black text-xs uppercase tracking-widest font-semibold hover:bg-white transition-all shadow-xl"
            >
              Full Profile Editor
            </Link>
          </div>
        )}
      </div>

      {/* PROFILE HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Portrait Image */}
            <div className="relative w-32 h-44 sm:w-44 sm:h-56 bg-neutral-900 border-2 border-black overflow-hidden shadow-2xl shrink-0 group">
              <img
                src={getMediaUrl(profile.profile_photo)}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Basic Meta */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AvailabilityBadge status={profile.availability_status} />
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="hover:opacity-80 transition-opacity"
                  title="View Trust & Verification Badges"
                >
                  <VerifiedBadge showText />
                </button>
                {profile.rating_average && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 border border-[#d4af37]/30">
                    <Star className="w-3 h-3 fill-[#d4af37]" />
                    <span>{profile.rating_average}</span>
                    <span className="text-neutral-500">({profile.reviews_count || 0})</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
                {profile.full_name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                <span className="text-neutral-300">@{profile.username}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-300">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  {profile.city || profile.location || "International"}
                </span>
                {(profile.height_feet_inches || profile.height_cm) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-neutral-300">
                      <Ruler className="w-3 h-3 text-neutral-500" />
                      {profile.height_feet_inches || `${profile.height_cm} cm`}
                    </span>
                  </>
                )}
                {profile.agency_name && (
                  <>
                    <span>•</span>
                    <span className="text-[#d4af37]">Rep: {profile.agency_name}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((c: string) => (
                  <CategoryPill key={c}>{c}</CategoryPill>
                ))}
              </div>

              {/* Followers and Following Counters */}
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 pt-1">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{followersCount.toLocaleString()}</span>
                  <span className="text-neutral-400 font-normal">Followers</span>
                </span>
                <span>•</span>
                <span className="text-white font-semibold">
                  <span>{followingCount.toLocaleString()}</span>
                  <span className="text-neutral-400 font-normal">Following</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Contact, Shortlist, Share, Book Model */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-3 border border-neutral-800 hover:border-neutral-500 text-xs uppercase tracking-widest font-mono text-neutral-300 hover:text-white flex items-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={handleToggleFollow}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-mono border flex items-center gap-1.5 transition-all ${
                isFollowing
                  ? "border-[#d4af37] text-black bg-[#d4af37] font-semibold shadow-lg shadow-[#d4af37]/20"
                  : "border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isFollowing ? "Following ✓" : "Follow"}</span>
            </button>

            <button
              onClick={() => setIsShortlisted(!isShortlisted)}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-mono border flex items-center gap-1.5 transition-all ${
                isShortlisted
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                  : "border-neutral-800 hover:border-neutral-500 text-neutral-300"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
            </button>

            <Link
              href={`/models/${profile.username}/comp-card`}
              className="px-4 py-3 border border-[#d4af37]/60 hover:border-[#d4af37] text-xs uppercase tracking-widest font-mono text-[#d4af37] flex items-center gap-1.5 transition-colors"
            >
              <span>Zed Card</span>
            </Link>

            <Button variant="primary" onClick={() => setIsBookingModalOpen(true)}>
              <Mail className="w-3.5 h-3.5 mr-2" />
              <span>Book Model</span>
            </Button>
          </div>
        </div>

        {/* TWO-COLUMN PROFILE CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
          {/* LEFT COLUMN: ABOUT, MEASUREMENTS, DETAILS, CREDENTIALS */}
          <div className="space-y-8">
            {/* About */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-3">
              <h3 className="text-xs uppercase font-mono tracking-widest text-[#d4af37]">
                01 / Professional Biography
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {profile.bio || "No biography currently published."}
              </p>
            </div>

            {/* Structured Measurements with Privacy Control */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-[#d4af37]">
                    02 / Measurements
                  </h3>
                  {profile.measurements?.is_restricted && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                      <Lock className="w-3 h-3" />
                      <span>Protected</span>
                    </span>
                  )}
                </div>

                {/* Owner Privacy Selector */}
                {isOwner ? (
                  <select
                    className="bg-neutral-900 text-[10px] uppercase font-mono text-neutral-300 border border-neutral-800 px-2 py-1 focus:outline-none"
                    value={profile.measurements?.visibility || "public"}
                    onChange={(e) => handlePrivacyChange(e.target.value)}
                  >
                    <option value="public">Visibility: Public</option>
                    <option value="verified_only">Verified Only</option>
                    <option value="brands_only">Brands Only</option>
                    <option value="private">Private</option>
                  </select>
                ) : (
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    {profile.measurements?.visibility?.replace("_", " ") || "Public"}
                  </span>
                )}
              </div>

              {profile.measurements?.is_restricted ? (
                /* RESTRICTED MEASUREMENTS CARD */
                <div className="p-6 text-center border border-dashed border-neutral-800 bg-neutral-900/30 space-y-3">
                  <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-serif text-white">Measurements Confidential</h4>
                  <p className="text-xs text-neutral-400">
                    This talent has restricted full dimensional measurements to{" "}
                    <span className="text-neutral-200 uppercase font-mono text-[10px]">
                      {profile.measurements?.visibility?.replace("_", " ")}
                    </span>
                    .
                  </p>
                  <Link
                    href="/login"
                    className="inline-block mt-2 text-xs uppercase tracking-widest font-mono text-[#d4af37] border-b border-[#d4af37] pb-0.5 hover:text-white"
                  >
                    Sign In as Verified Brand to Unlock
                  </Link>
                </div>
              ) : (
                /* PUBLIC / AUTHORIZED MEASUREMENTS GRID */
                <>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[10px]">BUST / CHEST</span>
                      <span className="text-white font-medium">
                        {profile.measurements?.bust || profile.measurements?.chest || 33.0}&quot;
                      </span>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[10px]">WAIST</span>
                      <span className="text-white font-medium">{profile.measurements?.waist || 24.0}&quot;</span>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[10px]">HIPS</span>
                      <span className="text-white font-medium">{profile.measurements?.hips || 35.0}&quot;</span>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[10px]">INSEAM</span>
                      <span className="text-white font-medium">{profile.measurements?.inseam || 33.0}&quot;</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-900 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-900/60">
                      <span className="text-neutral-500">Shoe Size</span>
                      <span className="text-neutral-200 font-mono">{profile.shoe_size || "39 EU"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-900/60">
                      <span className="text-neutral-500">Hair</span>
                      <span className="text-neutral-200 font-mono">{profile.hair_color || "Dark Blonde"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-900/60">
                      <span className="text-neutral-500">Eyes</span>
                      <span className="text-neutral-200 font-mono">{profile.eye_color || "Green"}</span>
                    </div>
                    {profile.languages && (
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-500">Languages</span>
                        <span className="text-neutral-200 font-mono">{profile.languages}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Experience Timeline */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                <h3 className="text-xs uppercase font-mono tracking-widest text-[#d4af37]">
                  03 / Career Timeline
                </h3>
                {isOwner && (
                  <button
                    onClick={() => setIsAddExperienceModalOpen(true)}
                    className="text-[10px] uppercase font-mono text-white hover:text-[#d4af37] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Credit</span>
                  </button>
                )}
              </div>

              {profile.experiences?.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((exp: any, i: number) => (
                    <div key={i} className="border-l-2 border-[#d4af37] pl-3 py-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{exp.company_or_brand}</span>
                        <span className="font-mono text-neutral-500 text-[10px]">{exp.year}</span>
                      </div>
                      <p className="text-xs text-neutral-300">{exp.campaign_title}</p>
                      <p className="text-[11px] text-neutral-500">{exp.description || exp.role_title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No previous experiences published.</p>
              )}
            </div>

            {/* Achievements & Honors */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                <h3 className="text-xs uppercase font-mono tracking-widest text-[#d4af37]">
                  04 / Achievements & Honors
                </h3>
                {isOwner && (
                  <button
                    onClick={() => setIsAddAchievementModalOpen(true)}
                    className="text-[10px] uppercase font-mono text-white hover:text-[#d4af37] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {profile.achievements?.length > 0 ? (
                <div className="space-y-3">
                  {profile.achievements.map((ach: any, i: number) => (
                    <div key={i} className="p-3 bg-neutral-900/50 border border-neutral-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#d4af37] uppercase">
                          {ach.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">{ach.year}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-neutral-400">{ach.organization_or_event}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No honors registered yet.</p>
              )}
            </div>

            {/* Social Links */}
            {profile.social_links && (
              <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-widest text-[#d4af37]">
                  05 / Verified Handles
                </h3>
                <div className="space-y-2 text-xs">
                  {profile.social_links.instagram && (
                    <a
                      href={`https://instagram.com/${profile.social_links.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-neutral-900 hover:bg-neutral-800 transition-colors text-neutral-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>@{profile.social_links.instagram}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </a>
                  )}
                  {profile.social_links.website && (
                    <a
                      href={profile.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-neutral-900 hover:bg-neutral-800 transition-colors text-neutral-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Portfolio Website</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PORTFOLIO GRID & EDITORIAL LOOKS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif text-white">Editorial Portfolio</h2>
                {isOwner && (
                  <button
                    onClick={() => setIsAddPortfolioModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-black text-[10px] uppercase font-mono font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Upload Tear-Sheet</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {portfolioTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 border transition-all ${
                      activeTab === tab
                        ? "border-white bg-white text-black font-semibold"
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            {filteredPortfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPortfolio.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxItem(item)}
                    className="group relative bg-neutral-950 border border-neutral-900 overflow-hidden aspect-[3/4] cursor-pointer"
                  >
                    <img
                      src={getMediaUrl(item.media_url)}
                      alt={item.caption || "Editorial"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Category Overlay Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-neutral-800 text-[#d4af37]">
                        {item.category}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePortfolio(item.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-black/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 z-10"
                        title="Delete Tear-Sheet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Hover Caption Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                      {item.caption && <h4 className="text-sm text-white font-serif">{item.caption}</h4>}
                      {item.photographer_credit && (
                        <p className="text-[11px] text-neutral-300 font-mono mt-1">Photo: {item.photographer_credit}</p>
                      )}
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37] mt-2">
                        Click to expand tear-sheet credits →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-neutral-900">
                <p className="text-neutral-500 font-serif text-sm">No portfolio items in this category.</p>
              </div>
            )}

            {/* Professional Peer & Brand Reviews */}
            <div className="pt-8 border-t border-neutral-900 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-white">Verified Client Endorsements</h3>
                  <p className="text-xs text-neutral-400">
                    Industry feedback from fashion houses, casting teams, and photographers.
                  </p>
                </div>

                {!isOwner && currentUser && (
                  <Button variant="outline" size="sm" onClick={() => setIsAddReviewModalOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    <span>Leave Endorsement</span>
                  </Button>
                )}
              </div>

              {profile.reviews?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.reviews.map((rev: any, i: number) => (
                    <div key={i} className="bg-neutral-950 border border-neutral-800 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#d4af37]">
                          {Array.from({ length: rev.rating }).map((_, r) => (
                            <Star key={r} className="w-3.5 h-3.5 fill-[#d4af37]" />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {rev.reviewer_role}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 italic font-serif leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>
                      <div className="pt-2 border-t border-neutral-900 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                        <span className="text-white font-medium">{rev.reviewer_name}</span>
                        <span>{rev.reviewer_company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-neutral-900">
                  <p className="text-xs text-neutral-500 font-mono">No reviews posted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: PORTFOLIO LIGHTBOX WITH FULL PRODUCTION CREDITS */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(lightboxItem)}
        onClose={() => setLightboxItem(null)}
        title={lightboxItem?.caption || "Portfolio Tear-Sheet"}
        subtitle={`Category: ${lightboxItem?.category || "Editorial"}`}
        maxWidth="2xl"
      >
        {lightboxItem && (
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-black overflow-hidden border border-neutral-800">
              <img
                src={getMediaUrl(lightboxItem.media_url)}
                alt={lightboxItem.caption || "Preview"}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">CATEGORY</span>
                <span className="text-[#d4af37] font-semibold">{lightboxItem.category}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">PHOTOGRAPHER</span>
                <span className="text-white">{lightboxItem.photographer_credit || "Studio Editorial"}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">STYLIST</span>
                <span className="text-white">{lightboxItem.stylist_credit || "Haute Couture Team"}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">CLIENT / BRAND</span>
                <span className="text-white">{lightboxItem.brand_credit || "Published Editorial"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 block text-[10px]">VERIFICATION STATUS</span>
                <span className="text-emerald-400 font-semibold">✓ Tear-Sheet Authenticated</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: VERIFICATION BADGES BREAKDOWN & REQUEST SUBMIT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Trust & Verification Tiers"
        subtitle="CMID MODEL HOUSE institutional standards for models & casting teams"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white">Identity Verified</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {profile.is_identity_verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Government photographic ID & live biometric confirmation. Eliminates impersonation.
              </p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white">Portfolio Authenticated</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {profile.is_portfolio_verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Editorial tear-sheets and campaign photos matched against accredited publications.
              </p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white">Measurements Certified</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {profile.is_measurements_verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Certified physical dimensions audited by mother agencies or recognized casting directors.
              </p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white">Agency Representation</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {profile.is_agency_verified ? "VERIFIED" : "INDEPENDENT"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Contractual mother agency affiliation verified via official agency roaster channels.
              </p>
            </div>
          </div>

          {/* If Owner: Submit Verification Evidence Form */}
          {isOwner && (
            <div className="pt-4 border-t border-neutral-900 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                Submit Verification Evidence
              </h4>

              {verificationSubmitted ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  Verification request submitted. Our compliance team will audit your documents within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleSubmitVerification} className="space-y-3">
                  <Select
                    label="Verification Category"
                    value={verificationForm.verification_type}
                    onChange={(e) => setVerificationForm({ ...verificationForm, verification_type: e.target.value })}
                    options={[
                      { label: "Government Identity Check", value: "identity" },
                      { label: "Portfolio Tear-Sheet Authentication", value: "portfolio" },
                      { label: "Certified Measurements Verification", value: "measurements" },
                      { label: "Agency Representation Letter", value: "agency" },
                    ]}
                  />

                  <Input
                    label="Document / Proof URL or Upload Link"
                    placeholder="https://..."
                    value={verificationForm.document_url}
                    onChange={(e) => setVerificationForm({ ...verificationForm, document_url: e.target.value })}
                    required
                  />

                  <Input
                    label="Supporting Notes"
                    placeholder="e.g. Attached official Mother Agency agreement 2026"
                    value={verificationForm.notes}
                    onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                  />

                  <Button type="submit" variant="gold" className="w-full">
                    Submit for Official Badge
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: DIRECT BOOKING INQUIRY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={`Book ${profile.full_name}`}
        subtitle="Submit a formal casting proposal or commercial booking inquiry"
        maxWidth="lg"
      >
        {bookingSuccess ? (
          <div className="p-6 text-center space-y-3 bg-emerald-950/30 border border-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-serif text-white">Booking Proposal Dispatched</h4>
            <p className="text-xs text-neutral-300">
              Your inquiry has been sent to {profile.full_name} and their representation. You will receive real-time notification upon response.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <Input
              label="Project / Campaign Name"
              placeholder="e.g. Winter Haute Couture Lookbook 2026"
              value={bookingForm.projectName}
              onChange={(e) => setBookingForm({ ...bookingForm, projectName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Shoot Date"
                type="date"
                value={bookingForm.shootDate}
                onChange={(e) => setBookingForm({ ...bookingForm, shootDate: e.target.value })}
                required
              />
              <Input
                label="Shoot Location"
                placeholder="e.g. Paris / Studio 4"
                value={bookingForm.location}
                onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                required
              />
            </div>

            <Input
              label="Compensation / Day Rate Offer"
              placeholder="e.g. €3,500 / Day or ₹2,50,000"
              value={bookingForm.budget}
              onChange={(e) => setBookingForm({ ...bookingForm, budget: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                Scope & Requirements
              </label>
              <textarea
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 p-3 text-xs focus:outline-none focus:border-white"
                placeholder="Details regarding wardrobe fittings, runway calls, licensing, or hair/makeup provisions..."
                value={bookingForm.message}
                onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2">
              Send Formal Booking Proposal
            </Button>
          </form>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: ADD PORTFOLIO ITEM (OWNER ONLY) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddPortfolioModalOpen}
        onClose={() => setIsAddPortfolioModalOpen(false)}
        title="Upload Editorial Tear-Sheet"
        subtitle="Add high-resolution portfolio images with full production credits"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPortfolio} className="space-y-4">
          <Input
            label="Media Image URL"
            placeholder="https://images.unsplash.com/..."
            value={newPortfolio.media_url}
            onChange={(e) => setNewPortfolio({ ...newPortfolio, media_url: e.target.value })}
            required
          />

          <Select
            label="Portfolio Category"
            value={newPortfolio.category}
            onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })}
            options={[
              { label: "Editorial", value: "Editorial" },
              { label: "Runway", value: "Runway" },
              { label: "Commercial", value: "Commercial" },
              { label: "Beauty", value: "Beauty" },
              { label: "Fitness", value: "Fitness" },
              { label: "Jewellery", value: "Jewellery" },
              { label: "Campaigns", value: "Campaigns" },
            ]}
          />

          <Input
            label="Caption / Title"
            placeholder="e.g. Vogue Monolith Editorial Spread"
            value={newPortfolio.caption}
            onChange={(e) => setNewPortfolio({ ...newPortfolio, caption: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Photographer Credit"
              placeholder="e.g. Marcus Vance"
              value={newPortfolio.photographer_credit}
              onChange={(e) => setNewPortfolio({ ...newPortfolio, photographer_credit: e.target.value })}
            />
            <Input
              label="Stylist Credit"
              placeholder="e.g. Jean-Luc Moreau"
              value={newPortfolio.stylist_credit}
              onChange={(e) => setNewPortfolio({ ...newPortfolio, stylist_credit: e.target.value })}
            />
          </div>

          <Button type="submit" variant="gold" className="w-full mt-2">
            Publish to Portfolio
          </Button>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: ADD EXPERIENCE (OWNER ONLY) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddExperienceModalOpen}
        onClose={() => setIsAddExperienceModalOpen(false)}
        title="Add Campaign / Runway Credit"
        subtitle="Document career timeline items for brands and casting directors"
        maxWidth="lg"
      >
        <form onSubmit={handleAddExperience} className="space-y-4">
          <Input
            label="Brand / Fashion House"
            placeholder="e.g. Chanel Haute Couture"
            value={newExperience.company_or_brand}
            onChange={(e) => setNewExperience({ ...newExperience, company_or_brand: e.target.value })}
            required
          />

          <Input
            label="Campaign / Show Name"
            placeholder="e.g. Autumn Paris Runway Finale"
            value={newExperience.campaign_title}
            onChange={(e) => setNewExperience({ ...newExperience, campaign_title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Role Title"
              placeholder="e.g. Lead Runway Model"
              value={newExperience.role_title}
              onChange={(e) => setNewExperience({ ...newExperience, role_title: e.target.value })}
            />
            <Input
              label="Year"
              placeholder="2026"
              value={newExperience.year}
              onChange={(e) => setNewExperience({ ...newExperience, year: e.target.value })}
              required
            />
          </div>

          <Input
            label="Location / Details"
            placeholder="e.g. Grand Palais, Paris"
            value={newExperience.location}
            onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
          />

          <Button type="submit" variant="primary" className="w-full">
            Add Timeline Record
          </Button>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: ADD ACHIEVEMENT (OWNER ONLY) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddAchievementModalOpen}
        onClose={() => setIsAddAchievementModalOpen(false)}
        title="Add Achievement / Honor"
        subtitle="Record magazine covers, runway finales, and fashion awards"
        maxWidth="lg"
      >
        <form onSubmit={handleAddAchievement} className="space-y-4">
          <Input
            label="Achievement Title"
            placeholder="e.g. Vogue Paris Winter Cover"
            value={newAchievement.title}
            onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            required
          />

          <Select
            label="Honor Category"
            value={newAchievement.category}
            onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })}
            options={[
              { label: "Fashion Week", value: "Fashion Week" },
              { label: "Magazine Feature / Cover", value: "Magazine Feature" },
              { label: "Industry Award", value: "Award" },
              { label: "Brand Ambassadorship", value: "Brand Campaign" },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Organization / Publication"
              placeholder="e.g. Condé Nast"
              value={newAchievement.organization_or_event}
              onChange={(e) => setNewAchievement({ ...newAchievement, organization_or_event: e.target.value })}
              required
            />
            <Input
              label="Year"
              placeholder="2026"
              value={newAchievement.year}
              onChange={(e) => setNewAchievement({ ...newAchievement, year: e.target.value })}
              required
            />
          </div>

          <Button type="submit" variant="gold" className="w-full">
            Save Honor
          </Button>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 7: LEAVE REVIEW / ENDORSEMENT (VERIFIED BRANDS) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        title={`Endorse ${profile.full_name}`}
        subtitle="Provide verified professional testimonial from your production collaboration"
        maxWidth="lg"
      >
        <form onSubmit={handleAddReview} className="space-y-4">
          <Select
            label="Rating"
            value={newReview.rating.toString()}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
            options={[
              { label: "5 Stars — Exceptional Editorial Professionalism", value: "5" },
              { label: "4 Stars — Strong Performance", value: "4" },
              { label: "3 Stars — Satisfactory", value: "3" },
            ]}
          />

          <Input
            label="Campaign / Production Name"
            placeholder="e.g. Autumn Haute Couture Runway Show"
            value={newReview.project_name}
            onChange={(e) => setNewReview({ ...newReview, project_name: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">
              Professional Feedback
            </label>
            <textarea
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 p-3 text-xs focus:outline-none focus:border-white"
              placeholder="Comment on punctuality, light awareness, runway presence, and communication..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Publish Verified Endorsement
          </Button>
        </form>
      </Modal>

      {/* Floating Follow Toast Feedback */}
      {followToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#d4af37] text-black font-mono text-xs font-semibold px-4 py-2.5 shadow-2xl flex items-center gap-2 border border-black/20">
          <Check className="w-4 h-4" />
          <span>{followToast}</span>
        </div>
      )}
    </div>
  );
}
