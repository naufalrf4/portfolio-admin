import { describe, expect, it } from 'bun:test';
import { updateLogSettingsSchema } from '../log-settings.schema';

describe('updateLogSettingsSchema serviceOverrides', () => {
  it('accepts an empty override map', () => {
    const result = updateLogSettingsSchema.safeParse({
      enabled: true,
      minLevel: 'info',
      serviceOverrides: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts a subset of services', () => {
    const result = updateLogSettingsSchema.safeParse({
      serviceOverrides: { admin: 'warn' },
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.serviceOverrides).toEqual({ admin: 'warn' });
  });

  it('accepts every service at once', () => {
    const result = updateLogSettingsSchema.safeParse({
      serviceOverrides: {
        admin: 'warn',
        'public-astro': 'info',
        'links-astro': 'error',
        'ngl-svelte': 'debug',
        'rag-service': 'warn',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown level', () => {
    const result = updateLogSettingsSchema.safeParse({
      serviceOverrides: { admin: 'verbose' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown service key', () => {
    const result = updateLogSettingsSchema.safeParse({
      serviceOverrides: { 'not-a-service': 'warn' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a full settings payload as the dashboard sends it', () => {
    const result = updateLogSettingsSchema.safeParse({
      enabled: true,
      minLevel: 'info',
      serviceOverrides: {},
      retentionDays: { debug: 7, info: 30, warn: 90, error: 90 },
    });
    expect(result.success).toBe(true);
  });
});
