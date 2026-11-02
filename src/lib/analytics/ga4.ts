import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { logger } from '@/lib/utils/logger';

type GaOverview = {
  totalViews: number;
  uniqueVisitors: number;
  totalEvents: number;
  topPages: Array<{ page: string; views: number }>;
};

type GaPageViewPoint = {
  date: string;
  views: number;
};

type GaDashboardSummary = {
  enabled: boolean;
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ page: string; views: number }>;
};

let cachedClient: BetaAnalyticsDataClient | null | undefined;
let cachedPropertyId: string | null | undefined;

function getPropertyId(): string | null {
  if (cachedPropertyId !== undefined) {
    return cachedPropertyId;
  }

  const rawValue = process.env.GA_PROPERTY_ID?.trim();
  if (!rawValue) {
    cachedPropertyId = null;
    return cachedPropertyId;
  }

  cachedPropertyId = rawValue.startsWith('properties/') ? rawValue : `properties/${rawValue}`;
  return cachedPropertyId;
}

function getCredentials() {
  const rawValue = process.env.GA_SERVICE_ACCOUNT?.trim();
  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as {
    client_email: string;
    private_key: string;
    project_id?: string;
  };
}

function getClient(): BetaAnalyticsDataClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const credentials = getCredentials();
  const propertyId = getPropertyId();
  if (!credentials || !propertyId) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = new BetaAnalyticsDataClient({ credentials });
  return cachedClient;
}

function getDateRange(days: number) {
  return [{ startDate: `${days}daysAgo`, endDate: 'today' }];
}

function toNumber(value?: string | null): number {
  return Number(value || '0');
}

export function isGaReportingConfigured(): boolean {
  return Boolean(getClient() && getPropertyId());
}

export async function getGaOverview(days: number): Promise<GaOverview | null> {
  const client = getClient();
  const property = getPropertyId();
  if (!client || !property) {
    return null;
  }

  const [metricsReport] = await client.runReport({
    property,
    dateRanges: getDateRange(days),
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'eventCount' },
    ],
  });

  const [topPagesReport] = await client.runReport({
    property,
    dateRanges: getDateRange(days),
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  const metricRow = metricsReport.rows?.[0];

  return {
    totalViews: toNumber(metricRow?.metricValues?.[0]?.value),
    uniqueVisitors: toNumber(metricRow?.metricValues?.[1]?.value),
    totalEvents: toNumber(metricRow?.metricValues?.[2]?.value),
    topPages:
      topPagesReport.rows?.map((row) => ({
        page: row.dimensionValues?.[0]?.value || '/',
        views: toNumber(row.metricValues?.[0]?.value),
      })) || [],
  };
}

export async function getGaPageViews(page: string | undefined, days: number): Promise<GaPageViewPoint[] | null> {
  const client = getClient();
  const property = getPropertyId();
  if (!client || !property) {
    return null;
  }

  const dimensionFilter = page
    ? {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { value: page, matchType: 'EXACT' as const },
        },
      }
    : undefined;

  const [report] = await client.runReport({
    property,
    dateRanges: getDateRange(days),
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  return (
    report.rows?.map((row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      views: toNumber(row.metricValues?.[0]?.value),
    })) || []
  );
}

export async function getGaDashboardSummary(days: number): Promise<GaDashboardSummary> {
  try {
    const overview = await getGaOverview(days);
    if (!overview) {
      return {
        enabled: false,
        totalViews: 0,
        uniqueVisitors: 0,
        topPages: [],
      };
    }

    return {
      enabled: true,
      totalViews: overview.totalViews,
      uniqueVisitors: overview.uniqueVisitors,
      topPages: overview.topPages,
    };
  } catch (error) {
    logger.error('[GA4] Failed to fetch dashboard summary', error);
    return {
      enabled: false,
      totalViews: 0,
      uniqueVisitors: 0,
      topPages: [],
    };
  }
}
