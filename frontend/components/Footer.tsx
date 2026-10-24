"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-neutral-900 text-neutral-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-900">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block font-serif text-xl sm:text-2xl tracking-[0.18em] font-light text-white">
              CMID <span className="font-bold text-[#d4af37]">MODEL HOUSE</span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              The premier professional talent discovery and verified identity ecosystem built specifically for models, luxury brands, agencies, and casting directors.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Verified Industry Standards</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/#discover" className="hover:text-white transition-colors">Editorial Talent</Link></li>
              <li><Link href="/#discover" className="hover:text-white transition-colors">Runway Roster</Link></li>
              <li><Link href="/#discover" className="hover:text-white transition-colors">Commercial & Print</Link></li>
              <li><Link href="/#discover" className="hover:text-white transition-colors">High Jewellery</Link></li>
              <li><Link href="/#discover" className="hover:text-white transition-colors">Fitness & Movement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/#castings" className="hover:text-white transition-colors">Casting Calls</Link></li>
              <li><Link href="/#matching" className="hover:text-white transition-colors">AI Smart Matching</Link></li>
              <li><Link href="/#identity" className="hover:text-white transition-colors">Verified Identity</Link></li>
              <li><Link href="/#verification" className="hover:text-white transition-colors">Trust Badges</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Agency Representation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Access
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Join as a Model</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Hire Talent as Brand</Link></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Model Onboarding</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 font-mono">
          <p>© {new Date().getFullYear()} CMID MODEL HOUSE. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span>PRIVACY DISCLOSURES</span>
            <span>MEASUREMENT PROTECTION</span>
            <span>TERMS OF REPRESENTATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
