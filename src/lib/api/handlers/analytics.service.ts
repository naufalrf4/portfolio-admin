import { db } from '@/lib/db';
import { eq, and, gte, asc, desc, count, isNotNull } from 'drizzle-orm';
import {
  analyticsEvents,
  anonymousMessages,
  bookings,
  contactForms,
  guestbookEntries,
} from '@/lib/db/schema';
import { createId } from '@paralleldrive/cuid2';
import type { CreateAnalyticsEventInput } from '@/lib/validations/analytics.schema';
import { getGaDashboardSummary, getGaOverview, getGaPageViews } from '@/lib/analytics/ga4';
import { logger } from '@/lib/utils/logger';
import { getJakartaDateKey, subtractDaysFromNow } from '@/lib/utils/date';

type AnalyticsRange = '7d' | '30d' | '90d';
type AnalyticsEventInsert = typeof analyticsEvents.$inferInsert;

type SubmissionRecord = {
  id: string;
  type: 'contact' | 'booking' | 'guestbook' | 'message';
  label: string;
  sourceApp: string;
  sourcePath: string;
  countryCode: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  createdAt: string;
};

type TelemetryRecord = {
  id: string;
  entityType: string;
  entityId: string | null;
  page: string;
  eventType: string;
  sourceApp: string;
  sourcePath: string;
  label: string;
  url: string;
  countryCode: string | null;
  country: string | null;
  city: string | null;
  createdAt: string;
};

function getRangeDays(range: AnalyticsRange): number {
  if (range === '90d') return 90;
  if (range === '30d') return 30;
  return 7;
}

function getStartDate(days: number): Date {
  return subtractDaysFromNow(days);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getNullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toDailyBucket(value: string): string {
  return getJakartaDateKey(value);
}

function startCase(value: string): string {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export class AnalyticsService {
  async trackEvent(event: CreateAnalyticsEventInput) {
    const now = new Date().toISOString();
    const eventData: AnalyticsEventInsert = {
      id: createId(),
      page: event.page,
      eventType: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      data: event.data,
      userSession: event.userSession,
      ipAddress: event.ipAddress,
      countryCode: event.countryCode,
      city: event.city,
      createdAt: now,
    };
    const [created] = await db.insert(analyticsEvents).values(eventData).returning();
    return created;
  }

  async getPageViews(page?: string, days: number = 30) {
    try {
      const gaPageViews = await getGaPageViews(page, days);
      if (gaPageViews) {
        return gaPageViews;
      }
    } catch (error) {
      logger.error('[AnalyticsService] Failed to load GA page views, falling back to internal analytics', error);
    }

    const startDate = getStartDate(days);

    const conditions = [
      eq(analyticsEvents.eventType, 'pageview'),
      gte(analyticsEvents.createdAt, startDate.toISOString()),
    ];
    if (page) {
      conditions.push(eq(analyticsEvents.page, page));
    }

    const events = await db
      .select({
        createdAt: analyticsEvents.createdAt,
        page: analyticsEvents.page,
      })
      .from(analyticsEvents)
      .where(and(...conditions))
      .orderBy(asc(analyticsEvents.createdAt));

    const groupedByDate = events.reduce(
      (acc, event) => {
        const date = toDailyBucket(event.createdAt);
        if (!acc[date]) {
          acc[date] = { date, views: 0 };
        }
        acc[date].views++;
        return acc;
      },
      {} as Record<string, { date: string; views: number }>
    );

    return Object.values(groupedByDate);
  }

  async getEntityStats(entityType: string, days: number = 30) {
    const startDate = getStartDate(days);

    const events = await db
      .select({
        entityId: analyticsEvents.entityId,
        eventType: analyticsEvents.eventType,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.entityType, entityType),
          gte(analyticsEvents.createdAt, startDate.toISOString())
        )
      );

    const stats = events.reduce(
      (acc, event) => {
        const key = event.entityId || 'unknown';
        if (!acc[key]) {
          acc[key] = { entityId: key, views: 0, clicks: 0 };
        }
        if (event.eventType === 'pageview') {
          acc[key].views++;
        }
        if (event.eventType === 'click') {
          acc[key].clicks++;
        }
        return acc;
      },
      {} as Record<string, { entityId: string | null; views: number; clicks: number }>
    );

    return Object.values(stats).sort((a, b) => b.views - a.views);
  }

  async getCountryStats(days: number = 30) {
    const startDate = getStartDate(days);

    const events = await db
      .select({
        countryCode: analyticsEvents.countryCode,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'pageview'),
          gte(analyticsEvents.createdAt, startDate.toISOString()),
          isNotNull(analyticsEvents.countryCode)
        )
      );

    const stats = events.reduce(
      (acc, event) => {
        const key = event.countryCode || 'unknown';
        if (!acc[key]) {
          acc[key] = { countryCode: event.countryCode, count: 0 };
        }
        acc[key].count++;
        return acc;
      },
      {} as Record<string, { countryCode: string | null; count: number }>
    );

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }

  async getPopularEntities(entityType: string, limit: number = 10) {
    const events = await db
      .select({
        entityId: analyticsEvents.entityId,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.entityType, entityType),
          eq(analyticsEvents.eventType, 'pageview'),
          isNotNull(analyticsEvents.entityId)
        )
      );

    const counts = events.reduce(
      (acc, event) => {
        const key = event.entityId || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts)
      .map(([entityId, views]) => ({ entityId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async getOverview(days: number = 30) {
    try {
      const gaOverview = await getGaOverview(days);
      if (gaOverview) {
        return gaOverview;
      }
    } catch (error) {
      logger.error('[AnalyticsService] Failed to load GA overview, falling back to internal analytics', error);
    }

    const startDate = getStartDate(days);

    const startDateStr = startDate.toISOString();

    const [totalViewsResult, uniqueSessions, topPagesData, totalEventsResult] = await Promise.all([
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'pageview'),
            gte(analyticsEvents.createdAt, startDateStr)
          )
        ),
      db
        .select({ userSession: analyticsEvents.userSession })
        .from(analyticsEvents)
        .where(
          and(gte(analyticsEvents.createdAt, startDateStr), isNotNull(analyticsEvents.userSession))
        )
        .groupBy(analyticsEvents.userSession),
      db
        .select({
          page: analyticsEvents.page,
          views: count(),
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'pageview'),
            gte(analyticsEvents.createdAt, startDateStr)
          )
        )
        .groupBy(analyticsEvents.page)
        .orderBy(desc(count()))
        .limit(10),
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, startDateStr)),
    ]);

    return {
      totalViews: totalViewsResult[0].value,
      uniqueVisitors: uniqueSessions.length,
      totalEvents: totalEventsResult[0].value,
      topPages: topPagesData.map((item) => ({
        page: item.page,
        views: item.views,
      })),
    };
  }

  async getDashboard(range: AnalyticsRange = '30d') {
    const days = getRangeDays(range);
    const startDate = getStartDate(days).toISOString();

    const [messagesData, contactsData, guestbookData, bookingsData, telemetryData] =
      await Promise.all([
        db
          .select({
            id: anonymousMessages.id,
            content: anonymousMessages.content,
            countryCode: anonymousMessages.countryCode,
            country: anonymousMessages.country,
            city: anonymousMessages.city,
            region: anonymousMessages.region,
            metadata: anonymousMessages.metadata,
            createdAt: anonymousMessages.createdAt,
          })
          .from(anonymousMessages)
          .where(gte(anonymousMessages.createdAt, startDate))
          .orderBy(desc(anonymousMessages.createdAt)),
        db
          .select({
            id: contactForms.id,
            name: contactForms.name,
            subject: contactForms.subject,
            countryCode: contactForms.countryCode,
            country: contactForms.country,
            city: contactForms.city,
            region: contactForms.region,
            metadata: contactForms.metadata,
            createdAt: contactForms.createdAt,
          })
          .from(contactForms)
          .where(gte(contactForms.createdAt, startDate))
          .orderBy(desc(contactForms.createdAt)),
        db
          .select({
            id: guestbookEntries.id,
            message: guestbookEntries.message,
            countryCode: guestbookEntries.countryCode,
            country: guestbookEntries.country,
            city: guestbookEntries.city,
            region: guestbookEntries.region,
            metadata: guestbookEntries.metadata,
            createdAt: guestbookEntries.createdAt,
          })
          .from(guestbookEntries)
          .where(gte(guestbookEntries.createdAt, startDate))
          .orderBy(desc(guestbookEntries.createdAt)),
        db
          .select({
            id: bookings.id,
            name: bookings.name,
            status: bookings.status,
            countryCode: bookings.countryCode,
            country: bookings.country,
            city: bookings.city,
            region: bookings.region,
            metadata: bookings.metadata,
            createdAt: bookings.createdAt,
          })
          .from(bookings)
          .where(gte(bookings.createdAt, startDate))
          .orderBy(desc(bookings.createdAt)),
        db
          .select({
            id: analyticsEvents.id,
            entityType: analyticsEvents.entityType,
            entityId: analyticsEvents.entityId,
            page: analyticsEvents.page,
            eventType: analyticsEvents.eventType,
            data: analyticsEvents.data,
            countryCode: analyticsEvents.countryCode,
            city: analyticsEvents.city,
            createdAt: analyticsEvents.createdAt,
          })
          .from(analyticsEvents)
          .where(gte(analyticsEvents.createdAt, startDate))
          .orderBy(desc(analyticsEvents.createdAt)),
      ]);

    const submissions: SubmissionRecord[] = [
      ...messagesData.map((item) => {
        const metadata = asRecord(item.metadata);
        return {
          id: item.id,
          type: 'message' as const,
          label: item.content,
          sourceApp: getString(metadata, 'sourceApp', 'ngl-svelte'),
          sourcePath: getString(metadata, 'sourcePath', '/'),
          countryCode: item.countryCode,
          country: item.country,
          city: item.city,
          region: item.region,
          createdAt: item.createdAt,
        };
      }),
      ...contactsData.map((item) => {
        const metadata = asRecord(item.metadata);
        return {
          id: item.id,
          type: 'contact' as const,
          label: item.subject || item.name,
          sourceApp: getString(metadata, 'sourceApp', 'public-astro'),
          sourcePath: getString(metadata, 'sourcePath', '/contact'),
          countryCode: item.countryCode,
          country: item.country,
          city: item.city,
          region: item.region,
          createdAt: item.createdAt,
        };
      }),
      ...guestbookData.map((item) => {
        const metadata = asRecord(item.metadata);
        return {
          id: item.id,
          type: 'guestbook' as const,
          label: item.message,
          sourceApp: getString(metadata, 'sourceApp', 'public-astro'),
          sourcePath: getString(metadata, 'sourcePath', '/#guestbook'),
          countryCode: item.countryCode,
          country: item.country,
          city: item.city,
          region: item.region,
          createdAt: item.createdAt,
        };
      }),
      ...bookingsData.map((item) => {
        const metadata = asRecord(item.metadata);
        return {
          id: item.id,
          type: 'booking' as const,
          label: `${item.name} (${item.status})`,
          sourceApp: getString(metadata, 'sourceApp', 'public-astro'),
          sourcePath: getString(metadata, 'sourcePath', '/contact#booking'),
          countryCode: item.countryCode,
          country: item.country,
          city: item.city,
          region: item.region,
          createdAt: item.createdAt,
        };
      }),
    ].sort((first, second) => second.createdAt.localeCompare(first.createdAt));

    const telemetry: TelemetryRecord[] = telemetryData.map((item) => {
      const metadata = asRecord(item.data);
      return {
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        page: item.page,
        eventType: item.eventType,
        sourceApp: getString(metadata, 'sourceApp', 'unknown'),
        sourcePath: getString(metadata, 'sourcePath', item.page),
        label: getString(metadata, 'label', item.entityId || item.entityType),
        url: getString(metadata, 'url', ''),
        countryCode: item.countryCode,
        country: getNullableString(metadata, 'country'),
        city: item.city,
        createdAt: item.createdAt,
      };
    });

    const countriesMap = new Map<string, { country: string; count: number }>();
    submissions.forEach((item) => {
      if (!item.countryCode || !item.country) return;
      const existing = countriesMap.get(item.countryCode) ?? { country: item.country, count: 0 };
      existing.count += 1;
      countriesMap.set(item.countryCode, existing);
    });
    const totalCountryCount = Array.from(countriesMap.values()).reduce(
      (sum, item) => sum + item.count,
      0
    );

    const sourceAppMap = new Map<string, { submissions: number; clicks: number }>();
    submissions.forEach((item) => {
      const stats = sourceAppMap.get(item.sourceApp) ?? { submissions: 0, clicks: 0 };
      stats.submissions += 1;
      sourceAppMap.set(item.sourceApp, stats);
    });
    telemetry.forEach((item) => {
      const stats = sourceAppMap.get(item.sourceApp) ?? { submissions: 0, clicks: 0 };
      if (item.eventType === 'click') {
        stats.clicks += 1;
      }
      sourceAppMap.set(item.sourceApp, stats);
    });

    const interactionTypeMap = new Map<string, number>();
    submissions.forEach((item) => {
      interactionTypeMap.set(item.type, (interactionTypeMap.get(item.type) ?? 0) + 1);
    });

    const trendMap = new Map<string, { submissions: number; clicks: number }>();
    submissions.forEach((item) => {
      const key = toDailyBucket(item.createdAt);
      const stats = trendMap.get(key) ?? { submissions: 0, clicks: 0 };
      stats.submissions += 1;
      trendMap.set(key, stats);
    });
    telemetry.forEach((item) => {
      const key = toDailyBucket(item.createdAt);
      const stats = trendMap.get(key) ?? { submissions: 0, clicks: 0 };
      if (item.eventType === 'click') {
        stats.clicks += 1;
      }
      trendMap.set(key, stats);
    });

    const linkStatsMap = new Map<
      string,
      { label: string; clicks: number; type: string; sourceApp: string }
    >();
    telemetry
      .filter((item) => item.eventType === 'click')
      .forEach((item) => {
        const key = item.entityId || `${item.entityType}:${item.label}`;
        const existing = linkStatsMap.get(key) ?? {
          label: item.label,
          clicks: 0,
          type: item.entityType,
          sourceApp: item.sourceApp,
        };
        existing.clicks += 1;
        linkStatsMap.set(key, existing);
      });

    const gaSummary = await getGaDashboardSummary(days);

    return {
      range,
      overview: {
        totalSubmissions: submissions.length,
        totalClicks: telemetry.filter((item) => item.eventType === 'click').length,
        uniqueCountries: countriesMap.size,
        sourceApps: sourceAppMap.size,
      },
      ga4: gaSummary,
      trend: Array.from(trendMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((first, second) => first.date.localeCompare(second.date)),
      countries: Array.from(countriesMap.entries())
        .map(([code, value]) => ({
          code,
          country: value.country,
          count: value.count,
          percentage:
            totalCountryCount > 0
              ? Number(((value.count / totalCountryCount) * 100).toFixed(1))
              : 0,
        }))
        .sort((first, second) => second.count - first.count),
      sourceApps: Array.from(sourceAppMap.entries())
        .map(([app, value]) => ({
          app,
          submissions: value.submissions,
          clicks: value.clicks,
          total: value.submissions + value.clicks,
        }))
        .sort((first, second) => second.total - first.total),
      interactionTypes: Array.from(interactionTypeMap.entries())
        .map(([type, value]) => ({
          type,
          label: startCase(type),
          count: value,
        }))
        .sort((first, second) => second.count - first.count),
      locationItems: submissions.map((item) => ({
        id: item.id,
        type: item.type,
        label: item.label,
        sourceApp: item.sourceApp,
        sourcePath: item.sourcePath,
        countryCode: item.countryCode,
        country: item.country,
        city: item.city,
        region: item.region,
        createdAt: item.createdAt,
      })),
      topLinks: Array.from(linkStatsMap.entries())
        .map(([id, value]) => ({
          id,
          label: value.label,
          clicks: value.clicks,
          type: value.type,
          sourceApp: value.sourceApp,
        }))
        .sort((first, second) => second.clicks - first.clicks)
        .slice(0, 8),
      recentInteractions: submissions.slice(0, 8).map((item) => ({
        id: item.id,
        type: item.type,
        label: item.label,
        sourceApp: item.sourceApp,
        sourcePath: item.sourcePath,
        country: item.country,
        city: item.city,
        createdAt: item.createdAt,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
