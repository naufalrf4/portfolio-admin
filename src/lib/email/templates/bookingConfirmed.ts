import type { BookingStatusUpdateData } from '../types';
import { formatDuration, formatReference } from './helper';
import {
  renderCard,
  renderDetailList,
  renderHeader,
  renderMessageBlock,
  renderMeta,
  renderStatusBadge,
} from './partials';
import { emailLayout } from './layout';

export function bookingConfirmedTemplate(data: BookingStatusUpdateData): string {
  const { bookingId, date, time, duration, message, calendarUrl, meetUrl } = data;

  const content = `
    ${renderHeader('Booking confirmed', 'Your session is confirmed. Here is the latest schedule update from NaufalRF Portfolio.')}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'Reference', value: formatReference(bookingId) },
          { label: 'Date', value: date },
          { label: 'Time', value: time },
          { label: 'Duration', value: formatDuration(duration) },
          ...(meetUrl
            ? [{ label: 'Google Meet', value: `<a href="${meetUrl}">${meetUrl}</a>` }]
            : []),
          ...(calendarUrl
            ? [{ label: 'Calendar event', value: `<a href="${calendarUrl}">${calendarUrl}</a>` }]
            : []),
          { label: 'Status', value: renderStatusBadge('Confirmed', 'success') },
        ])
      )}
      ${message ? renderMessageBlock('Note', message) : ''}
      ${renderMeta('If you need to make a change, reply to this email.')}
    </div>
  `;

  return emailLayout({
    preheader: 'Your booking has been confirmed.',
    content,
  });
}
