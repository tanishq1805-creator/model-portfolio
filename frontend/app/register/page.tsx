"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Building2,
  Users2,
  Camera,
  Film,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

const ROLES = [
  {
    id: "MODEL",
    title: "I'm a Model",
    tagline: "Build your verified digital identity, showcase portfolio tear-sheets, and get discovered by top luxury brands.",
    icon: Sparkles,
  },
  {
    id: "BRAND",
    title: "I'm a Brand",
    tagline: "Search models by exact dimensional measurements, post casting calls, and coordinate direct bookings.",
    icon: Building2,
  },
  {
    id: "AGENCY",
    title: "I'm an Agency",
    tagline: "Manage represented talent rosters, negotiate bookings, and track global casting opportunities.",
    icon: Users2,
  },
  {
    id: "PHOTOGRAPHER",
    title: "I'm a Photographer",
    tagline: "Showcase creative editorials, tag verified models in tear-sheets, and collaborate on productions.",
    icon: Camera,
  },
  {
    id: "CASTING_DIRECTOR",
    title: "I'm a Casting Director",
    tagline: "Publish casting calls, filter submissions with AI matching, and shortlist candidates seamlessly.",
    icon: Film,
  },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "MODEL";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole.toUpperCase());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.register({
        email,
        password,
        role: selectedRole,
      });

      if (res.user.role === "MODEL") {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 p-8 sm:p-12 space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-neutral-500 border-b border-neutral-900 pb-4">
          <span>CMID MODEL HOUSE REGISTRATION</span>
          <span>STEP {step} OF 2</span>
        </div>

        {step === 1 ? (
          /* STEP 1: What brings you here? */
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
                Identity Selection
              </span>
              <h1 className="text-3xl font-serif text-white">What brings you here?</h1>
              <p className="text-xs text-neutral-400">
                Select your primary industry role. Your account and dashboard experience will be tailored to your workflow.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`cursor-pointer p-4 border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? "border-white bg-neutral-900/90"
                        : "border-neutral-900 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/40"
                    }`}
                  >
                    <div
                      className={`p-2.5 border shrink-0 ${
                        isSelected
                          ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                          : "border-neutral-800 text-neutral-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white tracking-wide">{role.title}</h3>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{role.tagline}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link href="/login" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white">
                Already have an account? Sign In
              </Link>
              <Button onClick={() => setStep(2)}>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Credentials Form */
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37] hover:underline"
              >
                ← Back to role selection
              </button>
              <h1 className="text-3xl font-serif text-white">Create Your Account</h1>
              <p className="text-xs text-neutral-400">
                Registering as: <span className="text-white font-mono uppercase font-semibold">{selectedRole}</span>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@agency.com or talent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-[11px] text-neutral-500 leading-relaxed">
              By creating an account, you agree to CMID MODEL HOUSE&apos;s Professional Standards, Privacy Protections, and Verification Terms.
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link href="/login" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white">
                Sign In Instead
              </Link>
              <Button type="submit" isLoading={isLoading}>
                Complete Registration
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
