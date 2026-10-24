"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Printer, ArrowLeft, CheckCircle, ShieldCheck, QrCode,
  Building2, MapPin, Share2
} from "lucide-react";
import Link from "next/link";
import { api, getMediaUrl } from "@/lib/api";

export default function DigitalCompCardPage() {
  const { username } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadCompCard();
  }, [username]);

  async function loadCompCard() {
    setLoading(true);
    try {
      const res = await api.models.getCompCard(username as string);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
        <p className="text-base">Comp Card could not be loaded for @{username}.</p>
        <Link href={`/models/${username}`} className="text-[#d4af37] text-xs uppercase tracking-widest font-mono hover:underline">
          ← Back to Model Profile
        </Link>
      </div>
    );
  }

  const { model, stats, editorial_looks, digital_stamp } = data;

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6">
      {/* Top action bar (hidden during print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-zinc-800 print:hidden">
        <Link
          href={`/models/${model.username}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/bookings`}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
          >
            Direct Bookings
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors shadow-lg"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Zed Card
          </button>
        </div>
      </div>

      {/* COMP CARD CANVAS (Structured for standard A4 / Fashion agency composite) */}
      <div className="max-w-4xl mx-auto my-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800 print:border-black pb-4 mb-8 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#d4af37] print:text-black">
              Official Composite Card · CMID MODEL HOUSE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight font-light print:text-black">
                {model.full_name}
              </h1>
              {model.is_verified && (
                <CheckCircle className="w-5 h-5 text-[#d4af37] print:text-black shrink-0" />
              )}
            </div>
            <p className="text-xs text-zinc-400 print:text-zinc-600 font-mono mt-0.5">
              @{model.username} {model.city ? `· ${model.city}, ${model.country || ""}` : ""}
            </p>
          </div>

          {model.agency_name && (
            <div className="sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 print:text-zinc-600 block">
                Representation
              </span>
              <p className="text-sm font-semibold text-[#d4af37] print:text-black mt-0.5">
                {model.agency_name}
              </p>
            </div>
          )}
        </div>

        {/* Editorial Layout: Left primary portrait, Right 3-image grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
          {/* Main Headshot / Full Body Look */}
          <div className="md:col-span-7 aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 print:border-zinc-300">
            <img
              src={getMediaUrl(model.profile_photo)}
              alt={model.full_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Tier: 2 or 3 editorial looks */}
          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4">
            {editorial_looks.slice(0, 2).map((look: any, idx: number) => (
              <div
                key={idx}
                className="aspect-[4/3] md:aspect-[16/11] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 print:border-zinc-300 relative group"
              >
                <img
                  src={getMediaUrl(look.media_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {look.caption && (
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] text-zinc-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm truncate print:hidden">
                    {look.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Physical Stats / Verified Specs Bar */}
        <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300 rounded-2xl p-6 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4af37] print:text-black mb-4 pb-2 border-b border-zinc-800/80 print:border-zinc-300">
            Physical Measurements & Specifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Height</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.height_cm ? `${stats.height_cm} cm` : stats.height_feet || "—"}
              </p>
              {stats.height_feet && stats.height_cm && (
                <p className="text-[10px] text-zinc-400 print:text-zinc-500">{stats.height_feet}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Bust / Chest</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.bust ? `${stats.bust}"` : "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Waist</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.waist ? `${stats.waist}"` : "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Hips</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.hips ? `${stats.hips}"` : "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Shoe Size</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.shoe_size || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Hair</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.hair_color || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 print:text-zinc-600">Eyes</p>
              <p className="text-sm font-bold text-white print:text-black mt-1">
                {stats.eye_color || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Verification Stamp & Network Seal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800 print:border-zinc-400 text-xs text-zinc-400 print:text-zinc-600">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#d4af37] print:text-black shrink-0" />
            <div>
              <p className="font-semibold text-white print:text-black">{digital_stamp.verification_id}</p>
              <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-mono">
                Digitally verified on {digital_stamp.network}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right font-mono text-[10px]">
            <p className="text-[#d4af37] print:text-black font-semibold">DIRECT BOOKING & CASTING DESK</p>
            <p className="text-zinc-500 print:text-zinc-600">{digital_stamp.profile_url}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
