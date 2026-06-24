import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// Public contact form submissions from the static SAUS website.
// No authentication — anyone may submit. Spam is bounded by the per-IP
// rate limiter applied to /api/contact in index.ts.

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(200),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  source: z.enum(['contact', 'guidance']).default('contact'),
});

router.post('/', async (req, res) => {
  // Honeypot: a hidden field no human fills. If populated, it's a bot —
  // pretend success (200) so the bot can't tell it was rejected, and save nothing.
  if (req.body && typeof req.body.company === 'string' && req.body.company.trim() !== '') {
    return res.status(200).json({ ok: true });
  }
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid form data',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, subject, message, source } = parsed.data;
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();

  try {
    const saved = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        source,
        ipAddress: forwarded || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    // Fire-and-forget email notification; the message is already persisted,
    // so a mail failure must NOT fail the request.
    notifySecretariat({ name, email, subject, message }).catch((err) =>
      console.error('[contact] email notification failed:', err?.message || err),
    );

    return res.status(201).json({ ok: true, id: saved.id });
  } catch (err: any) {
    console.error('[contact] failed to save message:', err?.message || err);
    return res.status(500).json({
      error: 'Could not submit your message. Please email Secretariat@saus.org.za directly.',
    });
  }
});

// Sends an email to the Secretariat when SMTP is configured. If SMTP env
// vars are absent (e.g. before mail is set up), this is a no-op — the
// message still lives in the database and is visible in the admin CMS.
async function notifySecretariat(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const port = Number(SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"SAUS Website" <${SMTP_USER}>`,
    to: CONTACT_TO || 'Secretariat@saus.org.za',
    replyTo: msg.email,
    subject: `[SAUS Contact] ${msg.subject || 'New enquiry'} — from ${msg.name}`,
    text:
      `New enquiry from the SAUS website\n\n` +
      `Name:    ${msg.name}\n` +
      `Email:   ${msg.email}\n` +
      `Subject: ${msg.subject || '(none)'}\n\n` +
      `${msg.message}\n`,
  });
}

export default router;
