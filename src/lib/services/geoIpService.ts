import * as geoip from 'geoip-lite';

export interface GeoLocation {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  BR: 'Brazil',
  RU: 'Russia',
  ID: 'Indonesia',
  KR: 'South Korea',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  NZ: 'New Zealand',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  ZA: 'South Africa',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  IE: 'Ireland',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  RO: 'Romania',
  HU: 'Hungary',
  UA: 'Ukraine',
  TR: 'Turkey',
  IL: 'Israel',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  HK: 'Hong Kong',
  TW: 'Taiwan',
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

export function getCountryNameFromCode(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  return getCountryName(normalized);
}

export function getIpLocation(ip: string): GeoLocation | null {
  try {
    const result = geoip.lookup(ip);
    if (!result) return null;

    return {
      country: getCountryName(result.country),
      countryCode: result.country,
      city: result.city,
      region: result.region,
    };
  } catch {
    return null;
  }
}
