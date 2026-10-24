"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Receipt,
  Building,
  User as UserIcon,
  Download,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  booking_offer_id?: number;
  project_title: string;
  currency: string;
  gross_amount: number;
  agency_fee_percentage: number;
  agency_fee_amount: number;
  net_talent_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string; // unpaid, in_escrow, paid, cancelled
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  client?: { id: number; email: string };
  model?: {
    id: number;
    username: string;
    full_name: string;
    profile_photo?: string;
    agency_name?: string;
  };
}

export default function FinancesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Invoice Generation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    model_username: "elenarostova",
    project_title: "",
    gross_amount: 150000,
    currency: "INR",
    agency_fee_percentage: 20.0,
    tax_percentage: 18.0,
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  });

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.invoices.listMy();
      setInvoices(data || []);
      if (data && data.length > 0) {
        setSelectedInvoice(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handlePayEscrow = async (invoiceId: number, status: string) => {
    try {
      const updated = await api.invoices.pay(invoiceId, {
        payment_status: status,
        payment_method: status === "paid" ? "Direct Model Wire Disbursal" : "Verified Client Escrow Vault",
      });
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updated : inv)));
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update escrow payment status");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await api.invoices.create(formData);
      setInvoices([created, ...invoices]);
      setSelectedInvoice(created);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  // Financial Summary Metrics
  const totalGross = invoices.reduce((acc, inv) => acc + (inv.gross_amount || 0), 0);
  const totalCommission = invoices.reduce((acc, inv) => acc + (inv.agency_fee_amount || 0), 0);
  const totalNetTalent = invoices.reduce((acc, inv) => acc + (inv.net_talent_amount || 0), 0);
  const inEscrowAmount = invoices
    .filter((inv) => inv.payment_status === "in_escrow")
    .reduce((acc, inv) => acc + (inv.total_amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-medium">Disbursed & Paid</span>;
      case "in_escrow":
        return <span className="px-2.5 py-1 text-xs bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 rounded-full font-medium">Held in Escrow</span>;
      case "unpaid":
      default:
        return <span className="px-2.5 py-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full font-medium">Pending Payment</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <CreditCard className="w-4 h-4" />
              <span>Phase 5 Financial Escrow & Splits</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-wide">
              Financial <span className="text-[#d4af37]">Billing & Invoicing</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Automated 20% agency commission splits, model net earnings ledger, commercial GST billing, and escrow payment protection.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest px-5 py-3 hover:bg-[#e5c158] transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Draft Commercial Invoice</span>
          </button>
        </div>

        {/* Financial KPI Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Gross Booking Volume</span>
            <div className="text-2xl font-serif text-white mt-1 font-semibold">
              ₹{totalGross.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Total contract billings</p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Net Talent Earnings (80%)</span>
            <div className="text-2xl font-serif text-emerald-400 mt-1 font-semibold">
              ₹{totalNetTalent.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Direct model compensation</p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Agency Commission (20%)</span>
            <div className="text-2xl font-serif text-[#d4af37] mt-1 font-semibold">
              ₹{totalCommission.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Platform & agency management fee</p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Protected in Escrow</span>
            <div className="text-2xl font-serif text-amber-300 mt-1 font-semibold">
              ₹{inEscrowAmount.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Guaranteed funds pending wrap</p>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-mono text-sm">
            Accessing escrow accounts and billing statements...
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-800 text-red-300 p-6 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/50">
            <Receipt className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-serif text-white">No commercial invoices generated</h3>
            <p className="text-neutral-400 text-sm mt-1 mb-6">Create a billing statement to track payments and automatic escrow splits.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-neutral-900 border border-neutral-700 text-xs uppercase tracking-wider text-white hover:border-[#d4af37]"
            >
              Issue First Invoice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Invoices List */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                All Billing Statements ({invoices.length})
              </h2>
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`cursor-pointer border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-[#d4af37] bg-neutral-900/80 shadow-lg shadow-[#d4af37]/5"
                        : "border-neutral-800 bg-neutral-950/40 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-semibold text-[#d4af37]">
                        {inv.invoice_number}
                      </span>
                      {getStatusBadge(inv.payment_status)}
                    </div>
                    <h3 className="font-serif text-base text-white font-medium line-clamp-1">
                      {inv.project_title}
                    </h3>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-900 text-xs">
                      <span className="text-neutral-400">
                        Talent: <strong className="text-white">{inv.model?.full_name || inv.model?.username}</strong>
                      </span>
                      <span className="font-mono text-sm font-semibold text-white">
                        ₹{inv.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Invoice Breakdown & Escrow Action */}
            {selectedInvoice && (
              <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-neutral-800 pb-6 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]">
                      Commercial Invoice
                    </span>
                    <h2 className="font-mono text-2xl text-white font-bold mt-0.5">
                      {selectedInvoice.invoice_number}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Campaign: <span className="text-white font-medium">{selectedInvoice.project_title}</span>
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(selectedInvoice.payment_status)}
                    {selectedInvoice.due_date && (
                      <p className="text-[10px] font-mono text-neutral-500 mt-1 text-right">
                        Due: {selectedInvoice.due_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Talent & Client Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900/40 p-4 border border-neutral-900">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-neutral-500">Talent Payee</span>
                    <div className="text-sm font-medium text-white mt-0.5">
                      {selectedInvoice.model?.full_name || selectedInvoice.model?.username}
                    </div>
                    <div className="text-xs text-[#d4af37] font-mono">
                      {selectedInvoice.model?.agency_name || "Exclusive Editorial"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-neutral-500">Billed To (Client)</span>
                    <div className="text-sm font-medium text-white mt-0.5 truncate">
                      {selectedInvoice.client?.email || "Commercial Partner"}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      Escrow Vault Account
                    </div>
                  </div>
                </div>

                {/* Split Calculation Table */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-3">
                    Commission & Escrow Distribution
                  </h3>
                  <div className="border border-neutral-900 divide-y divide-neutral-900 text-sm">
                    <div className="flex items-center justify-between p-3">
                      <span className="text-neutral-400">Agreed Gross Commercial Fee</span>
                      <span className="font-mono text-white font-medium">₹{selectedInvoice.gross_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-900/20">
                      <span className="text-neutral-400">
                        Agency Commission ({selectedInvoice.agency_fee_percentage}%)
                      </span>
                      <span className="font-mono text-[#d4af37]">
                        - ₹{selectedInvoice.agency_fee_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-950/10">
                      <span className="text-emerald-400 font-medium">
                        Net Model Payout ({100 - selectedInvoice.agency_fee_percentage}%)
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ₹{selectedInvoice.net_talent_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="text-neutral-400">Tax / Commercial GST (18%)</span>
                      <span className="font-mono text-neutral-300">₹{selectedInvoice.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neutral-900/60 font-semibold text-base">
                      <span className="text-white">Total Commercial Invoice</span>
                      <span className="font-mono text-[#d4af37] text-lg">
                        ₹{selectedInvoice.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Escrow Status & Action Buttons */}
                <div className="border-t border-neutral-800 pt-6 space-y-4">
                  <div className="bg-neutral-900/40 p-4 border border-neutral-900 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs uppercase font-mono text-white font-semibold">CMID Escrow Guarantee</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Client funds are held in secure escrow prior to shoot commencement. Funds are disbursed to model and agency accounts automatically upon call sheet completion.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    {selectedInvoice.payment_status === "unpaid" && (
                      <button
                        onClick={() => handlePayEscrow(selectedInvoice.id, "in_escrow")}
                        className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e5c158] transition-colors"
                      >
                        Fund Escrow Vault
                      </button>
                    )}

                    {selectedInvoice.payment_status === "in_escrow" && (
                      <button
                        onClick={() => handlePayEscrow(selectedInvoice.id, "paid")}
                        className="px-5 py-2.5 bg-emerald-500 text-black font-semibold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                      >
                        Disburse Funds to Talent
                      </button>
                    )}

                    {selectedInvoice.payment_status === "paid" && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono py-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Disbursed via {selectedInvoice.payment_method || "Direct Wire"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-serif text-xl text-white">Generate Commercial Invoice</h3>
                <p className="text-xs text-neutral-400">Calculates agency commission and model payout automatically</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Model Username</label>
                <input
                  type="text"
                  required
                  value={formData.model_username}
                  onChange={(e) => setFormData({ ...formData, model_username: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. elena_rostova"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400">Project / Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.project_title}
                  onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. Vogue Spring Campaign 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Gross Fee (INR)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.gross_amount}
                    onChange={(e) => setFormData({ ...formData, gross_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Gross:</span>
                  <span>₹{formData.gross_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#d4af37]">
                  <span>Agency Fee (20%):</span>
                  <span>- ₹{(formData.gross_amount * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Net to Model (80%):</span>
                  <span>₹{(formData.gross_amount * 0.8).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>GST (18%):</span>
                  <span>+ ₹{(formData.gross_amount * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-neutral-800">
                  <span>Invoice Total:</span>
                  <span>₹{(formData.gross_amount * 1.18).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e5c158] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Commercial Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
