"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  CreditCard,
  Briefcase,
  Trash2,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: string;
  action_url?: string;
  is_read: boolean;
  created_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list(50);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "booking":
        return <Briefcase className="w-4 h-4 text-[#d4af37]" />;
      case "call_sheet":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "finance":
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case "casting":
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.category === filter;
  });

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] font-mono mb-1">
              <Bell className="w-3.5 h-3.5" />
              <span>Phase 6 Notification Hub</span>
            </div>
            <h1 className="font-serif text-3xl text-white font-light">
              System <span className="text-[#d4af37]">Notifications</span>
            </h1>
            <p className="text-neutral-400 text-xs mt-1">
              Real-time contract alerts, call sheet schedules, casting callbacks, and escrow updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#d4af37] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "booking", label: "Bookings" },
            { id: "call_sheet", label: "Call Sheets" },
            { id: "finance", label: "Escrow & Payouts" },
            { id: "casting", label: "Castings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 transition-all ${
                filter === tab.id
                  ? "bg-[#d4af37] text-black font-semibold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-mono text-sm">
            Fetching activity stream...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-neutral-800 bg-neutral-950/50 p-8">
            <Bell className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
            <h3 className="text-base font-serif text-white">No notifications</h3>
            <p className="text-neutral-500 text-xs mt-1">
              You are all caught up on contract offers, casting status updates, and call sheets.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-900 border border-neutral-800 bg-neutral-950">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  !item.is_read ? "bg-neutral-900/40" : "hover:bg-neutral-900/20"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2 bg-neutral-900 border border-neutral-800 rounded mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.title}</span>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-neutral-500">
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Just now"}</span>
                      {item.action_url && (
                        <Link
                          href={item.action_url}
                          onClick={() => handleMarkRead(item.id)}
                          className="text-[#d4af37] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
