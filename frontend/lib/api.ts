// API Client for MODELHUB

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("modelhub_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("modelhub_token", token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("modelhub_token");
  localStorage.removeItem("modelhub_user");
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("modelhub_user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("modelhub_user", JSON.stringify(user));
}

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `Request failed with status ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  auth: {
    register: async (data: { email: string; password: string; role: string }) => {
      const res = await request<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.access_token) {
        setToken(res.access_token);
        setStoredUser(res.user);
      }
      return res;
    },
    login: async (data: { email: string; password: string }) => {
      const res = await request<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.access_token) {
        setToken(res.access_token);
        setStoredUser(res.user);
      }
      return res;
    },
    getMe: async () => {
      const res = await request<any>("/auth/me");
      setStoredUser(res);
      return res;
    },
    forgotPassword: async (email: string) => {
      return request<any>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    logout: () => {
      removeToken();
    },
  },

  models: {
    list: async (params?: { query?: string; city?: string; model_type?: string; verified_only?: boolean; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.query) query.append("query", params.query);
      if (params?.city) query.append("city", params.city);
      if (params?.model_type) query.append("model_type", params.model_type);
      if (params?.verified_only) query.append("verified_only", "true");
      if (params?.limit) query.append("limit", params.limit.toString());
      const qs = query.toString();
      return request<any[]>(`/models${qs ? `?${qs}` : ""}`);
    },
    getByUsername: async (username: string) => {
      return request<any>(`/models/${username}`);
    },
    getMyProfile: async () => {
      return request<any>("/models/me/profile");
    },
    saveOnboarding: async (data: any) => {
      return request<any>("/models/onboarding", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    addPortfolioItem: async (data: any) => {
      return request<any>("/models/portfolio", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    deletePortfolioItem: async (itemId: number) => {
      return request<any>(`/models/portfolio/${itemId}`, {
        method: "DELETE",
      });
    },
    addExperience: async (data: any) => {
      return request<any>("/models/experience", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    deleteExperience: async (expId: number) => {
      return request<any>(`/models/experience/${expId}`, {
        method: "DELETE",
      });
    },
    addAchievement: async (data: any) => {
      return request<any>("/models/achievements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    deleteAchievement: async (achId: number) => {
      return request<any>(`/models/achievements/${achId}`, {
        method: "DELETE",
      });
    },
    submitReview: async (username: string, data: any) => {
      return request<any>(`/models/${username}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    submitVerificationRequest: async (data: any) => {
      return request<any>("/models/verification/request", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getMyVerificationRequests: async () => {
      return request<any[]>("/models/verification/my-requests");
    },
    updatePrivacy: async (visibility: string) => {
      return request<any>(`/models/privacy?visibility=${visibility}`, {
        method: "PUT",
      });
    },
    getCompCard: async (username: string) => {
      return request<any>(`/models/${username}/comp-card`);
    },
  },

  // Phase 3 — Casting Marketplace
  castings: {
    list: async (params?: Record<string, string | number | boolean>) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => q.append(k, String(v)));
      return request<any>(`/castings${q.toString() ? `?${q.toString()}` : ""}`);
    },
    get: async (id: number) => request<any>(`/castings/${id}`),
    create: async (data: any) => request<any>("/castings", { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => request<any>(`/castings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => request<any>(`/castings/${id}`, { method: "DELETE" }),
    apply: async (id: number, data: { cover_note?: string; portfolio_url?: string }) =>
      request<any>(`/castings/${id}/apply`, { method: "POST", body: JSON.stringify(data) }),
    listApplications: async (id: number, status?: string) =>
      request<any>(`/castings/${id}/applications${status ? `?status=${status}` : ""}`),
    updateApplicationStatus: async (castingId: number, appId: number, status: string) =>
      request<any>(`/castings/${castingId}/applications/${appId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    myApplications: async () => request<any[]>("/castings/my/applications"),
  },

  // Phase 3 — Messaging
  messages: {
    list: async () => request<any[]>("/messages"),
    start: async (data: { recipient_id: number; subject?: string; first_message: string }) =>
      request<any>("/messages", { method: "POST", body: JSON.stringify(data) }),
    getConversation: async (id: number) => request<any>(`/messages/${id}`),
    send: async (conversationId: number, data: { content: string; message_type?: string }) =>
      request<any>(`/messages/${conversationId}/send`, { method: "POST", body: JSON.stringify(data) }),
  },

  // Phase 3 — Analytics
  analytics: {
    modelStats: async () => request<any>("/analytics/model/stats"),
    brandStats: async () => request<any>("/analytics/brand/stats"),
    trackView: async (username: string) => {
      try {
        await fetch(`${API_BASE}/analytics/view/${username}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken() || ""}` },
        });
      } catch { /* silently fail */ }
    },
  },

  // Phase 3 — Discover
  discover: {
    search: async (params?: Record<string, string | number | boolean>) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => q.append(k, String(v)));
      return request<any>(`/discover${q.toString() ? `?${q.toString()}` : ""}`);
    },
  },

  // Phase 3 — Admin
  admin: {
    stats: async () => request<any>("/admin/stats"),
    listUsers: async (params?: Record<string, string | number>) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => q.append(k, String(v)));
      return request<any>(`/admin/users${q.toString() ? `?${q.toString()}` : ""}`);
    },
    updateUser: async (id: number, data: any) => request<any>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteUser: async (id: number) => request<any>(`/admin/users/${id}`, { method: "DELETE" }),
    listVerifications: async (status?: string) =>
      request<any>(`/admin/verifications${status ? `?status=${status}` : ""}`),
    processVerification: async (id: number, data: { status: string; admin_notes?: string }) =>
      request<any>(`/admin/verifications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    listCastings: async (status?: string) =>
      request<any>(`/admin/castings${status ? `?status=${status}` : ""}`),
    updateCasting: async (id: number, data: any) =>
      request<any>(`/admin/castings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  // Phase 4 — Direct Bookings & Contract Offers
  bookings: {
    create: async (data: any) => request<any>("/bookings", { method: "POST", body: JSON.stringify(data) }),
    listMy: async () => request<any[]>("/bookings/my"),
    get: async (id: number) => request<any>(`/bookings/${id}`),
    respond: async (id: number, data: { action: string; response_notes?: string; counter_offer_amount?: number }) =>
      request<any>(`/bookings/${id}/respond`, { method: "PATCH", body: JSON.stringify(data) }),
    updateStatus: async (id: number, status: string) =>
      request<any>(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // Phase 4 — Curated Talent Shortlists & Casting Boards
  shortlists: {
    create: async (data: { title: string; description?: string; campaign_name?: string; is_private?: string }) =>
      request<any>("/shortlists", { method: "POST", body: JSON.stringify(data) }),
    list: async () => request<any[]>("/shortlists"),
    get: async (id: number) => request<any>(`/shortlists/${id}`),
    delete: async (id: number) => request<any>(`/shortlists/${id}`, { method: "DELETE" }),
    addItem: async (shortlistId: number, data: { model_username: string; casting_status?: string; internal_notes?: string }) =>
      request<any>(`/shortlists/${shortlistId}/items`, { method: "POST", body: JSON.stringify(data) }),
    updateItem: async (shortlistId: number, itemId: number, data: { casting_status?: string; internal_notes?: string }) =>
      request<any>(`/shortlists/${shortlistId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(data) }),
    removeItem: async (shortlistId: number, itemId: number) =>
      request<any>(`/shortlists/${shortlistId}/items/${itemId}`, { method: "DELETE" }),
  },

  // Phase 4 — Agency Directory & Rosters
  agencies: {
    list: async () => request<any[]>("/agencies"),
    get: async (slug: string) => request<any>(`/agencies/${slug}`),
    create: async (data: any) => request<any>("/agencies", { method: "POST", body: JSON.stringify(data) }),
  },

  // Phase 5 — Production Call Sheets
  callSheets: {
    create: async (data: any) => request<any>("/call-sheets", { method: "POST", body: JSON.stringify(data) }),
    listMy: async () => request<any[]>("/call-sheets/my"),
    get: async (id: number) => request<any>(`/call-sheets/${id}`),
    updateAttendance: async (id: number, status: string) =>
      request<any>(`/call-sheets/${id}/attendance`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // Phase 5 — Availability Calendar & Holds
  calendar: {
    getTalentCalendar: async (username: string) => request<any[]>(`/calendar/${username}`),
    setAvailability: async (data: { date: string; status?: string; city_location?: string; project_label?: string; is_private?: boolean }) =>
      request<any>("/calendar", { method: "POST", body: JSON.stringify(data) }),
    deleteAvailability: async (id: number) => request<any>(`/calendar/${id}`, { method: "DELETE" }),
  },

  // Phase 5 — Financial Invoicing & Escrow Commission Splits
  invoices: {
    create: async (data: any) => request<any>("/invoices", { method: "POST", body: JSON.stringify(data) }),
    listMy: async () => request<any[]>("/invoices/my"),
    get: async (id: number) => request<any>(`/invoices/${id}`),
    pay: async (id: number, data: { payment_status: string; payment_method?: string }) =>
      request<any>(`/invoices/${id}/pay`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  // Phase 6 — Real-Time In-App Notifications
  notifications: {
    list: async (limit: number = 50) =>
      request<{ notifications: any[]; unread_count: number; total_count: number }>(`/notifications?limit=${limit}`),
    create: async (data: any) => request<any>("/notifications", { method: "POST", body: JSON.stringify(data) }),
    markRead: async (id: number) => request<any>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: async () => request<any>("/notifications/read-all", { method: "POST" }),
    delete: async (id: number) => request<any>(`/notifications/${id}`, { method: "DELETE" }),
  },

  upload: {
    file: async (file: File, subfolder: string = "portfolio") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", subfolder);

      const token = getToken();
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }

      return res.json();
    },
  },
};
