import { describe, expect, test } from 'bun:test';
import { emailLayout } from '../templates/layout';
import {
  renderButton,
  renderHeader,
  renderMessageBlock,
  renderStatusBadge,
} from '../templates/partials';

const RETIRED_BLUES = [
  '#eef3fb',
  '#16355d',
  '#f8fbff',
  '#d7e3f4',
  '#2563eb',
  '#38bdf8',
  '#102a4c',
  '#47688f',
  '#dfe9f6',
  '#1d4ed8',
  '#5b7da6',
  '#6a87ac',
  '#ebf1f8',
  '#f4f8fd',
  '#1b3658',
  '#edf4fd',
  '#e8eef9',
  '#c2410c',
];

const LIGHT_TOKENS = {
  bg: '#faf8f4',
  bgElevated: '#f2eee6',
  bgCard: '#ffffff',
  border: '#d4cdbf',
  textPrimary: '#211c15',
  textSecondary: '#6b6558',
  teal: '#0f8577',
  amber: '#a8661b',
  onAccent: '#ffffff',
};

function layout() {
  return emailLayout({ preheader: 'a preheader', content: '<div>body</div>' });
}

describe('emailLayout palette migration', () => {
  test('drops every retired blue literal', () => {
    const html = layout();

    for (const blue of RETIRED_BLUES) {
      expect(html).not.toContain(blue);
    }
  });

  test('adopts the light design-system tokens as concrete hex literals', () => {
    const html = layout();

    expect(html).toContain(LIGHT_TOKENS.bg);
    expect(html).toContain(LIGHT_TOKENS.bgCard);
    expect(html).toContain(LIGHT_TOKENS.border);
    expect(html).toContain(LIGHT_TOKENS.textPrimary);
    expect(html).toContain(LIGHT_TOKENS.teal);
  });

  test('never emits a var() reference because email clients cannot resolve custom properties', () => {
    expect(layout()).not.toContain('var(--');
  });

  test('replaces the neumorphic shadow stack with flat 1px borders', () => {
    const html = layout();

    expect(html).not.toContain('18px 18px 36px');
    expect(html).not.toContain('-18px -18px 36px');
    expect(html).not.toContain('inset 1px 1px 0');
    expect(html).toContain(`1px solid ${LIGHT_TOKENS.border}`);
  });

  test('uses design-system radii instead of oversized 28/22px corners', () => {
    const html = layout();

    expect(html).not.toContain('border-radius: 28px');
    expect(html).not.toContain('border-radius: 22px');
    expect(html).toContain('border-radius: 16px');
    expect(html).toContain('border-radius: 12px');
  });

  test('runs the accent rule as a teal to amber gradient', () => {
    const html = layout();

    expect(html).toContain(`linear-gradient(90deg, ${LIGHT_TOKENS.teal} 0%, ${LIGHT_TOKENS.amber} 100%)`);
  });

  test('drops the Segoe UI stack for a neutral cross-platform one', () => {
    const html = layout();

    expect(html).not.toContain("'Segoe UI', Arial, sans-serif");
    expect(html).toContain('Helvetica');
  });
});

describe('emailLayout branding', () => {
  test('renders an absolute logo image that email clients can fetch', () => {
    const src = layout().match(/<img[^>]*src="([^"]+)"/)?.[1];

    expect(src).toBeDefined();
    expect(src?.startsWith('https://')).toBe(true);
    expect(src).toContain('/logo-email.png');
  });

  test('gives the logo alt text and explicit dimensions so blocked images degrade cleanly', () => {
    const img = layout().match(/<img[^>]*>/)?.[0] ?? '';

    expect(img).toContain('alt="');
    expect(img).not.toContain('alt=""');
    expect(img).toContain('width="');
    expect(img).toContain('height="');
  });

  test('does not repeat the wordmark in the masthead', () => {
    const masthead = layout().match(/<div class="masthead">[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(masthead).toContain('<img');
    expect(masthead).not.toContain('NaufalRF Portfolio');
  });

  test('keeps a single visible wordmark in the footer for attribution', () => {
    const body = layout().split('<body>')[1] ?? '';

    expect(body.match(/NaufalRF Portfolio/g)?.length).toBe(1);
  });

  test('still escapes the preheader', () => {
    const html = emailLayout({ preheader: '<script>x</script>', content: '' });

    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('partials tone migration', () => {
  test('primary button uses teal with the inverting on-accent foreground', () => {
    const html = renderButton('https://example.com', 'Open');

    expect(html).toContain(`background:${LIGHT_TOKENS.teal}`);
    expect(html).toContain(`color:${LIGHT_TOKENS.onAccent}`);
    expect(html).not.toContain('#1d4ed8');
  });

  test('every button tone avoids the retired blue palette', () => {
    for (const tone of ['primary', 'neutral', 'danger'] as const) {
      const html = renderButton('https://example.com', 'Open', tone);
      for (const blue of RETIRED_BLUES) {
        expect(html).not.toContain(blue);
      }
    }
  });

  test('every status tone avoids the retired blue palette', () => {
    for (const tone of ['info', 'success', 'danger', 'warning'] as const) {
      const html = renderStatusBadge('label', tone);
      for (const blue of RETIRED_BLUES) {
        expect(html).not.toContain(blue);
      }
    }
  });

  test('info status badge is teal-tinted', () => {
    expect(renderStatusBadge('new', 'info')).toContain(LIGHT_TOKENS.teal);
  });

  test('warning status badge is amber-tinted', () => {
    expect(renderStatusBadge('pending', 'warning')).toContain(LIGHT_TOKENS.amber);
  });

  test('preserves existing escaping behaviour', () => {
    expect(renderButton('https://x.com/?a=1&b=2', '<b>go</b>')).toContain('&amp;b=2');
    expect(renderButton('https://x.com', '<b>go</b>')).toContain('&lt;b&gt;go&lt;/b&gt;');
    expect(renderHeader('<h>', '<i>')).toContain('&lt;h&gt;');
    expect(renderMessageBlock('label', 'line1\nline2')).toContain('<br />');
  });
});
