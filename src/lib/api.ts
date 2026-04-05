const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8106/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data.error || `Request failed with status ${res.status}`,
      res.status,
      data
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email?: string;
  image_file: string;
  is_admin: boolean;
  date_created: string;
  has_active_subscription?: boolean;
  subscription_tier?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const auth = {
  register: (data: { username: string; email: string; password: string; confirm_password: string }) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: (refreshToken: string) =>
    apiFetch<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      token: refreshToken,
    }),

  me: (token: string) => apiFetch<User>('/auth/me', { token }),

  updateProfile: (token: string, data: { username?: string; email?: string }) =>
    apiFetch<{ user: User }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  changePassword: (token: string, data: { current_password: string; new_password: string; confirm_password: string }) =>
    apiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  requestReset: (email: string) =>
    apiFetch<{ message: string }>('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; password: string; confirm_password: string }) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAccount: (token: string, password: string) =>
    apiFetch<{ message: string }>('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
      token,
    }),
};

// ── Products ────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_file: string;
  date_posted: string;
  owner: string;
  is_instant_download: boolean;
  download_file: string | null;
  view_count: number;
  requires_subscription: boolean;
  subscription_tier: string;
  is_premium: boolean;
  is_hidden: boolean;
  category: string;
  tags: string[];
  user_has_purchased?: boolean;
  user_can_access?: boolean;
}

export interface ProductList {
  products: Product[];
  total: number;
  pages: number;
  page: number;
}

export const products = {
  list: (params?: { category?: string; search?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    return apiFetch<ProductList>(`/products/?${qs.toString()}`);
  },

  get: (id: number, token?: string) =>
    apiFetch<Product>(`/products/${id}`, { token: token || undefined }),

  checkout: (token: string, productId: number) =>
    apiFetch<{ checkout_url: string; session_id: string }>(`/products/${productId}/checkout`, {
      method: 'POST',
      token,
    }),

  verifyPayment: (token: string, sessionId: string) =>
    apiFetch<{ status: string; purchase: Record<string, unknown> }>('/products/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
      token,
    }),

  categories: () => apiFetch<string[]>('/products/categories'),
};

// ── Chat ────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: number;
  name: string;
  room_type: string;
  user: User;
  product_id: number | null;
  is_active: boolean;
  created_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: number;
  content: string;
  timestamp: string;
  is_admin: boolean;
  user: User;
}

export const chat = {
  rooms: (token: string) => apiFetch<ChatRoom[]>('/chat/rooms', { token }),

  room: (token: string, roomId: number) =>
    apiFetch<{ room: ChatRoom; messages: ChatMessage[] }>(`/chat/rooms/${roomId}`, { token }),

  messages: (token: string, roomId: number, afterId?: number) =>
    apiFetch<ChatMessage[]>(`/chat/rooms/${roomId}/messages?after=${afterId || 0}`, { token }),

  send: (token: string, roomId: number, message: string) =>
    apiFetch<ChatMessage>(`/chat/rooms/${roomId}/send`, {
      method: 'POST',
      body: JSON.stringify({ message }),
      token,
    }),

  startOrder: (token: string, productId: number, message: string) =>
    apiFetch<ChatRoom>('/chat/start-order', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, message }),
      token,
    }),

  startSupport: (token: string, message: string) =>
    apiFetch<ChatRoom>('/chat/start-support', {
      method: 'POST',
      body: JSON.stringify({ message }),
      token,
    }),

  close: (token: string, roomId: number) =>
    apiFetch<{ message: string }>(`/chat/rooms/${roomId}/close`, { method: 'POST', token }),
};

// ── Subscriptions ───────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  max_downloads_per_month: number;
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: string;
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  downloads_used_this_month: number;
}

export const subscriptions = {
  plans: () => apiFetch<SubscriptionPlan[]>('/subscriptions/plans'),

  mySubscription: (token: string) =>
    apiFetch<{ subscription: UserSubscription | null }>('/subscriptions/my-subscription', { token }),

  subscribe: (token: string, planId: number) =>
    apiFetch<{ checkout_url: string; session_id: string }>(`/subscriptions/subscribe/${planId}`, {
      method: 'POST',
      token,
    }),

  verify: (token: string, sessionId: string) =>
    apiFetch<{ subscription: UserSubscription }>('/subscriptions/verify', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
      token,
    }),

  cancel: (token: string) =>
    apiFetch<{ message: string }>('/subscriptions/cancel', { method: 'POST', token }),

  manage: (token: string) =>
    apiFetch<{ url: string }>('/subscriptions/manage', { token }),
};

// ── Notifications ───────────────────────────────────────────────────

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_global: boolean;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  is_read?: boolean;
}

export const notifications = {
  list: (token: string) => apiFetch<Notification[]>('/notifications/', { token }),

  unreadCount: (token: string) =>
    apiFetch<{ count: number }>('/notifications/unread-count', { token }),

  markRead: (token: string, id: number) =>
    apiFetch('/notifications/' + id + '/mark-read', { method: 'POST', token }),

  markAllRead: (token: string) =>
    apiFetch('/notifications/mark-all-read', { method: 'POST', token }),

  active: () => apiFetch<Notification[]>('/notifications/active'),
};

// ── Admin ───────────────────────────────────────────────────────────

export const admin = {
  dashboard: (token: string) =>
    apiFetch<{
      total_users: number;
      total_products: number;
      total_purchases: number;
      active_subscriptions: number;
      active_chats: number;
      total_revenue: number;
    }>('/admin/dashboard', { token }),

  // Products
  products: (token: string) => apiFetch<Product[]>('/admin/products', { token }),
  createProduct: (token: string, data: Partial<Product>) =>
    apiFetch<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data), token }),
  updateProduct: (token: string, id: number, data: Partial<Product>) =>
    apiFetch<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteProduct: (token: string, id: number) =>
    apiFetch(`/admin/products/${id}`, { method: 'DELETE', token }),
  toggleVisibility: (token: string, id: number) =>
    apiFetch<{ is_hidden: boolean }>(`/admin/products/${id}/toggle-visibility`, { method: 'POST', token }),

  // Users
  users: (token: string) => apiFetch<User[]>('/admin/users', { token }),
  toggleAdmin: (token: string, id: number) =>
    apiFetch<{ is_admin: boolean }>(`/admin/users/${id}/toggle-admin`, { method: 'POST', token }),
  deleteUser: (token: string, id: number) =>
    apiFetch(`/admin/users/${id}`, { method: 'DELETE', token }),
  resetUserPassword: (token: string, id: number, data: { new_password: string; email?: string }) =>
    apiFetch(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify(data), token }),

  // Chats
  chats: (token: string) => apiFetch<ChatRoom[]>('/admin/chats', { token }),

  // Notifications
  notifications: (token: string) => apiFetch<Notification[]>('/admin/notifications', { token }),
  createNotification: (token: string, data: Record<string, unknown>) =>
    apiFetch<Notification>('/admin/notifications', { method: 'POST', body: JSON.stringify(data), token }),
  toggleNotification: (token: string, id: number) =>
    apiFetch<{ is_active: boolean }>(`/admin/notifications/${id}/toggle`, { method: 'POST', token }),
  deleteNotification: (token: string, id: number) =>
    apiFetch(`/admin/notifications/${id}`, { method: 'DELETE', token }),

  // Subscription plans
  subscriptionPlans: (token: string) => apiFetch<SubscriptionPlan[]>('/admin/subscription-plans', { token }),
  createPlan: (token: string, data: Partial<SubscriptionPlan>) =>
    apiFetch<SubscriptionPlan>('/admin/subscription-plans', { method: 'POST', body: JSON.stringify(data), token }),
  updatePlan: (token: string, id: number, data: Partial<SubscriptionPlan>) =>
    apiFetch<SubscriptionPlan>(`/admin/subscription-plans/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  togglePlan: (token: string, id: number) =>
    apiFetch<{ is_active: boolean }>(`/admin/subscription-plans/${id}/toggle`, { method: 'POST', token }),
  deletePlan: (token: string, id: number) =>
    apiFetch(`/admin/subscription-plans/${id}`, { method: 'DELETE', token }),
};

// ── Analytics ───────────────────────────────────────────────────────

export const analytics = {
  trackView: (page: string, token?: string) =>
    apiFetch('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ page }),
      token: token || undefined,
    }),
};

// ── Uploads ─────────────────────────────────────────────────────────

export const uploads = {
  profilePicture: (token: string, file: File) => {
    const form = new FormData();
    form.append('picture', file);
    return apiFetch<{ image_file: string }>('/uploads/profile-picture', {
      method: 'POST',
      body: form,
      token,
    });
  },

  imageUrl: (folder: string, filename: string) =>
    `${API_URL}/uploads/${folder}/${filename}`,
};

export { ApiError };
export default apiFetch;
