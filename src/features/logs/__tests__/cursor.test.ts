import { describe, expect, it } from 'bun:test';
import { encodeCursor, decodeCursor, getCursorPredicate } from '../utils/cursor';

describe('cursor codec', () => {
  it('encodes URL-safe cursor data when the position is valid', () => {
    const position = { timestamp: '2026-08-28T02:00:00.000Z', id: 'log_123' };

    const cursor = encodeCursor(position);

    expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('decodes the original position when the cursor is valid', () => {
    const position = { timestamp: '2026-08-28T02:00:00.000Z', id: 'log_456' };

    const decoded = decodeCursor(encodeCursor(position));

    expect(decoded).toEqual(position);
  });

  it('matches greater tuples when the descending keyset cursor is provided', () => {
    const predicate = getCursorPredicate({
      timestamp: '2026-08-28T02:00:00.000Z',
      id: 'log_200',
    });

    expect(predicate({ timestamp: '2026-08-28T03:00:00.000Z', id: 'log_100' })).toBe(true);
    expect(predicate({ timestamp: '2026-08-28T02:00:00.000Z', id: 'log_300' })).toBe(true);
    expect(predicate({ timestamp: '2026-08-28T02:00:00.000Z', id: 'log_100' })).toBe(false);
    expect(predicate({ timestamp: '2026-08-28T01:00:00.000Z', id: 'log_300' })).toBe(false);
  });

  it('rejects malformed cursor input at the decode boundary', () => {
    const malformedJson = Buffer.from('{').toString('base64url');
    const malformedPosition = Buffer.from(
      JSON.stringify({ timestamp: 'not-an-instant', id: '' }),
    ).toString('base64url');

    expect(() => decodeCursor(malformedJson)).toThrow();
    expect(() => decodeCursor(malformedPosition)).toThrow();
  });
});
