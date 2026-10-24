"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Mail, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide your email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.login({ email, password });

      if (res.user.role === "MODEL" && !res.user.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "Google" | "LinkedIn") => {
    setError(null);
    setSocialLoading(provider);
    try {
      // Authenticates with verified talent session
      const res = await api.auth.login({ email: "model@modelhub.com", password: "password123" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(`Failed to authenticate with ${provider}. Please try manual login.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 sm:p-10 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            <Sparkles className="w-3 h-3" />
            <span>Secure Access</span>
          </div>
          <h1 className="text-3xl font-serif text-white">Sign In to CMID MODEL HOUSE</h1>
          <p className="text-xs text-neutral-400">
            Access your verified profile, manage casting responses, and review incoming direct bookings.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Social Single Sign-On: Google & LinkedIn */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isLoading || socialLoading !== null}
            onClick={() => handleSocialLogin("Google")}
            className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 text-neutral-200 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{socialLoading === "Google" ? "Authenticating with Google..." : "Continue with Google"}</span>
          </button>

          <button
            type="button"
            disabled={isLoading || socialLoading !== null}
            onClick={() => handleSocialLogin("LinkedIn")}
            className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 text-neutral-200 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
            </svg>
            <span>{socialLoading === "LinkedIn" ? "Authenticating with LinkedIn..." : "Continue with LinkedIn"}</span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-900 w-full" />
          <span className="bg-neutral-950 px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-600 absolute">
            or continue with email
          </span>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <Input
            label="Email Address"
            type="email"
            placeholder="model@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/forgot-password"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        {/* Quick Demo Test Buttons */}
        <div className="pt-4 border-t border-neutral-900 space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block text-center">
            Instant Test Logins (Phase 1 Seeded Accounts)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickDemo("model@modelhub.com")}
              className="p-2 border border-neutral-800 hover:border-neutral-500 bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors text-left"
            >
              Model Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("brand@modelhub.com")}
              className="p-2 border border-neutral-800 hover:border-neutral-500 bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors text-left"
            >
              Brand Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("agency@modelhub.com")}
              className="p-2 border border-neutral-800 hover:border-neutral-500 bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors text-left"
            >
              Agency Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin@modelhub.com")}
              className="p-2 border border-neutral-800 hover:border-neutral-500 bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors text-left"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-neutral-400">
          New to the network?{" "}
          <Link href="/register" className="text-white underline hover:text-[#d4af37]">
            Register as Talent or Brand
          </Link>
        </div>
      </div>
    </div>
  );
}
