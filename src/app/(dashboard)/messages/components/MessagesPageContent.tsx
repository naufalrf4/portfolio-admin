'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  useMessages,
  useMessageDelete,
  MessagesContent,
  MessageDetailModal,
  DeleteConfirmModal,
  FilterTabs,
  MarkAllAsReadButton,
  GlobalStyles,
  type AnonymousMessage,
} from '@/features/messages';

export function MessagesPageContent() {
  return <MessagesPanel showHeader />;
}

interface MessagesPanelProps {
  showHeader?: boolean;
}

export function MessagesPanel({ showHeader = false }: MessagesPanelProps) {
  const {
    messages,
    loading,
    unreadCount,
    activeTab,
    setActiveTab,
    toggleReadStatus,
    markAllAsRead,
    markingAllRead,
    deleteMessage,
  } = useMessages();

  const [selectedMessage, setSelectedMessage] = useState<AnonymousMessage | null>(null);

  const { deleteModalOpen, isDeleting, openDeleteModal, closeDeleteModal, confirmDelete } =
    useMessageDelete({
      deleteMessage,
      selectedMessage,
      setSelectedMessage,
    });

  return (
    <>
      <GlobalStyles />
      <PageWrapper className={showHeader ? undefined : 'px-0 pb-0'}>
        {showHeader ? (
          <PageHeader
            title="Anonymous Messages"
            description="Manage anonymous messages from your visitors"
            icon={<Mail />}
            stats={[
              { label: 'Total', value: messages.length },
              { label: 'Unread', value: unreadCount, variant: 'warning' },
            ]}
            actions={
              unreadCount > 0 ? (
                <MarkAllAsReadButton onClick={markAllAsRead} disabled={markingAllRead} />
              ) : null
            }
          />
        ) : null}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalCount={messages.length}
          unreadCount={unreadCount}
        />

        <MessagesContent
          loading={loading}
          messages={messages}
          activeTab={activeTab}
          onSelect={setSelectedMessage}
          onToggleRead={toggleReadStatus}
          onDelete={openDeleteModal}
        />

        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onToggleRead={toggleReadStatus}
          onDelete={openDeleteModal}
        />

        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      </PageWrapper>
    </>
  );
}
