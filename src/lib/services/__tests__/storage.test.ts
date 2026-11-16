import { describe, expect, test } from 'bun:test';
import { normalizeStoredAssetValue } from '../storage';

describe('normalizeStoredAssetValue', () => {
  test('extracts a durable key from a signed Cloudflare R2 URL', () => {
    expect(
      normalizeStoredAssetValue(
        'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com/about/avatar.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc'
      )
    ).toBe('about/avatar.png');
  });
});
