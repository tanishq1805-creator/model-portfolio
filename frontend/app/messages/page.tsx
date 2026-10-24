"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, User, Search, ArrowLeft, CheckCheck } from "lucide-react";
import { api, getStoredUser, getMediaUrl } from "@/lib/api";
import Link from "next/link";

function ConversationItem({
  conv, active, onClick
}: { conv: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 transition-colors text-left ${
        active ? "bg-zinc-800/80" : "hover:bg-zinc-900/60"
      }`}
    >
      <div className="relative shrink-0">
        {conv.other_user?.photo ? (
          <img src={getMediaUrl(conv.other_user.photo)} alt={conv.other_user.name}
            className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <User size={18} className="text-zinc-400" />
          </div>
        )}
        {conv.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#d4af37] text-black text-[9px] font-bold rounded-full flex items-center justify-center">
            {conv.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-white font-semibold text-sm truncate">{conv.other_user?.name || "Unknown"}</p>
          <span className="text-zinc-600 text-[10px] shrink-0">
            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
          </span>
        </div>
        {conv.subject && <p className="text-zinc-500 text-[10px] font-medium truncate">{conv.subject}</p>}
        <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? "text-zinc-300 font-medium" : "text-zinc-600"}`}>
          {conv.last_message_preview || "No messages yet"}
        </p>
      </div>
    </button>
  );
}

function ChatBubble({ msg, isOwn }: { msg: any; isOwn: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
        isOwn
          ? "bg-[#d4af37] text-black rounded-br-sm"
          : "bg-zinc-800 text-white rounded-bl-sm"
      }`}>
        <p className="leading-relaxed">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? "text-black/60 text-right" : "text-zinc-500"}`}>
          {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getStoredUser();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await api.messages.list();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(conv: any) {
    setActiveConv(conv);
    try {
      const data = await api.messages.getConversation(conv.id);
      setMessages(data.messages || []);
      // Reset unread in UI
      setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unread_count: 0 } : c));
    } catch {
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    const optimistic = {
      id: Date.now(),
      sender_id: user?.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    const content = newMessage;
    setNewMessage("");
    try {
      const sent = await api.messages.send(activeConv.id, { content });
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? sent : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }

  const filteredConvs = conversations.filter((c) =>
    !search || c.other_user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-0 sm:px-4 lg:px-8 py-0 sm:py-6">
        <div className="flex w-full h-full bg-zinc-950 sm:rounded-2xl border border-zinc-800 overflow-hidden">

          {/* Sidebar */}
          <div className={`w-full sm:w-80 flex-shrink-0 flex flex-col border-r border-zinc-800 ${activeConv ? "hidden sm:flex" : "flex"}`}>
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare size={32} className="text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm font-medium">No conversations yet</p>
                  <p className="text-zinc-600 text-xs mt-1">Visit a model's profile to start a conversation.</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={activeConv?.id === conv.id}
                    onClick={() => openConversation(conv)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className={`flex-1 flex flex-col ${!activeConv ? "hidden sm:flex" : "flex"}`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p className="font-semibold text-zinc-400">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your inbox to start chatting.</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                  <button onClick={() => setActiveConv(null)} className="sm:hidden text-zinc-400 hover:text-white">
                    <ArrowLeft size={18} />
                  </button>
                  {activeConv.other_user?.photo ? (
                    <img src={getMediaUrl(activeConv.other_user.photo)} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center">
                      <User size={16} className="text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{activeConv.other_user?.name || "Unknown"}</p>
                    {activeConv.subject && <p className="text-zinc-500 text-xs">{activeConv.subject}</p>}
                  </div>
                  {activeConv.other_user?.username && (
                    <Link href={`/models/${activeConv.other_user.username}`} className="ml-auto text-xs text-[#d4af37] hover:underline">
                      View Profile
                    </Link>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/60"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-amber-400 transition-colors"
                    >
                      <Send size={16} className="text-black" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
