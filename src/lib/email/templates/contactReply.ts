import type { ContactReplyData } from '../types';
import {
  renderButton,
  renderButtonGroup,
  renderCard,
  renderHeader,
  renderMessageBlock,
  renderMeta,
} from './partials';
import { emailLayout } from './layout';

export function contactReplyTemplate(data: ContactReplyData): string {
  const content = `
    ${renderHeader(
      data.replySubject,
      `Hi ${data.name}, here is a follow-up from NaufalRF Portfolio regarding your recent message.`
    )}
    <div class="content">
      ${renderCard(renderMessageBlock('Reply', data.replyMessage))}
      ${renderCard(renderMessageBlock('Your original message', data.originalMessage))}
      ${renderButtonGroup([renderButton(data.dashboardLink, 'Visit portfolio', 'neutral')])}
      ${renderMeta('If you want to continue the conversation, you can reply directly to this email thread.')}
    </div>
  `;

  return emailLayout({
    preheader: data.replySubject,
    content,
  });
}
