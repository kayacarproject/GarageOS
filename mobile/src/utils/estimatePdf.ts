import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Linking } from 'react-native';
import type { EstimateItem } from '../types';

export interface EstimatePdfData {
  estimateNo: string;
  estimateDate: string;
  companyName: string;
  companyEmail?: string;
  vehicleName: string;
  customerName: string;
  customerMobile?: string;
  items: EstimateItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
}

// ─── Amount in words ──────────────────────────────────────────────────────────

function toWords(n: number): string {
  if (n === 0) return 'Zero Rupees only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function convert(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  }
  return convert(Math.floor(n)) + ' Rupees only';
}

function fmt(n: number) {
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildHtml(data: EstimatePdfData): string {
  const rows = data.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'}">
      <td style="text-align:center">${i + 1}</td>
      <td>${item.name}</td>
      <td style="text-align:center">${item.hsn_sac ?? '-'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:center">${item.unit}</td>
      <td style="text-align:right">${fmt(item.unit_price)}</td>
      <td style="text-align:right"><strong>${fmt(item.amount)}</strong></td>
    </tr>
  `).join('');

  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 24px; }
  h1 { text-align:center; font-size:20px; font-weight:800; margin-bottom:16px; letter-spacing:1px; }
  .company-box { border:1px solid #ccc; border-radius:4px; padding:10px; margin-bottom:10px; }
  .company-name { font-size:15px; font-weight:800; }
  .company-email { font-size:11px; color:#555; margin-top:2px; }
  .meta-table { display:flex; border:1px solid #ccc; border-radius:4px; margin-bottom:10px; overflow:hidden; }
  .meta-left { flex:1; padding:10px; border-right:1px solid #ccc; }
  .meta-right { flex:1; padding:10px; }
  .meta-heading { font-size:11px; font-weight:700; color:#555; margin-bottom:4px; }
  .meta-value { font-size:11px; font-weight:600; margin-bottom:2px; }
  table { width:100%; border-collapse:collapse; border:1px solid #ccc; border-radius:4px; overflow:hidden; margin-bottom:10px; }
  th { background:#333; color:#fff; padding:7px 6px; font-size:11px; font-weight:700; }
  td { padding:6px; font-size:11px; border-bottom:1px solid #eee; }
  .totals-section { display:flex; border:1px solid #ccc; border-radius:4px; overflow:hidden; margin-bottom:10px; }
  .totals-left { flex:1; padding:10px; border-right:1px solid #ccc; }
  .totals-right { width:220px; padding:10px; }
  .words-label { font-size:10px; font-weight:700; color:#555; margin-bottom:3px; }
  .words-value { font-size:10px; line-height:1.5; }
  .total-line { display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px; }
  .grand-line { display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:4px; margin-top:2px; font-size:13px; font-weight:800; }
  .terms-box { border:1px solid #ccc; border-radius:4px; padding:10px; margin-bottom:10px; }
  .terms-heading { font-size:11px; font-weight:700; color:#555; margin-bottom:4px; }
  .terms-text { font-size:11px; color:#333; }
  .signature-row { display:flex; justify-content:flex-end; }
  .signature-box { border:1px solid #ccc; width:130px; height:60px; border-radius:4px; margin:8px 0 4px; }
  .signature-label { font-size:10px; color:#555; text-align:center; }
  .signature-for { font-size:11px; font-weight:700; }
</style>
</head>
<body>
  <h1>Estimate</h1>

  <div class="company-box">
    <div class="company-name">${data.companyName}</div>
    ${data.companyEmail ? `<div class="company-email">Email: ${data.companyEmail}</div>` : ''}
  </div>

  <div class="meta-table">
    <div class="meta-left">
      <div class="meta-heading">Estimate For:</div>
      <div class="meta-value">${data.vehicleName}</div>
      <div class="meta-value">${data.customerName}</div>
    </div>
    <div class="meta-right">
      <div class="meta-heading">Estimate Details:</div>
      <div class="meta-value">No: ${data.estimateNo}</div>
      <div class="meta-value">Date: ${data.estimateDate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th style="text-align:left">Item Name</th>
        <th style="width:60px">HSN/SAC</th>
        <th style="width:40px">Qty</th>
        <th style="width:40px">Unit</th>
        <th style="width:90px;text-align:right">Price/Unit (₹)</th>
        <th style="width:90px;text-align:right">Amount(₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr style="border-top:2px solid #ccc">
        <td></td><td></td><td></td>
        <td style="text-align:center;font-weight:700">${totalQty}</td>
        <td></td><td></td><td></td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-left">
      <div class="words-label">Estimate Amount In Words :</div>
      <div class="words-value">${toWords(data.total)}</div>
    </div>
    <div class="totals-right">
      <div class="total-line"><span>Sub Total :</span><span>${fmt(data.subtotal)}</span></div>
      ${data.discount > 0 ? `<div class="total-line"><span>Discount :</span><span>- ${fmt(data.discount)}</span></div>` : ''}
      <div class="grand-line"><span>Total :</span><span>${fmt(data.total)}</span></div>
    </div>
  </div>

  <div class="terms-box">
    <div class="terms-heading">Terms And Conditions:</div>
    <div class="terms-text">${data.notes || 'Thank you for doing business with us.'}</div>
  </div>

  <div class="signature-row">
    <div>
      <div class="signature-for">For ${data.companyName}:</div>
      <div class="signature-box"></div>
      <div class="signature-label">Authorized Signatory</div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Generate PDF URI ─────────────────────────────────────────────────────────

export async function generateEstimatePdf(data: EstimatePdfData): Promise<string> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

// ─── Share via any app (WhatsApp, email, etc.) ────────────────────────────────

export async function shareEstimatePdf(data: EstimatePdfData): Promise<void> {
  try {
    const uri = await generateEstimatePdf(data);
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available', 'Your device does not support file sharing.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Estimate ${data.estimateNo}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (e: any) {
    Alert.alert('Error', e.message ?? 'Could not generate PDF.');
  }
}

// ─── Direct WhatsApp share (opens WhatsApp with customer number pre-filled) ───

export async function shareEstimateWhatsApp(
  data: EstimatePdfData,
  onPdfReady: (uri: string) => void,
): Promise<void> {
  try {
    const uri = await generateEstimatePdf(data);
    onPdfReady(uri);

    // Open WhatsApp with customer number if available
    if (data.customerMobile) {
      const phone = data.customerMobile.replace(/\D/g, '');
      const countryPhone = phone.startsWith('91') ? phone : `91${phone}`;
      const waUrl = `whatsapp://send?phone=${countryPhone}`;
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        // Share the PDF file first, then open WhatsApp
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share Estimate ${data.estimateNo} via WhatsApp`,
            UTI: 'com.adobe.pdf',
          });
        }
      } else {
        Alert.alert('WhatsApp not installed', 'WhatsApp is not installed on this device.', [
          { text: 'Share via other apps', onPress: () => shareEstimatePdf(data) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } else {
      await shareEstimatePdf(data);
    }
  } catch (e: any) {
    Alert.alert('Error', e.message ?? 'Could not generate PDF.');
  }
}
