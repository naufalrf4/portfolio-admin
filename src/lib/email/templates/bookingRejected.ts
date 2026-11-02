import type { BookingStatusUpdateData } from '../types';
import { formatReference } from './helper';
import {
  renderCard,
  renderDetailList,
  renderHeader,
  renderMessageBlock,
  renderMeta,
  renderStatusBadge,
} from './partials';
import { emailLayout } from './layout';

export function bookingRejectedTemplate(data: BookingStatusUpdateData): string {
  const { bookingId, date, time, message } = data;

  const content = `
    ${renderHeader('Booking update', 'That specific slot is no longer available, so this request could not be confirmed.')}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'Reference', value: formatReference(bookingId) },
          { label: 'Requested date', value: date },
          { label: 'Requested time', value: time },
          { label: 'Status', value: renderStatusBadge('Unavailable', 'danger') },
        ])
      )}
      ${message ? renderMessageBlock('Note', message) : ''}
      ${renderMeta('You can send another request for a different slot anytime.')}
    </div>
  `;

  return emailLayout({
    preheader: 'Your requested booking slot is unavailable.',
    content,
  });
}
