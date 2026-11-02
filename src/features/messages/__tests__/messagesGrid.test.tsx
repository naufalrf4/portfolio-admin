import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoadingState } from '../components/LoadingState';
import { MessageCard } from '../components/MessageCard';
import { MessageList } from '../components/MessageList';
import type { AnonymousMessage } from '../types/messages.types';

const GRID_CLASSES = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

function makeMessage(overrides: Partial<AnonymousMessage> = {}): AnonymousMessage {
  return {
    id: 'msg_1',
    content: 'short message',
    read: false,
    createdAt: '2026-08-29T07:00:00.000Z',
    updatedAt: '2026-08-29T07:00:00.000Z',
    city: null,
    country: null,
    countryCode: null,
    region: null,
    ...overrides,
  } as AnonymousMessage;
}

const noop = () => {};

describe('messages grid layout', () => {
  test('MessageList renders a responsive 3-column grid', () => {
    const html = renderToStaticMarkup(
      <MessageList
        messages={[makeMessage()]}
        onSelect={noop}
        onToggleRead={noop}
        onDelete={noop}
      />
    );

    expect(html).toContain(GRID_CLASSES);
  });

  test('LoadingState uses the identical grid classes so skeletons match the loaded layout', () => {
    const listHtml = renderToStaticMarkup(
      <MessageList messages={[]} onSelect={noop} onToggleRead={noop} onDelete={noop} />
    );
    const loadingHtml = renderToStaticMarkup(<LoadingState />);

    const gridClassOf = (html: string) => html.match(/class="(grid[^"]*)"/)?.[1];

    expect(gridClassOf(loadingHtml)).toBe(gridClassOf(listHtml));
    expect(gridClassOf(loadingHtml)).toBe(GRID_CLASSES);
  });
});

describe('MessageCard in a narrow column', () => {
  test('stretches to full row height with a bottom-anchored footer', () => {
    const html = renderToStaticMarkup(
      <MessageCard message={makeMessage()} onSelect={noop} onToggleRead={noop} onDelete={noop} />
    );

    expect(html).toContain('h-full');
    expect(html).toContain('flex flex-col');
    expect(html).toContain('mt-auto');
  });

  test('uses a token-backed divider that stays visible in dark mode', () => {
    const html = renderToStaticMarkup(
      <MessageCard message={makeMessage()} onSelect={noop} onToggleRead={noop} onDelete={noop} />
    );

    expect(html).not.toContain('border-black/5');
    expect(html).toContain('border-[var(--border)]');
  });

  test('clamps long content to 3 lines and truncates well under the old 120 chars', () => {
    const long = 'x'.repeat(400);
    const html = renderToStaticMarkup(
      <MessageCard
        message={makeMessage({ content: long })}
        onSelect={noop}
        onToggleRead={noop}
        onDelete={noop}
      />
    );

    expect(html).toContain('line-clamp-3');

    const rendered = html.match(/x+/)?.[0] ?? '';
    expect(rendered.length).toBeLessThanOrEqual(90);
  });

  test('breaks unbroken content so a long token cannot overflow a narrow column', () => {
    const html = renderToStaticMarkup(
      <MessageCard
        message={makeMessage({ content: 'x'.repeat(200) })}
        onSelect={noop}
        onToggleRead={noop}
        onDelete={noop}
      />
    );

    expect(html).toContain('break-words');
  });

  test('keeps the unread indicator out of the absolute top-right corner', () => {
    const html = renderToStaticMarkup(
      <MessageCard
        message={makeMessage({ read: false })}
        onSelect={noop}
        onToggleRead={noop}
        onDelete={noop}
      />
    );

    expect(html).toContain('pulse-amber');
    expect(html).not.toContain('absolute top-6 right-6');
  });
});
