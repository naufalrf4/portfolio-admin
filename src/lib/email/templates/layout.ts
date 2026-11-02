import { EMAIL_CONFIG } from '../config';
import { escapeHtml } from './helper';

type EmailLayoutOptions = {
  preheader: string;
  content: string;
};

const PALETTE = {
  bg: '#faf8f4',
  bgElevated: '#f2eee6',
  bgCard: '#ffffff',
  border: '#d4cdbf',
  borderSoft: '#e4ded2',
  textPrimary: '#211c15',
  textSecondary: '#6b6558',
  textTertiary: '#9a9384',
  teal: '#0f8577',
  amber: '#a8661b',
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const assetBase = EMAIL_CONFIG.publicSiteUrl.replace(/\/+$/, '');
const logoUrl = `${assetBase}/logo-email.png`;

export function emailLayout({ preheader, content }: EmailLayoutOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NaufalRF Portfolio</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: ${PALETTE.bg};
      color: ${PALETTE.textPrimary};
      font-family: ${FONT_STACK};
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
      overflow: hidden;
      mso-hide: all;
    }
    .shell {
      width: 100%;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .frame {
      max-width: 640px;
      margin: 0 auto;
      background: ${PALETTE.bgCard};
      border: 1px solid ${PALETTE.border};
      border-radius: 16px;
      overflow: hidden;
    }
    .top-line {
      height: 4px;
      background: linear-gradient(90deg, ${PALETTE.teal} 0%, ${PALETTE.amber} 100%);
    }
    .masthead {
      padding: 24px 32px 0;
    }
    .masthead-logo {
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    .hero {
      padding: 24px 32px 12px;
    }
    .eyebrow {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${PALETTE.teal};
    }
    .hero h1 {
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.2;
      color: ${PALETTE.textPrimary};
    }
    .hero-copy {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: ${PALETTE.textSecondary};
    }
    .content {
      padding: 0 32px 32px;
    }
    .card {
      background: ${PALETTE.bgCard};
      border: 1px solid ${PALETTE.border};
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }
    .details-table {
      border-collapse: collapse;
    }
    .details-table tr + tr td {
      border-top: 1px solid ${PALETTE.borderSoft};
    }
    .detail-label,
    .detail-value {
      padding: 12px 0;
      vertical-align: top;
      font-size: 14px;
      line-height: 1.5;
    }
    .detail-label {
      width: 38%;
      color: ${PALETTE.textTertiary};
      padding-right: 16px;
    }
    .detail-value {
      color: ${PALETTE.textPrimary};
      font-weight: 600;
      word-break: break-word;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .message-block {
      margin-top: 16px;
      padding: 16px 18px;
      border-radius: 12px;
      background: ${PALETTE.bgElevated};
      border: 1px solid ${PALETTE.border};
    }
    .message-label {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${PALETTE.textSecondary};
    }
    .message-body {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: ${PALETTE.textPrimary};
    }
    .button-group {
      margin-top: 18px;
      text-align: left;
    }
    .button {
      display: inline-block;
      margin: 0 12px 12px 0;
      padding: 12px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }
    .meta-note {
      margin: 14px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: ${PALETTE.textSecondary};
    }
    .footer {
      padding: 0 32px 30px;
    }
    .footer-card {
      background: ${PALETTE.bgElevated};
      border: 1px solid ${PALETTE.border};
      border-radius: 12px;
      padding: 18px 20px;
      font-size: 13px;
      line-height: 1.6;
      color: ${PALETTE.textSecondary};
    }
    .footer-card strong {
      color: ${PALETTE.textPrimary};
    }
    .footer-card a {
      color: ${PALETTE.teal};
      text-decoration: none;
    }
    @media only screen and (max-width: 640px) {
      .shell {
        padding: 12px;
      }
      .masthead,
      .hero,
      .content,
      .footer {
        padding-left: 20px;
        padding-right: 20px;
      }
      .hero h1 {
        font-size: 24px;
      }
      .card {
        padding: 16px;
      }
      .detail-label,
      .detail-value {
        display: block;
        width: 100%;
        padding: 6px 0;
      }
      .detail-label {
        padding-bottom: 0;
      }
      .button {
        display: block;
        width: auto;
        text-align: center;
        margin-right: 0;
      }
    }
  </style>
</head>
<body>
  <div class="preheader">${escapeHtml(preheader)}</div>
  <div class="shell">
    <div class="frame">
      <div class="top-line"></div>
      <div class="masthead">
        <img
          src="${logoUrl}"
          alt="NaufalRF"
          width="40"
          height="40"
          class="masthead-logo"
        />
      </div>
      ${content}
      <div class="footer">
        <div class="footer-card">
          <strong>NaufalRF Portfolio</strong><br />
          Booking updates, inbox replies, and portfolio support<br />
          <a href="${assetBase}">${assetBase.replace(/^https?:\/\//, '')}</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
