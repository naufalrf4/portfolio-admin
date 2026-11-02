import { describe, it, expect } from 'bun:test';
import { meetsLevel } from '@naufalrf/contracts';
import { logLevelSchema } from '@/lib/validations/log-settings.schema';

describe('admin bun test harness', () => {
  it('resolves workspace packages', () => {
    expect(meetsLevel('error', 'warn')).toBe(true);
    expect(meetsLevel('debug', 'warn')).toBe(false);
  });

  it('resolves the @/ tsconfig path alias', () => {
    expect(logLevelSchema.parse('warn')).toBe('warn');
    expect(logLevelSchema.safeParse('nope').success).toBe(false);
  });
});
