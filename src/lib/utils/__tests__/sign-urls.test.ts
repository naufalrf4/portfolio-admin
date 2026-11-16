import { describe, expect, test } from 'bun:test';
import { mapPublicImageUrls } from '../sign-urls';

describe('mapPublicImageUrls', () => {
  test('maps a signed R2 image URL to its stable public asset URL', () => {
    const result = mapPublicImageUrls(
      { images: [{ url: 'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com/projects/cover.png?X-Amz-Signature=expired', key: 'projects/cover.png' }] },
      { nested: { images: ['url'] } }
    );

    expect(result.images[0].url).toBe('https://assets.naufalrf.net/projects/cover.png');
    expect(result.images[0]).not.toHaveProperty('key');
  });
});
