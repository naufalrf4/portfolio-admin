import type { AdminBookingNotificationData } from '../types';
import { formatReference } from './helper';
import {
  renderButton,
  renderButtonGroup,
  renderCard,
  renderDetailList,
  renderHeader,
  renderMessageBlock,
} from './partials';
import { emailLayout } from './layout';

export function adminBookingNotificationTemplate(data: AdminBookingNotificationData): string {
  const { booking, dashboardLink, acceptLink, rejectLink } = data;

  const content = `
    ${renderHeader('New booking request', 'A client submitted a booking request that needs your review.')}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'Client', value: booking.name },
          { label: 'Email', value: booking.email },
          { label: 'Phone', value: booking.phone || 'Not provided' },
          { label: 'Date', value: booking.date },
          { label: 'Time', value: booking.time },
          { label: 'Reference', value: formatReference(booking.id) },
        ])
      )}
      ${booking.notes ? renderMessageBlock('Client note', booking.notes) : ''}
      ${renderButtonGroup([
        renderButton(acceptLink, 'Open confirm flow'),
        renderButton(rejectLink, 'Open decline flow', 'danger'),
        renderButton(dashboardLink, 'Open booking board', 'neutral'),
      ])}
    </div>
  `;

  return emailLayout({
    preheader: `New booking request from ${booking.name}.`,
    content,
  });
}
