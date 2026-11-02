import type { NextRequest } from 'next/server';
import { getCountryNameFromCode, getIpLocation } from '@/lib/services/geoIpService';
import { hashIp } from '@/lib/utils/hash';

export interface SubmissionMetadata {
  sourceApp: string | null;
  sourcePath: string | null;
  userAgent: string | null;
  language: string | null;
  referrer: string | null;
  referrerDomain: string | null;
  timezone: string | null;
}

export interface SubmissionContext {
  ipHash: string;
  ipAddress: string | null;
  countryCode: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  metadata: SubmissionMetadata;
}

function normalizeHeaderValue(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean);
    const trusted = hops[hops.length - 1];
    if (trusted) {
      return trusted;
    }
  }

  const directIp = normalizeHeaderValue(request.headers.get('x-real-ip'), 64);
  if (directIp) {
    return directIp;
  }

  return 'unknown';
}

function getCountryCodeFromHeaders(request: NextRequest): string | null {
  const candidates = [
    request.headers.get('cf-ipcountry'),
    request.headers.get('x-vercel-ip-country'),
    request.headers.get('x-appengine-country'),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeHeaderValue(candidate, 2)?.toUpperCase();
    if (normalized && /^[A-Z]{2}$/.test(normalized)) {
      return normalized;
    }
  }

  return null;
}

function getCityFromHeaders(request: NextRequest): string | null {
  return (
    normalizeHeaderValue(request.headers.get('x-vercel-ip-city'), 100) ||
    normalizeHeaderValue(request.headers.get('x-appengine-city'), 100)
  );
}

function getRegionFromHeaders(request: NextRequest): string | null {
  return (
    normalizeHeaderValue(request.headers.get('x-vercel-ip-country-region'), 100) ||
    normalizeHeaderValue(request.headers.get('x-appengine-region'), 100)
  );
}

function inferCountryCodeFromTimezone(timezone: string | null): string | null {
  if (!timezone) {
    return null;
  }

  const normalized = timezone.trim();
  if (['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Asia/Pontianak'].includes(normalized)) {
    return 'ID';
  }

  return null;
}

function getReferrerDomain(referrer: string | null): string | null {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).hostname || null;
  } catch {
    return null;
  }
}

function getLanguage(request: NextRequest): string | null {
  const rawLanguage = normalizeHeaderValue(request.headers.get('accept-language'), 64);
  if (!rawLanguage) {
    return null;
  }

  const firstLanguage = rawLanguage.split(',')[0]?.trim();
  return firstLanguage ? firstLanguage.slice(0, 16) : null;
}

export function getSubmissionContext(request: NextRequest): SubmissionContext {
  const clientIp = getClientIp(request);
  const referrer = normalizeHeaderValue(request.headers.get('referer'), 512);
  const timezone = normalizeHeaderValue(request.headers.get('x-portfolio-timezone'), 100);
  const headerCountryCode = getCountryCodeFromHeaders(request);
  const geoLocation = clientIp === 'unknown' ? null : getIpLocation(clientIp);
  const timezoneCountryCode = inferCountryCodeFromTimezone(timezone);
  const effectiveCountryCode =
    headerCountryCode ||
    (timezoneCountryCode && (!geoLocation?.countryCode || geoLocation.countryCode === 'SG')
      ? timezoneCountryCode
      : null) ||
    geoLocation?.countryCode ||
    null;

  return {
    ipHash: hashIp(clientIp),
    ipAddress: clientIp === 'unknown' ? null : clientIp,
    countryCode: effectiveCountryCode,
    country: getCountryNameFromCode(effectiveCountryCode) || geoLocation?.country || null,
    city: getCityFromHeaders(request) || geoLocation?.city || null,
    region: getRegionFromHeaders(request) || geoLocation?.region || null,
    metadata: {
      sourceApp: normalizeHeaderValue(request.headers.get('x-portfolio-source-app'), 64),
      sourcePath: normalizeHeaderValue(request.headers.get('x-portfolio-source-path'), 255),
      userAgent: normalizeHeaderValue(request.headers.get('user-agent'), 512),
      language: getLanguage(request),
      referrer,
      referrerDomain: getReferrerDomain(referrer),
      timezone,
    },
  };
}
