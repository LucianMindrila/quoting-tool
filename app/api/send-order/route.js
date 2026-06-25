import nodemailer from 'nodemailer';
import { generateXLSBase64, getXLSFilename } from '@/lib/xlsExport';
import { getInvoicePDFBase64 } from '@/lib/pdfExport';
import { generateICS } from '@/lib/icsExport';
import { DELIVERY_CHARGE } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rateLimit';

const CUTTING_EDGE_EMAIL = 'hello@cuttingedgebespoke.co.uk';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CUTTING_EDGE_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function customerEmailHTML(customerName, jobRef, fulfilment) {
  const f = fulfilment || {};
  const label = f.type === 'delivery' ? 'Delivery' : 'Collection';
  const addrStr = f.type === 'delivery' && f.address
    ? [f.address.name, f.address.line1, f.address.line2, f.address.postcode].filter(Boolean).join(', ')
    : null;

  const fulfilmentBlock = f.type ? `
    <!-- Fulfilment -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f0f9f5;border-radius:6px;border-left:4px solid #0F6E56;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#0F6E56;">${label} Details</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#666;padding:3px 16px 3px 0;min-width:140px;">${label} Date</td>
              <td style="font-size:13px;color:#222;font-weight:600;">${f.date}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:3px 16px 3px 0;">Time Slot</td>
              <td style="font-size:13px;color:#222;font-weight:600;">${f.time}</td>
            </tr>
            ${addrStr ? `<tr>
              <td style="font-size:13px;color:#666;padding:3px 16px 3px 0;">Delivery Address</td>
              <td style="font-size:13px;color:#222;font-weight:600;">${addrStr}</td>
            </tr>` : ''}
          </table>
          ${f.earlyDate ? `<p style="margin:10px 0 0;font-size:12px;color:#b45309;">⚠ Your requested date is within our standard 5 working day lead time. We will contact you shortly to confirm availability.</p>` : ''}
          ${f.type === 'delivery' ? `<p style="margin:10px 0 0;font-size:12px;color:#1e40af;background:#eff6ff;padding:10px 12px;border-radius:4px;border-left:3px solid #93c5fd;">🚚 <strong>Delivery charge:</strong> A flat delivery charge of <strong>£75.00</strong> has been added to your invoice. We will be in touch to confirm your delivery date and time.</p>` : ''}
        </td>
      </tr>
    </table>` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#0F6E56;padding:28px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;">
                  <svg viewBox="0 0 56 64" width="40" height="46" xmlns="http://www.w3.org/2000/svg">
                    <defs><clipPath id="ch"><rect x="0" y="0" width="50" height="64" rx="5"/></clipPath></defs>
                    <rect x="0" y="0" width="50" height="64" rx="5" fill="#ffffff" fill-opacity="0.15"/>
                    <line x1="40" y1="0" x2="8" y2="64" stroke="#ffffff" stroke-width="12" stroke-opacity="0.25" stroke-linecap="round" clip-path="url(#ch)"/>
                    <line x1="40" y1="0" x2="8" y2="64" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" clip-path="url(#ch)"/>
                    <circle cx="40" cy="0" r="2.5" fill="#ffffff"/>
                    <circle cx="8" cy="64" r="2.5" fill="#ffffff"/>
                  </svg>
                </td>
                <td>
                  <div style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.1;">Cutting</div>
                  <div style="color:#9FE1CB;font-size:28px;font-weight:700;line-height:1.1;">EDGE</div>
                </td>
                <td style="padding-left:24px;border-left:1px solid rgba(255,255,255,0.3);padding-left:20px;">
                  <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-bottom:4px;">Bespoke Panel Processing</div>
                  <div style="color:#9FE1CB;font-size:12px;">${CUTTING_EDGE_EMAIL}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#0F6E56;">Order Confirmation</h2>
            <p style="margin:0 0 24px;font-size:13px;color:#888;">Reference: <strong style="color:#222;">${jobRef}</strong></p>

            <p style="font-size:15px;color:#333;line-height:1.6;">Dear ${customerName},</p>
            <p style="font-size:15px;color:#333;line-height:1.6;">
              Thank you for placing your order with Cutting Edge. We have received your cutting list
              and our team will begin processing it shortly.
            </p>

            <!-- Order summary box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f0f9f5;border-radius:6px;border-left:4px solid #0F6E56;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#0F6E56;">Order Details</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#666;padding:3px 16px 3px 0;min-width:120px;">Customer</td>
                      <td style="font-size:13px;color:#222;font-weight:600;">${customerName}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#666;padding:3px 16px 3px 0;">Job Reference</td>
                      <td style="font-size:13px;color:#222;font-weight:600;">${jobRef}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${fulfilmentBlock}

            <p style="font-size:15px;color:#333;line-height:1.6;">
              Your cutting list is attached as an Excel file for your records.
              ${f.isoDate ? `A calendar invite is also attached — click it to add this ${f.type || 'appointment'} to your calendar.` : ''}
            </p>
            <p style="font-size:15px;color:#333;line-height:1.6;">
              If you have any questions or need to make changes, please don't hesitate to get in touch
              by replying to this email.
            </p>

            <p style="font-size:15px;color:#333;line-height:1.6;">Kind regards,<br>
            <strong>The Cutting Edge Team</strong></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              Cutting Edge · Bespoke Panel Processing · ${CUTTING_EDGE_EMAIL}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminEmailHTML(customerName, customerEmail, jobRef, fulfilment) {
  const f = fulfilment || {};
  const fulfilmentRows = f.type ? `
  <tr><td style="color:#666;padding-right:16px;padding-top:12px;"><strong>Fulfilment</strong></td><td><strong style="color:#0F6E56;text-transform:capitalize;">${f.type}</strong></td></tr>
  <tr><td style="color:#666;padding-right:16px;">Requested Date</td><td><strong>${f.date || '—'}</strong></td></tr>
  <tr><td style="color:#666;padding-right:16px;">Requested Time</td><td><strong>${f.time || '—'}</strong></td></tr>
  ${f.type === 'delivery' && f.address ? `
  <tr><td style="color:#666;padding-right:16px;">Delivery Address</td><td>
    ${[f.address.name, f.address.line1, f.address.line2, f.address.postcode].filter(Boolean).join(', ')}
  </td></tr>` : ''}
  ${f.type === 'delivery' ? `<tr><td style="color:#666;padding-right:16px;">Delivery Charge</td><td><strong>£75.00</strong></td></tr>` : ''}
  ${f.earlyDate ? `<tr><td colspan="2" style="color:#b45309;padding-top:8px;">⚠ Requested date is within 5 working days — contact customer to confirm.</td></tr>` : ''}
  ` : '';

  return `
<p><strong>New order received via Cutting Edge Quoting Tool</strong></p>
<table cellpadding="4" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
  <tr><td style="color:#666;padding-right:16px;">Customer</td><td><strong>${customerName}</strong></td></tr>
  <tr><td style="color:#666;padding-right:16px;">Email</td><td>${customerEmail}</td></tr>
  <tr><td style="color:#666;padding-right:16px;">Job Reference</td><td><strong>${jobRef}</strong></td></tr>
  ${fulfilmentRows}
</table>
<p style="margin-top:12px;">The cutting list (Excel) and invoice (PDF) are attached.</p>`;
}

export async function POST(req) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return Response.json({ ok: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { customerName, customerEmail, jobRef, breakdown, fulfilment } = await req.json();

    // ── Input validation ──────────────────────────────────────────────
    if (!customerName || !customerEmail || !jobRef || !breakdown) {
      return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof customerName !== 'string' || customerName.length > 100) {
      return Response.json({ ok: false, error: 'Invalid customer name' }, { status: 400 });
    }
    if (typeof customerEmail !== 'string' || customerEmail.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return Response.json({ ok: false, error: 'Invalid email address' }, { status: 400 });
    }
    if (typeof jobRef !== 'string' || jobRef.length > 100) {
      return Response.json({ ok: false, error: 'Invalid job reference' }, { status: 400 });
    }
    if (!Array.isArray(breakdown) || breakdown.length > 50) {
      return Response.json({ ok: false, error: 'Invalid breakdown data' }, { status: 400 });
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      return Response.json({ ok: false, error: 'GMAIL_APP_PASSWORD env var not set' }, { status: 500 });
    }

    const xlsBase64  = generateXLSBase64(breakdown, customerName, jobRef);
    const xlsFilename = getXLSFilename(customerName, jobRef);
    const xlsBuffer  = Buffer.from(xlsBase64, 'base64');

    const icsContent  = fulfilment?.isoDate ? generateICS({
      jobRef, customerName,
      type:    fulfilment.type,
      isoDate: fulfilment.isoDate,
      time:    fulfilment.time,
      address: fulfilment.type === 'delivery' ? fulfilment.address : null,
    }) : null;

    const grandMat      = breakdown.reduce((s, b) => s + b.matCost, 0);
    const grandCut      = breakdown.reduce((s, b) => s + b.cutCost, 0);
    const grandEdge     = breakdown.reduce((s, b) => s + b.edgeCost, 0);
    const grandDelivery = fulfilment?.type === 'delivery' ? DELIVERY_CHARGE : 0;

    const invoiceBase64 = await getInvoicePDFBase64({
      customerName, customerEmail, jobRef,
      breakdown, grandMat, grandCut, grandEdge, grandDelivery, fulfilment,
    });
    const invoiceBuffer = Buffer.from(invoiceBase64, 'base64');
    const invoiceFilename = `Invoice_${jobRef.replace(/[^a-z0-9]/gi, '_')}_${customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    const transporter = getTransporter();

    const icsAttachment = icsContent ? [{
      filename:    `${jobRef.replace(/[^a-z0-9]/gi,'_')}.ics`,
      content:     Buffer.from(icsContent, 'utf8'),
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
    }] : [];

    // Embed structured data for Apps Script calendar automation
    const calendarDataComment = fulfilment?.isoDate
      ? `<!--CUTTING_EDGE_CALENDAR:${JSON.stringify({ jobRef, customerName, customerEmail, type: fulfilment.type, isoDate: fulfilment.isoDate, time: fulfilment.time, address: fulfilment.type === 'delivery' ? fulfilment.address : null })}-->`
      : '';

    // ── Email 1: confirmation to customer ────────────────────────────
    await transporter.sendMail({
      from:        `Cutting Edge <${CUTTING_EDGE_EMAIL}>`,
      replyTo:     CUTTING_EDGE_EMAIL,
      to:          customerEmail,
      subject:     `Order Confirmation — ${jobRef}`,
      html:        customerEmailHTML(customerName, jobRef, fulfilment),
      attachments: [
        {
          filename:    xlsFilename,
          content:     xlsBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        ...icsAttachment,
      ],
    });

    // ── Email 2: order notification to admin with XLS + invoice ──────
    await transporter.sendMail({
      from:    `Cutting Edge <${CUTTING_EDGE_EMAIL}>`,
      to:      CUTTING_EDGE_EMAIL,
      subject: `Order — ${customerName} — ${jobRef}`,
      html:    adminEmailHTML(customerName, customerEmail, jobRef, fulfilment) + calendarDataComment,
      attachments: [
        {
          filename:    xlsFilename,
          content:     xlsBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        {
          filename:    invoiceFilename,
          content:     invoiceBuffer,
          contentType: 'application/pdf',
        },
        ...icsAttachment,
      ],
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[send-order]', err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
