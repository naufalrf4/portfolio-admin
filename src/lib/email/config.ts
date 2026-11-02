import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '@/lib/utils/logger';

function parseSmtpPort(): number | null {
  const rawPort = process.env.SMTP_PORT?.trim();
  if (!rawPort) {
    return null;
  }

  const port = Number(rawPort);
  return Number.isInteger(port) && port > 0 ? port : null;
}

function parseSmtpSecure(): boolean {
  return process.env.SMTP_SECURE?.trim().toLowerCase() === 'true';
}

let cachedTransporter: Transporter | null | undefined;

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM?.trim() || 'NaufalRF Portfolio <noreply@naufalrf.net>',
  adminDashboardUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001',
  publicSiteUrl:
    process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://naufalrf.net',
} as const;

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
    parseSmtpPort() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim() &&
    process.env.EMAIL_FROM?.trim()
  );
}

export function getEmailTransporter(): Transporter | null {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  if (!isEmailConfigured()) {
    logger.warn('[Email] SMTP is not fully configured - email sending will be disabled');
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port: parseSmtpPort()!,
    secure: parseSmtpSecure(),
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });

  return cachedTransporter;
}
