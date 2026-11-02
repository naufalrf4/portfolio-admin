import type { AdminContactNotificationData } from '../types';
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

export function adminContactNotificationTemplate(data: AdminContactNotificationData): string {
  const { contact, dashboardLink, replyLink, receivedAt } = data;
  const location = [contact.city, contact.country].filter(Boolean).join(', ');

  const content = `
    ${renderHeader('New contact message', 'A new inquiry just arrived in the portfolio inbox.')}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'From', value: `${contact.name} (${contact.email})` },
          { label: 'Subject', value: contact.subject || 'General inquiry' },
          { label: 'Location', value: location || 'Unknown' },
          { label: 'Received', value: receivedAt },
          { label: 'Reference', value: formatReference(contact.id) },
        ])
      )}
      ${renderMessageBlock('Message', contact.message)}
      ${renderButtonGroup([
        renderButton(replyLink, 'Reply from dashboard'),
        renderButton(dashboardLink, 'Open contact record', 'neutral'),
      ])}
    </div>
  `;

  return emailLayout({
    preheader: `New contact message from ${contact.name}.`,
    content,
  });
}
