import { describe, expect, test } from 'bun:test';
import { STORY_DARK_PALETTE, buildStoryHtml } from '../utils/generateMessageImage';

const message = {
  content: 'hello from the void',
  createdAt: '2026-08-29T07:00:00.000Z',
};

describe('buildStoryHtml', () => {
  test('inlines literal token values and never emits an unresolvable var() reference', () => {
    const html = buildStoryHtml(message);

    expect(html).not.toContain('var(--');
    expect(html).toContain(STORY_DARK_PALETTE.bg);
    expect(html).toContain(STORY_DARK_PALETTE.teal);
    expect(html).toContain(STORY_DARK_PALETTE.textPrimary);
  });

  test('drops the retired neumorphic shadow stack', () => {
    const html = buildStoryHtml(message);

    expect(html).not.toContain('163, 177, 198');
    expect(html).not.toContain('rgba(255, 255, 255, 0.5)');
    expect(html).not.toContain('rgba(255, 255, 255, 0.6)');
  });

  test('uses on-accent foreground on accent surfaces instead of hardcoded white', () => {
    const html = buildStoryHtml(message);

    expect(html).toContain(STORY_DARK_PALETTE.onAccent);
    expect(html).not.toContain('#FFFFFF');
  });

  test('avoids background-clip gradient text that dom-to-image cannot rasterize', () => {
    const html = buildStoryHtml(message);

    expect(html).not.toContain('background-clip');
    expect(html).not.toContain('-webkit-text-fill-color');
  });

  test('loads the design-system font stack', () => {
    const html = buildStoryHtml(message);

    expect(html).toContain('Space Grotesk');
    expect(html).toContain('Inter');
    expect(html).not.toContain('Plus Jakarta Sans');
    expect(html).not.toContain('DM Sans');
  });

  test('escapes message content without relying on the DOM', () => {
    const html = buildStoryHtml({
      content: '<img src=x onerror="alert(1)"> & "quoted"',
      createdAt: message.createdAt,
    });

    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
    expect(html).toContain('&amp;');
  });

  test('renders the story at Instagram story dimensions', () => {
    const html = buildStoryHtml(message);

    expect(html).toContain('1080px');
    expect(html).toContain('1920px');
  });

  test('renders the shared favicon brand mark next to the wordmark', () => {
    const html = buildStoryHtml(message);

    expect(html).toContain('brand-mark');
    expect(html).toContain('/brand-mark.png');
    expect(html).toContain('Anonymous Message');
  });

  test('accepts a pre-fetched data URI so rasterization does not depend on a network fetch', () => {
    const html = buildStoryHtml(message, 'data:image/png;base64,AAAA');

    expect(html).toContain('data:image/png;base64,AAAA');
    expect(html).not.toContain('src="/brand-mark.png"');
  });
});
