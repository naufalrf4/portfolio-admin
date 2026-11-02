export interface InteractionOverview {
  totalSubmissions: number;
  totalClicks: number;
  uniqueCountries: number;
  sourceApps: number;
}

export interface InteractionTrendPoint {
  date: string;
  submissions: number;
  clicks: number;
}

export interface InteractionCountryStat {
  code: string;
  country: string;
  count: number;
  percentage: number;
}

export interface InteractionSourceAppStat {
  app: string;
  submissions: number;
  clicks: number;
  total: number;
}

export interface InteractionTypeStat {
  type: string;
  label: string;
  count: number;
}

export interface InteractionLocationItem {
  id: string;
  type: string;
  label: string;
  sourceApp: string;
  sourcePath: string;
  countryCode: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  createdAt: string;
}

export interface TelemetryLinkStat {
  id: string;
  label: string;
  clicks: number;
  type: string;
  sourceApp: string;
}

export interface RecentInteraction {
  id: string;
  type: string;
  label: string;
  sourceApp: string;
  sourcePath: string;
  country: string | null;
  city: string | null;
  createdAt: string;
}

export interface AnalyticsDashboardData {
  range: '7d' | '30d' | '90d';
  overview: InteractionOverview;
  trend: InteractionTrendPoint[];
  countries: InteractionCountryStat[];
  sourceApps: InteractionSourceAppStat[];
  interactionTypes: InteractionTypeStat[];
  locationItems: InteractionLocationItem[];
  topLinks: TelemetryLinkStat[];
  recentInteractions: RecentInteraction[];
}
