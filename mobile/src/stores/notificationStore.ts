import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppNotificationType =
  | 'job_assigned'
  | 'estimate_ready'
  | 'payment_received'
  | 'qc_failed'
  | 'waiting_parts'
  | 'booking_confirmed'
  | 'work_completed'
  | 'general';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  body: string;
  read: boolean;
  /** Optional deep-link target */
  targetScreen?: string;
  targetParams?: Record<string, string>;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;

  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'n1', type: 'booking_confirmed' as AppNotificationType, read: false,
      title: 'New Booking',
      body: 'Amit Patel booked Full Service for 15 Mar at 10:00',
      targetScreen: 'NewBooking',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'n2', type: 'estimate_ready' as AppNotificationType, read: false,
      title: 'Estimate Pending Approval',
      body: 'Estimate ₹5,341 for JC-0001 awaiting your approval',
      targetScreen: 'Approvals',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'n3', type: 'payment_received' as AppNotificationType, read: true,
      title: 'Payment Received',
      body: '₹1,711 received via UPI for Invoice AC/00001',
      targetScreen: 'Invoice',
      targetParams: { jobCardId: 'jc4' } as Record<string, string>,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'n4', type: 'waiting_parts' as AppNotificationType, read: false,
      title: 'Waiting for Parts',
      body: 'JC-0003 (Toyota Innova) is waiting for gasket kit',
      targetScreen: 'JobCardDetail',
      targetParams: { id: 'jc3' } as Record<string, string>,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ] as AppNotification[],
  unreadCount: 3,

  addNotification: (n) =>
    set((s) => {
      const entry: AppNotification = {
        ...n,
        id: `notif-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return {
        notifications: [entry, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      };
    }),

  markRead: (id) =>
    set((s) => {
      const wasUnread = s.notifications.find(n => n.id === id && !n.read);
      return {
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  remove: (id) =>
    set((s) => {
      const wasUnread = s.notifications.find(n => n.id === id && !n.read);
      return {
        notifications: s.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
