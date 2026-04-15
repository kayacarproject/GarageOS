/**
 * Validates an Indian mobile number.
 * Must be 10 digits and start with 6–9.
 */
export const isValidMobile = (mobile: string): boolean =>
  /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));

/**
 * Masks the middle 4 digits of a mobile number.
 * Full:   9876543210
 * Masked: 98●●●●3210
 */
export const maskMobile = (mobile: string, showFull: boolean): string => {
  if (showFull) return mobile;
  const digits = mobile.replace(/\D/g, '');
  if (digits.length < 6) return '●●●●●●●●●●';
  return digits.slice(0, 2) + '●●●●' + digits.slice(-4);
};

/**
 * Formats a mobile number for display.
 * Full:   +91 98765 43210
 * Masked: +91 98●●●● 3210
 */
export const formatMobileDisplay = (mobile: string, showFull: boolean): string => {
  const digits = mobile.replace(/\D/g, '');
  if (!showFull) {
    if (digits.length < 6) return '+91 ●●●●●●●●●●';
    return `+91 ${digits.slice(0, 2)}●●●● ${digits.slice(-4)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+91 ${digits}`;
};
