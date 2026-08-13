import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST is not set — emails will be logged to the console instead of sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  return transporter;
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via the configured SMTP transport. Falls back to a console
 * log in local development when SMTP env vars aren't set, so the rest of
 * the app (contact form, booking confirmations, etc.) keeps working
 * without requiring real credentials during development.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const from = process.env.SMTP_FROM || 'The Barber Co. <no-reply@barberco.com>';
  const t = getTransporter();

  if (!t) {
    console.log(`[email:dev-mode] to=${to} subject="${subject}"`);
    return { messageId: 'dev-mode', accepted: [to] };
  }

  return t.sendMail({ from, to, subject, html });
}
