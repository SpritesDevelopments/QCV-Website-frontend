/**
 * Email service — sends transactional emails via SMTP (MailerSend relay).
 * Server-side only (uses env vars without NEXT_PUBLIC_ prefix).
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailersend.net';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USERNAME = process.env.SMTP_USERNAME || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const FROM_EMAIL = (process.env.MAILERSEND_FROM_EMAIL || process.env.SMTP_USERNAME || 'noreply@quantumcodevault.com').trim();
const FROM_NAME = 'Quantum Code Vault';

interface SendEmailOptions {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!SMTP_USERNAME || !SMTP_PASSWORD) {
    console.error('[Email] SMTP_USERNAME or SMTP_PASSWORD not configured');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to.email,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`[Email] Sent to ${options.to.email}: ${options.subject}`);
    return true;
  } catch (err) {
    console.error('[Email] SMTP error:', err);
    return false;
  }
}

// ── Email templates ──────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f23;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
<div style="background:linear-gradient(135deg,#1a1a3e,#0f0f23);border:1px solid #2d2d5e;border-radius:12px;padding:40px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#a78bfa;margin:0;font-size:24px;font-weight:700;">⚡ Quantum Code Vault</h1>
  </div>
  ${content}
  <hr style="border:none;border-top:1px solid #2d2d5e;margin:30px 0;">
  <p style="color:#606080;font-size:11px;text-align:center;margin:0;">&copy; ${new Date().getFullYear()} Quantum Code Vault. All rights reserved.</p>
</div>
</div>
</body></html>`;
}

function actionButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:30px 0;">
  <a href="${url}" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">${text}</a>
</div>`;
}

export function passwordResetEmail(username: string, resetUrl: string) {
  return {
    subject: 'Reset your Quantum Code Vault password',
    html: emailWrapper(`
      <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 16px;">Hello ${username},</p>
      <p style="color:#c0c0c0;font-size:14px;line-height:1.6;margin:0 0 8px;">
        We received a request to reset the password for your account. Click the button below to choose a new password.
      </p>
      ${actionButton('Reset Password', resetUrl)}
      <p style="color:#808080;font-size:12px;line-height:1.5;margin:0;">
        This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
      </p>
    `),
    text: `Hello ${username},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  };
}

export function verificationEmail(username: string, verifyUrl: string) {
  return {
    subject: 'Verify your Quantum Code Vault email',
    html: emailWrapper(`
      <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 16px;">Welcome ${username}! 🎉</p>
      <p style="color:#c0c0c0;font-size:14px;line-height:1.6;margin:0 0 8px;">
        Thanks for creating your Quantum Code Vault account. Please verify your email address by clicking the button below.
      </p>
      ${actionButton('Verify Email', verifyUrl)}
      <p style="color:#808080;font-size:12px;line-height:1.5;margin:0;">
        This link will expire in <strong>24 hours</strong>. If you didn't create this account, you can safely ignore this email.
      </p>
    `),
    text: `Welcome ${username}!\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  };
}
