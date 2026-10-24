"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  X,
  Moon,
  Sun,
  Monitor,
  User,
  LogOut,
  RefreshCw,
  Bell,
  DollarSign,
  ShieldCheck,
  Check,
  Sparkles,
  Palette,
} from "lucide-react";
import { api, getStoredUser, setToken, setStoredUser, removeToken } from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"appearance" | "accounts" | "preferences">("appearance");
  const [currentTheme, setCurrentTheme] = useState<string>("dark");
  const [currency, setCurrency] = useState<string>("INR");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom login state
  const [customLogin, setCustomLogin] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const u = getStoredUser();
      setCurrentUser(u);
      const savedTheme = localStorage.getItem("cmid_theme") || "dark";
      setCurrentTheme(savedTheme);
      const savedCurr = localStorage.getItem("cmid_currency") || "INR";
      setCurrency(savedCurr);
    }
  }, [isOpen]);

  const applyTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("cmid_theme", theme);

    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light-theme");
    } else {
      root.classList.add("dark");
      root.classList.remove("light-theme");
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    localStorage.setItem("cmid_currency", curr);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    setLoginError("");
    try {
      const res = await api.auth.login({ email, password: "password123" });
      setCurrentUser(res.user);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || "Failed to switch accounts");
    } finally {
      setSwitching(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwitching(true);
    setLoginError("");
    try {
      const res = await api.auth.login(customLogin);
      setCurrentUser(res.user);
      setCustomLogin({ email: "", password: "" });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    onClose();
    router.push("/");
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-[#d4af37]" />
            <h3 className="font-serif text-lg text-white font-medium">Platform Settings & Accounts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/30 text-xs font-mono">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "appearance"
                ? "border-[#d4af37] text-white bg-neutral-900/60 font-semibold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Appearance & Theme</span>
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "accounts"
                ? "border-[#d4af37] text-white bg-neutral-900/60 font-semibold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Accounts & Switching</span>
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "preferences"
                ? "border-[#d4af37] text-white bg-neutral-900/60 font-semibold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Save confirmation toast */}
        {saveSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 px-6 py-2 text-xs flex items-center gap-2 font-mono">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: APPEARANCE & THEME */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#d4af37] mb-1">
                  Interface Theme Mode
                </h4>
                <p className="text-xs text-neutral-400">
                  Select your visual presentation aesthetic. Optimized for editorial runways and production rooms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark Studio Theme */}
                <div
                  onClick={() => applyTheme("dark")}
                  className={`cursor-pointer p-4 border rounded-none transition-all ${
                    currentTheme === "dark"
                      ? "border-[#d4af37] bg-neutral-900/80 ring-1 ring-[#d4af37]"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Moon className="w-5 h-5 text-[#d4af37]" />
                    {currentTheme === "dark" && <Check className="w-4 h-4 text-[#d4af37]" />}
                  </div>
                  <h5 className="font-serif text-white font-medium">Studio Dark</h5>
                  <p className="text-[11px] text-neutral-400 mt-1">High-fashion black with champagne gold accents (Default)</p>
                </div>

                {/* Light Editorial Theme */}
                <div
                  onClick={() => applyTheme("light")}
                  className={`cursor-pointer p-4 border rounded-none transition-all ${
                    currentTheme === "light"
                      ? "border-[#d4af37] bg-neutral-900/80 ring-1 ring-[#d4af37]"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Sun className="w-5 h-5 text-amber-300" />
                    {currentTheme === "light" && <Check className="w-4 h-4 text-[#d4af37]" />}
                  </div>
                  <h5 className="font-serif text-white font-medium">Editorial Light</h5>
                  <p className="text-[11px] text-neutral-400 mt-1">Crisp high-contrast gallery white palette for bright day shoots</p>
                </div>

                {/* System / Monochrome Theme */}
                <div
                  onClick={() => applyTheme("monochrome")}
                  className={`cursor-pointer p-4 border rounded-none transition-all ${
                    currentTheme === "monochrome"
                      ? "border-[#d4af37] bg-neutral-900/80 ring-1 ring-[#d4af37]"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Monitor className="w-5 h-5 text-neutral-400" />
                    {currentTheme === "monochrome" && <Check className="w-4 h-4 text-[#d4af37]" />}
                  </div>
                  <h5 className="font-serif text-white font-medium">Monochrome Noir</h5>
                  <p className="text-[11px] text-neutral-400 mt-1">Deep OLED charcoal with pure architectural silver typography</p>
                </div>
              </div>

              {/* Design System Details */}
              <div className="bg-neutral-900/40 border border-neutral-900 p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Design Framework</span>
                <p className="text-xs text-neutral-300">
                  Typography: Playfair Display Editorial Serif & Inter Sans-Serif • Accent: Champagne Gold (#d4af37) • Contrast Ratio: AAA Verified.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNTS & SWITCHING */}
          {activeTab === "accounts" && (
            <div className="space-y-6">
              {currentUser ? (
                <div className="bg-neutral-900/60 border border-neutral-800 p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#d4af37]">Currently Signed In</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">{currentUser.email}</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Role: <strong className="text-neutral-200">{currentUser.role}</strong> · @{currentUser.username || "user"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-rose-400 border border-rose-900 hover:bg-rose-950/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-neutral-400">
                  Not currently signed in. Log in below or use a 1-click test profile.
                </div>
              )}

              {/* 1-Click Role Switcher */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#d4af37] mb-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Role Switcher</span>
                </h4>
                <p className="text-xs text-neutral-400 mb-3">
                  Instantly switch into any role for evaluation and test workflows:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { role: "Model / Talent", email: "model@modelhub.com", desc: "Elena / Siddharth (Casting & Call Sheets)" },
                    { role: "Brand / Production", email: "brand@modelhub.com", desc: "Vogue / Condé Nast (Post Castings & Invoicing)" },
                    { role: "Model Agency", email: "agency@modelhub.com", desc: "Elite Representation (Roster & Commissions)" },
                    { role: "Platform Admin", email: "admin@modelhub.com", desc: "Superuser (Verification Moderation)" },
                  ].map((d) => (
                    <button
                      key={d.email}
                      disabled={switching || currentUser?.email === d.email}
                      onClick={() => handleQuickSwitch(d.email)}
                      className={`p-3 text-left border transition-all ${
                        currentUser?.email === d.email
                          ? "border-[#d4af37] bg-neutral-900"
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span>{d.role}</span>
                        {currentUser?.email === d.email && <span className="text-[10px] text-[#d4af37] font-mono">ACTIVE</span>}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{d.email}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Login Form */}
              <div className="border-t border-neutral-800 pt-5">
                <h4 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-3">
                  Or Log In with Specific Credentials
                </h4>
                {loginError && (
                  <div className="p-2 mb-3 bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {loginError}
                  </div>
                )}
                <form onSubmit={handleCustomLogin} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={customLogin.email}
                      onChange={(e) => setCustomLogin({ ...customLogin, email: e.target.value })}
                      className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={customLogin.password}
                      onChange={(e) => setCustomLogin({ ...customLogin, password: e.target.value })}
                      className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={switching}
                    className="w-full py-2 bg-neutral-900 border border-neutral-700 text-xs uppercase font-mono text-white hover:border-[#d4af37] transition-colors"
                  >
                    {switching ? "Authenticating..." : "Sign In with Account"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES & CURRENCY */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#d4af37] mb-1">
                  Accounting & Display Currency
                </h4>
                <p className="text-xs text-neutral-400">
                  Set standard invoicing and booking quote currency across commercial workflows.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 font-mono text-xs">
                  {[
                    { code: "INR", label: "₹ INR (Indian Rupee)" },
                    { code: "USD", label: "$ USD (US Dollar)" },
                    { code: "EUR", label: "€ EUR (Euro)" },
                    { code: "GBP", label: "£ GBP (British Pound)" },
                  ].map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencyChange(c.code)}
                      className={`p-2.5 border text-center transition-all ${
                        currency === c.code
                          ? "border-[#d4af37] bg-neutral-900 text-white font-semibold"
                          : "border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="border-t border-neutral-800 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-widest text-white">Audio Chimes & Call Alerts</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Play subtle editorial chime when new booking offers arrive</p>
                  </div>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      soundEnabled ? "bg-[#d4af37]" : "bg-neutral-800"
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        soundEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-6 py-3.5 bg-neutral-900/60 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>CMID MODEL HOUSE v1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#d4af37] text-black font-semibold uppercase tracking-wider hover:bg-[#e5c158]"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
