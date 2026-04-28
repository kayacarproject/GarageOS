import { createRef } from 'react';
import type { CustomToastRef } from '../components/CustomToast';

export type ToastType = 'success' | 'error' | 'info';

// Single ref registered once in App.tsx via <CustomToast ref={toastRef} />
export const toastRef = createRef<CustomToastRef>();

/**
 * Trigger a global toast from anywhere — no context, no props needed.
 *
 * @example
 * showToast('Login successful', 'success')
 * showToast('Invalid credentials', 'error')
 * showToast('Please check internet connection', 'error')
 */
export function showToast(
  message: string,
  type: ToastType = 'info',
  duration = 3200,
): void {
  toastRef.current?.show(message, type, duration);
}
