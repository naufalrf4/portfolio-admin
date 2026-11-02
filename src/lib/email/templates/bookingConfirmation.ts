import type { BookingConfirmationData } from '../types';
import { formatDuration, formatReference } from './helper';
import {
  renderCard,
  renderDetailList,
  renderHeader,
  renderMeta,
  renderStatusBadge,
} from './partials';
import { emailLayout } from './layout';

export function bookingConfirmationTemplate(data: BookingConfirmationData): string {
  const { bookingId, date, time, duration } = data;

  const content = `
    ${renderHeader('Booking request received', 'Your request is in. I will confirm the schedule shortly.')}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'Reference', value: formatReference(bookingId) },
          { label: 'Date', value: date },
          { label: 'Time', value: time },
          { label: 'Duration', value: formatDuration(duration) },
          { label: 'Status', value: renderStatusBadge('Pending', 'warning') },
        ])
      )}
      ${renderMeta('This slot is not final until you receive the confirmation email.')}
    </div>
  `;

  return emailLayout({
    preheader: 'Your booking request is waiting for confirmation.',
    content,
  });
}
