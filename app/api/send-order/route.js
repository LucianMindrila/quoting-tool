import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { customerName, customerEmail, jobRef, pdfBase64, csvFiles } = await req.json();

    if (!customerName || !customerEmail || !jobRef || !pdfBase64) {
      return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const safe        = s => String(s).replace(/[^a-z0-9]/gi, '_');
    const pdfFilename = `Quote_${safe(jobRef)}_${safe(customerName)}.pdf`;

    const pdfAttachment = {
      filename: pdfFilename,
      content:  pdfBase64,    // Resend accepts base64 string directly
    };

    function assertSent({ data, error }, label) {
      if (error) throw Object.assign(new Error(error.message), { resendError: error, label });
    }

    // ── Email to customer ─────────────────────────────────────────
    assertSent(
      await resend.emails.send({
        from:     'DT Solutions Ltd <onboarding@resend.dev>',
        reply_to: 'lucian@dtsolutionsltd.co.uk',
        to:       customerEmail,
        subject:  `Your Quote — ${jobRef}`,
        html: `
          <p>Dear ${customerName},</p>
          <p>Thank you for your enquiry. Please find attached your quote for
             job reference <strong>${jobRef}</strong>.</p>
          <p>If you have any questions, please reply to this email or contact us directly.</p>
          <br>
          <p>Kind regards,<br>
          <strong>Lucian</strong><br>
          DT Solutions Ltd<br>
          lucian@dtsolutionsltd.co.uk</p>
        `,
        attachments: [pdfAttachment],
      }),
      'customer'
    );

    // ── Email to admin (PDF + all CSVs) ───────────────────────────
    const adminAttachments = [pdfAttachment];
    for (const { filename, content } of (csvFiles || [])) {
      adminAttachments.push({
        filename,
        content: Buffer.from(content, 'utf-8').toString('base64'),
      });
    }

    assertSent(
      await resend.emails.send({
        from:    'DT Solutions Ltd <onboarding@resend.dev>',
        to:      'lucian@dtsolutionsltd.co.uk',
        subject: `New Order — ${customerName} — ${jobRef}`,
        html: `
          <p><strong>New order placed via Quoting Tool</strong></p>
          <ul>
            <li><strong>Customer:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
            <li><strong>Job Reference:</strong> ${jobRef}</li>
          </ul>
          <p>The customer quote PDF and cutting list CSV files are attached.</p>
        `,
        attachments: adminAttachments,
      }),
      'admin'
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[send-order]', err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
