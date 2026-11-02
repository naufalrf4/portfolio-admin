'use client';

import { useState } from 'react';
import { Mail, MailOpen, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useContacts } from '../hooks/useContacts';
import { ContactTable } from './ContactTable';
import { ContactDetailModal } from './ContactDetailModal';
import { BulkActionModal } from './BulkActionModal';
import type { ContactForm, FilterMode, BulkAction } from '../types/contacts.types';

const FILTER_BUTTONS = [
  { mode: 'all' as FilterMode, label: 'All', icon: null },
  { mode: 'unread' as FilterMode, label: 'Unread', icon: Mail },
  { mode: 'read' as FilterMode, label: 'Read', icon: MailOpen },
];

export function ContactsTab() {
  const {
    contacts,
    loading,
    pagination,
    filterMode,
    setFilterMode,
    setPage,
    getContact,
    updateContact,
    deleteContact,
    toggleReadStatus,
    bulkAction,
  } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkAction | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactForm | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactForm | null>(null);

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.subject?.toLowerCase().includes(query) ||
      contact.message.toLowerCase().includes(query)
    );
  });

  function toggleSelectAll() {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function openBulkModal(action: BulkAction) {
    setBulkActionType(action);
    setIsBulkModalOpen(true);
  }

  async function handleBulkAction() {
    if (!bulkActionType || selectedIds.size === 0) return;

    setBulkActionLoading(true);
    try {
      const success = await bulkAction(Array.from(selectedIds), bulkActionType);
      if (success) {
        setIsBulkModalOpen(false);
        setSelectedIds(new Set());
      }
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function viewContact(id: string) {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);

    try {
      const contact = await getContact(id);
      if (contact) {
        setSelectedContact(contact);
      } else {
        setIsDetailModalOpen(false);
      }
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleToggleReadStatus(contact: ContactForm) {
    await toggleReadStatus(contact);
  }

  async function handleReply(contact: ContactForm, subject: string, message: string) {
    return updateContact(contact.id, {
      replied: true,
      replySubject: subject,
      replyMessage: message,
    } as Partial<ContactForm>);
  }

  function openDeleteDialog(contact: ContactForm) {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!contactToDelete) return;

    const success = await deleteContact(contactToDelete.id);
    if (success) {
      setIsDetailModalOpen(false);
      setContactToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTER_BUTTONS.map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setFilterMode(mode);
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    filterMode === mode
                      ? 'bg-[var(--teal)] text-on-accent shadow-surface-raised-sm'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-surface-raised-sm hover:shadow-surface-sunken'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openBulkModal('markRead')}>
                  <MailOpen className="h-4 w-4 mr-2" />
                  Mark Read
                </Button>
                <Button size="sm" variant="outline" onClick={() => openBulkModal('markUnread')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Mark Unread
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openBulkModal('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
            <Input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[var(--text-secondary)]">Loading contacts...</div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[var(--radius-container)] bg-[var(--bg-elevated)]"
            style={{
              boxShadow:
                '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'var(--bg-elevated)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Mail className="h-8 w-8 text-[var(--text-secondary)]" />
            </div>
            <p className="text-[var(--text-secondary)] text-lg font-medium mb-1">No submissions found</p>
            <p className="text-[var(--text-secondary)]/70 text-sm">
              {searchQuery || filterMode !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Contact form submissions will appear here'}
            </p>
          </div>
        ) : (
          <ContactTable
            contacts={filteredContacts}
            selectedIds={selectedIds}
            onSelectAll={toggleSelectAll}
            onSelectOne={toggleSelect}
            onView={viewContact}
            onToggleRead={handleToggleReadStatus}
            onDelete={openDeleteDialog}
          />
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              contacts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ContactDetailModal
        contact={selectedContact}
        open={isDetailModalOpen}
        loading={loadingDetail}
        onOpenChange={setIsDetailModalOpen}
        onToggleRead={handleToggleReadStatus}
        onDelete={openDeleteDialog}
        onReply={handleReply}
      />

      <BulkActionModal
        open={isBulkModalOpen}
        action={bulkActionType}
        count={selectedIds.size}
        isLoading={bulkActionLoading}
        onOpenChange={setIsBulkModalOpen}
        onConfirm={handleBulkAction}
      />

      <DeleteConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        contactName={contactToDelete?.name}
      />
    </>
  );
}
