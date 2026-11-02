import type { ContactConfirmationData } from '../types';
import { formatReference } from './helper';
import { renderCard, renderDetailList, renderHeader, renderMeta } from './partials';
import { emailLayout } from './layout';

export function contactConfirmationTemplate(data: ContactConfirmationData): string {
  const content = `
    ${renderHeader(
      'Message received',
      `Thanks for reaching out, ${data.name}. Your message is in the queue and you will get a reply soon.`
    )}
    <div class="content">
      ${renderCard(
        renderDetailList([
          { label: 'Reference', value: formatReference(data.messageId) },
          { label: 'Received', value: data.receivedAt },
          { label: 'Subject', value: data.subject || 'General inquiry' },
        ])
      )}
      ${renderMeta('Most replies land within 1-2 business days. If your request changes, simply reply with more context.')}
    </div>
  `;

  return emailLayout({
    preheader: 'Your message has been received.',
    content,
  });
}
