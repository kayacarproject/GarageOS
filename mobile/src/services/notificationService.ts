import type { JobCardStatus } from '../types';

// ─── Channel Types ─────────────────────────────────────────────────────────────

export type NotificationChannel = 'whatsapp' | 'sms' | 'push' | 'email';

export type NotificationTemplate =
  // Customer-facing
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'estimate_ready'
  | 'work_started'
  | 'work_completed'
  | 'invoice_generated'
  | 'payment_received'
  // Internal
  | 'job_assigned'
  | 'waiting_for_parts'
  | 'qc_failed';

export interface NotificationPayload {
  to: string;                        // phone / push token / email
  template: NotificationTemplate;
  data: Record<string, string>;
  channels: NotificationChannel[];
}

export interface QueuedNotification extends NotificationPayload {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

// ─── Template Definitions ─────────────────────────────────────────────────────

const TEMPLATES: Record<NotificationTemplate, { message: (d: Record<string, string>) => string; channels: NotificationChannel[] }> = {
  booking_confirmed: {
    channels: ['whatsapp', 'sms'],
    message: d => `Hi ${d.customerName}, your booking for ${d.serviceType} on ${d.date} at ${d.time} is confirmed. Job: ${d.jobNumber}. - ${d.garageName}`,
  },
  booking_reminder: {
    channels: ['whatsapp'],
    message: d => `Reminder: Your ${d.serviceType} appointment is tomorrow at ${d.time}. Please arrive on time. - ${d.garageName}`,
  },
  estimate_ready: {
    channels: ['whatsapp'],
    message: d => `Hi ${d.customerName}, your estimate of ₹${d.amount} is ready for Job ${d.jobNumber}. Approve here: ${d.approvalLink} - ${d.garageName}`,
  },
  work_started: {
    channels: ['sms'],
    message: d => `Work has started on your ${d.vehicleName} (${d.regNumber}). Job: ${d.jobNumber}. - ${d.garageName}`,
  },
  work_completed: {
    channels: ['whatsapp'],
    message: d => `Great news! Work on your ${d.vehicleName} is complete and has passed quality check. Invoice: ₹${d.amount}. - ${d.garageName}`,
  },
  invoice_generated: {
    channels: ['whatsapp'],
    message: d => `Invoice ${d.invoiceNumber} of ₹${d.amount} generated for Job ${d.jobNumber}. View PDF: ${d.pdfLink} - ${d.garageName}`,
  },
  payment_received: {
    channels: ['whatsapp', 'sms'],
    message: d => `Payment of ₹${d.amount} received via ${d.mode} for Invoice ${d.invoiceNumber}. Balance: ₹${d.balance}. Thank you! - ${d.garageName}`,
  },
  job_assigned: {
    channels: ['push'],
    message: d => `New job assigned: ${d.jobNumber} — ${d.vehicleName} (${d.workType}). Customer: ${d.customerName}.`,
  },
  waiting_for_parts: {
    channels: ['push'],
    message: d => `Job ${d.jobNumber} is waiting for parts. Mechanic: ${d.mechanicName}. Notes: ${d.notes ?? 'None'}.`,
  },
  qc_failed: {
    channels: ['push'],
    message: d => `QC Failed for Job ${d.jobNumber} — ${d.vehicleName}. Reason: ${d.reason ?? 'Not specified'}. Reassigned to ${d.mechanicName}.`,
  },
};

// ─── In-memory Queue (MVP) ────────────────────────────────────────────────────

const notificationQueue: QueuedNotification[] = [];

function enqueue(payload: NotificationPayload): QueuedNotification {
  const entry: QueuedNotification = {
    ...payload,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  };
  notificationQueue.push(entry);
  return entry;
}

// ─── Core Send ────────────────────────────────────────────────────────────────

/**
 * Sends a notification via the appropriate channels.
 * In MVP mode: logs to console and queues for retry.
 * In production: replace channel handlers with real integrations.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const template = TEMPLATES[payload.template];
  if (!template) {
    console.warn(`[Notification] Unknown template: ${payload.template}`);
    return;
  }

  const message = template.message(payload.data);
  const entry = enqueue(payload);

  for (const channel of payload.channels) {
    try {
      // ── MVP: log only ──────────────────────────────────────────────────────
      console.log(`[Notification:${channel.toUpperCase()}] → ${payload.to}`);
      console.log(`  Template : ${payload.template}`);
      console.log(`  Message  : ${message}`);

      // ── Production channel handlers (replace below) ────────────────────────
      // if (channel === 'whatsapp') await interaktClient.send({ to: payload.to, message });
      // if (channel === 'sms')      await msg91Client.send({ to: payload.to, message });
      // if (channel === 'push')     await Notifications.scheduleNotificationAsync({ content: { title, body: message }, trigger: null });
      // if (channel === 'email')    await sendgridClient.send({ to: payload.to, subject, html: message });

      entry.status = 'sent';
      entry.sentAt = new Date().toISOString();
    } catch (err: any) {
      entry.status = 'failed';
      entry.error = err.message;
      entry.attempts += 1;
      console.error(`[Notification] Failed on ${channel}:`, err.message);
    }
  }
}

// ─── Event Triggers ───────────────────────────────────────────────────────────

interface JobNotificationContext {
  customerMobile: string;
  customerName: string;
  jobNumber: string;
  vehicleName: string;
  regNumber: string;
  workType?: string;
  mechanicName?: string;
  mechanicPushToken?: string;
  ownerPushToken?: string;
  amount?: string;
  invoiceNumber?: string;
  pdfLink?: string;
  approvalLink?: string;
  notes?: string;
  reason?: string;
  garageName: string;
}

/**
 * Fires the correct notification(s) when a job card status changes.
 * Call this from jobCardService.updateStatus().
 */
export async function notifyOnStatusChange(
  newStatus: JobCardStatus,
  ctx: JobNotificationContext,
): Promise<void> {
  const base = { garageName: ctx.garageName, jobNumber: ctx.jobNumber, vehicleName: ctx.vehicleName, regNumber: ctx.regNumber };

  switch (newStatus) {
    case 'in_progress':
      await sendNotification({
        to: ctx.customerMobile,
        template: 'work_started',
        channels: ['sms'],
        data: { ...base, customerName: ctx.customerName },
      });
      break;

    case 'estimate_created':
      await sendNotification({
        to: ctx.customerMobile,
        template: 'estimate_ready',
        channels: ['whatsapp'],
        data: { ...base, customerName: ctx.customerName, amount: ctx.amount ?? '0', approvalLink: ctx.approvalLink ?? '' },
      });
      break;

    case 'assigned':
      if (ctx.mechanicPushToken) {
        await sendNotification({
          to: ctx.mechanicPushToken,
          template: 'job_assigned',
          channels: ['push'],
          data: { ...base, customerName: ctx.customerName, workType: ctx.workType ?? 'service' },
        });
      }
      break;

    case 'waiting_parts':
      if (ctx.ownerPushToken) {
        await sendNotification({
          to: ctx.ownerPushToken,
          template: 'waiting_for_parts',
          channels: ['push'],
          data: { ...base, mechanicName: ctx.mechanicName ?? 'Mechanic', notes: ctx.notes ?? '' },
        });
      }
      break;

    case 'qc_failed':
      if (ctx.ownerPushToken) {
        await sendNotification({
          to: ctx.ownerPushToken,
          template: 'qc_failed',
          channels: ['push'],
          data: { ...base, mechanicName: ctx.mechanicName ?? 'Mechanic', reason: ctx.reason ?? '' },
        });
      }
      break;

    case 'qc_passed':
      await sendNotification({
        to: ctx.customerMobile,
        template: 'work_completed',
        channels: ['whatsapp'],
        data: { ...base, customerName: ctx.customerName, amount: ctx.amount ?? '0' },
      });
      break;
  }
}

/**
 * Fires when an invoice is generated.
 */
export async function notifyInvoiceGenerated(ctx: JobNotificationContext): Promise<void> {
  await sendNotification({
    to: ctx.customerMobile,
    template: 'invoice_generated',
    channels: ['whatsapp'],
    data: {
      garageName: ctx.garageName,
      jobNumber: ctx.jobNumber,
      invoiceNumber: ctx.invoiceNumber ?? '',
      amount: ctx.amount ?? '0',
      pdfLink: ctx.pdfLink ?? '',
    },
  });
}

/**
 * Fires when a payment is collected.
 */
export async function notifyPaymentReceived(
  ctx: JobNotificationContext & { mode: string; balance: string },
): Promise<void> {
  await sendNotification({
    to: ctx.customerMobile,
    template: 'payment_received',
    channels: ['whatsapp', 'sms'],
    data: {
      garageName: ctx.garageName,
      invoiceNumber: ctx.invoiceNumber ?? '',
      amount: ctx.amount ?? '0',
      mode: ctx.mode,
      balance: ctx.balance,
    },
  });
}

// ─── Queue Inspector (for admin/debug) ────────────────────────────────────────

export function getNotificationQueue(): QueuedNotification[] {
  return [...notificationQueue];
}

export function getPendingRetries(): QueuedNotification[] {
  return notificationQueue.filter(n => n.status === 'failed' && n.attempts < 3);
}

/*
 * ─── Real-time & Scalability Suggestions ─────────────────────────────────────
 *
 * WebSockets:
 *   - Use Socket.IO or native WS on the backend
 *   - Emit events: job_status_changed, payment_received, new_booking
 *   - Client subscribes by company_id room → instant dashboard refresh
 *   - Fallback: polling every 30s if WS disconnects
 *
 * Notification Queue (Production):
 *   - Replace in-memory array with BullMQ (Redis-backed)
 *   - Retry failed notifications with exponential backoff (1s, 5s, 30s)
 *   - Dead-letter queue for permanently failed notifications
 *   - Dashboard to view/retry failed notifications
 *
 * Unread Badge System:
 *   - Store notifications in DB with read_at timestamp
 *   - GET /notifications?unread=true → count for badge
 *   - PATCH /notifications/:id/read → mark individual read
 *   - PATCH /notifications/read-all → bulk mark read
 *
 * Dashboard Performance:
 *   - Memoize filtered job arrays with useMemo
 *   - Use React.memo on StatCard, JobCardListItem to prevent re-renders
 *   - Paginate job lists (FlatList with onEndReached)
 *   - Cache dashboard KPIs in Zustand, invalidate on WS event
 *   - Use SWR or React Query for stale-while-revalidate pattern
 */
