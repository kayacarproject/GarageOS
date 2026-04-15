// ─── Format Currency ──────────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees.
 * @example formatCurrency(5341) → "₹5,341"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Amount In Words ──────────────────────────────────────────────────────────

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim();
}

function threeDigits(n: number): string {
  if (n === 0) return '';
  if (n < 100) return twoDigits(n);
  const hundreds = ONES[Math.floor(n / 100)] + ' Hundred';
  const remainder = twoDigits(n % 100);
  return remainder ? `${hundreds} ${remainder}` : hundreds;
}

function toIndianWords(n: number): string {
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 10_000_000);
  const lakh  = Math.floor((n % 10_000_000) / 100_000);
  const thou  = Math.floor((n % 100_000) / 1_000);
  const rest  = n % 1_000;

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh)  parts.push(twoDigits(lakh) + ' Lakh');
  if (thou)  parts.push(twoDigits(thou) + ' Thousand');
  if (rest)  parts.push(threeDigits(rest));
  return parts.join(' ');
}

/**
 * Converts a numeric rupee amount to Indian words.
 * @example amountInWords(1250.50) → "One Thousand Two Hundred Fifty Rupees And Fifty Paise Only"
 */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result = toIndianWords(rupees) + ' Rupees';
  if (paise > 0) result += ' And ' + twoDigits(paise) + ' Paise';
  return result + ' Only';
}
