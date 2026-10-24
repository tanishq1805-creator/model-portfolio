"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.forgotPassword(email);
      setStatusMessage(res.message || "Password recovery instructions have been dispatched.");
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 sm:p-10 space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-white">Reset Password</h1>
          <p className="text-xs text-neutral-400">
            Enter the email address tied to your CMID MODEL HOUSE profile. We will verify your credentials and send a reset token.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="model@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Send Reset Instructions
          </Button>
        </form>
      </div>
    </div>
  );
}
