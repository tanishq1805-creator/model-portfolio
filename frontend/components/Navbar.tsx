"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  Sparkles,
  Bell,
  Settings,
  ChevronDown,
  FileText,
  Calendar,
  CreditCard,
  Building,
  Bookmark,
} from "lucide-react";
import { getToken, getStoredUser, removeToken, api } from "@/lib/api";
import { SettingsModal } from "@/components/SettingsModal";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpsDropdownOpen, setIsOpsDropdownOpen] = useState(false);
  const opsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const u = getStoredUser();
      setUser(u);
      api.notifications.list(10).then((res) => {
        setUnreadNotifs(res.unread_count || 0);
      }).catch(() => {});
    } else {
      setUser(null);
      setUnreadNotifs(0);
    }
  }, [pathname]);

  // Close operations dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (opsDropdownRef.current && !opsDropdownRef.current.contains(e.target as Node)) {
        setIsOpsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    router.push("/");
  };

  // Primary direct navigation items
  const primaryLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Discover", href: "/discover" },
    { label: "Castings", href: "/castings" },
    { label: "Bookings", href: "/bookings" },
  ];

  // Secondary Operations & Production dropdown items
  const opsLinks = [
    { label: "Call Sheets", href: "/call-sheets", desc: "Run-of-show schedules & check-in", icon: FileText },
    { label: "Calendar", href: "/calendar", desc: "Day-by-day availability & holds", icon: Calendar },
    { label: "Finances", href: "/finances", desc: "20% commission splits & escrow", icon: CreditCard },
    { label: "Agencies", href: "/agencies", desc: "Representation network directory", icon: Building },
    { label: "Shortlists", href: "/shortlists", desc: "Curated talent casting boards", icon: Bookmark },
  ];

  const isAdmin = user?.role === "ADMIN";
  const isOpsActive = opsLinks.some((l) => pathname === l.href);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-neutral-900/90 shadow-2xl transition-all h-[68px]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-full flex items-center justify-between">
          {/* Brand Logo placed at far top-left */}
          <Link href="/" className="group flex items-center gap-2 flex-shrink-0">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] font-light text-white group-hover:text-neutral-300 transition-colors whitespace-nowrap">
              CMID <span className="font-bold text-[#d4af37]">MODEL HOUSE</span>
            </span>
          </Link>

          {/* Spacious Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {primaryLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] transition-colors py-2 relative font-mono ${
                  pathname === link.href ? "text-[#d4af37] font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
                )}
              </Link>
            ))}

            {/* Operations Dropdown */}
            <div className="relative" ref={opsDropdownRef}>
              <button
                onClick={() => setIsOpsDropdownOpen(!isOpsDropdownOpen)}
                className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-colors py-2 font-mono ${
                  isOpsActive || isOpsDropdownOpen ? "text-[#d4af37] font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>Operations</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-950 border border-neutral-800 shadow-2xl py-2 z-50">
                  {opsLinks.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setIsOpsDropdownOpen(false)}
                        className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                          pathname === sub.href ? "bg-neutral-900 text-[#d4af37]" : "hover:bg-neutral-900/60 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-mono uppercase tracking-wider font-medium">{sub.label}</div>
                          <div className="text-[10px] text-neutral-500 font-sans">{sub.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className={`text-xs uppercase tracking-[0.2em] transition-colors font-mono ${
                  pathname === "/admin" ? "text-red-400 font-semibold" : "text-red-400/80 hover:text-red-300"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Tools: Notifications, Settings, Auth */}
          <div className="hidden sm:flex items-center gap-3.5">
            {/* Settings Gear Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Platform Settings & Account Switcher"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-none border border-transparent hover:border-neutral-800 transition-all"
            >
              <Settings className="w-4 h-4 text-neutral-300 hover:text-[#d4af37]" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <Link
                  href="/notifications"
                  title="Real-Time Notifications"
                  className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-none border border-transparent hover:border-neutral-800 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[15px] h-[15px] text-[9px] font-bold font-mono bg-[#d4af37] text-black rounded-full flex items-center justify-center">
                      {unreadNotifs}
                    </span>
                  )}
                </Link>

                {user.role === "MODEL" && (
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2.5 py-1.5 hover:bg-[#d4af37]/20 transition-all font-mono"
                  >
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    <span>{user.onboarding_completed ? "Edit Identity" : "Complete Profile"}</span>
                  </Link>
                )}

                {user.username && (
                  <Link
                    href={`/models/${user.username}`}
                    className="text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white"
                  >
                    @{user.username}
                  </Link>
                )}

                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {user.role}
                </span>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-[0.18em] text-neutral-300 hover:text-white px-3 py-2 transition-colors font-mono"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] font-semibold text-black bg-white hover:bg-neutral-200 px-4 py-2 transition-all font-mono"
                >
                  Join Network
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-neutral-400 hover:text-white"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-[#d4af37]" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-neutral-950/98 border-b border-neutral-900 px-6 py-6 space-y-4 backdrop-blur-2xl max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col space-y-2.5 font-mono">
              <span className="text-[10px] uppercase text-neutral-500 tracking-widest">Main Menu</span>
              {primaryLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm uppercase tracking-widest py-1 ${
                    pathname === link.href ? "text-[#d4af37] font-bold" : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <span className="text-[10px] uppercase text-neutral-500 tracking-widest pt-2">Operations & Production</span>
              {opsLinks.map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm uppercase tracking-widest py-1 flex items-center justify-between ${
                    pathname === sub.href ? "text-[#d4af37] font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{sub.label}</span>
                  <span className="text-[10px] text-neutral-600 font-sans">{sub.desc.split(" ")[0]}</span>
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-sm uppercase tracking-widest text-red-400 hover:text-red-300 py-1"
                >
                  Admin Panel
                </Link>
              )}

              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm uppercase tracking-widest text-[#d4af37] py-1 flex items-center justify-between"
              >
                <span>Notifications</span>
                {unreadNotifs > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#d4af37] text-black rounded-full font-mono">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            </nav>

            <div className="pt-4 border-t border-neutral-900 flex flex-col gap-3 font-mono">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="text-left text-xs uppercase tracking-widest text-[#d4af37] py-1 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Open Settings & Theme</span>
              </button>

              {user ? (
                <>
                  <div className="text-xs text-neutral-400">
                    Signed in as <span className="text-white font-medium">{user.email}</span> ({user.role})
                  </div>
                  {user.role === "MODEL" && (
                    <Link
                      href="/onboarding"
                      onClick={() => setIsOpen(false)}
                      className="text-center text-xs uppercase tracking-widest text-black bg-[#d4af37] font-semibold py-2.5"
                    >
                      Onboarding & Profile Setup
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-left text-xs uppercase tracking-widest text-rose-400 py-1"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-xs uppercase tracking-widest border border-neutral-800 text-white py-2.5 hover:bg-neutral-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-xs uppercase tracking-widest bg-white text-black font-semibold py-2.5 hover:bg-neutral-200"
                  >
                    Join Network
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
