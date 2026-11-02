import type { ContactForm } from '@/features/contacts/types/contacts.types';
import { contactsService } from '@/lib/api/handlers/contacts.service';

function normalizeContact(
  contact: Awaited<ReturnType<typeof contactsService.getById>>
): ContactForm | null {
  if (!contact) {
    return null;
  }

  const metadata =
    contact.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
      ? (contact.metadata as ContactForm['metadata'])
      : null;

  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    message: contact.message,
    ipHash: contact.ipHash,
    metadata,
    read: contact.read,
    replied: contact.replied,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export async function getContactById(id: string): Promise<ContactForm | null> {
  try {
    return normalizeContact(await contactsService.getById(id));
  } catch {
    return null;
  }
}

export async function markContactAsRead(id: string): Promise<void> {
  try {
    await contactsService.markAsRead(id);
  } catch {
    return;
  }
}
