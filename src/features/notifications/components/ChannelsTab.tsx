import { useState } from 'react';
import { Plus, Send, Pencil, Trash2, Hash, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Channel, ChannelFormData, DiscoveredChat } from '../types/notifications.types';
import { useTelegramChats } from '../hooks/useTelegramChats';
import { cn } from '@/lib/utils';

interface ChannelsTabProps {
  channels: readonly Channel[];
  loading: boolean;
  testingId: string | null;
  onCreateChannel: (data: ChannelFormData) => Promise<boolean>;
  onUpdateChannel: (id: string, data: Partial<ChannelFormData>) => Promise<boolean>;
  onToggleChannel: (id: string, currentEnabled: boolean) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<boolean>;
  onSendTestMessage: (id: string) => Promise<void>;
}

export function ChannelsTab({
  channels,
  loading,
  testingId,
  onCreateChannel,
  onUpdateChannel,
  onToggleChannel,
  onDeleteChannel,
  onSendTestMessage,
}: ChannelsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deleteChannelItem, setDeleteChannelItem] = useState<Channel | null>(null);

  const [name, setName] = useState('');
  const [chatId, setChatId] = useState('');
  const [messageThreadId, setMessageThreadId] = useState<string>('');
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { chats, loading: chatsLoading, loaded: chatsLoaded, discoverChats, reset: resetChats } = useTelegramChats();

  const applyDiscoveredChat = (chat: DiscoveredChat) => {
    setChatId(chat.chatId);
    setMessageThreadId(chat.messageThreadId !== null ? String(chat.messageThreadId) : '');
    if (!name.trim()) {
      setName(chat.threadName ? `${chat.title} / ${chat.threadName}` : chat.title);
    }
  };

  const openCreate = () => {
    setEditingChannel(null);
    setName('');
    setChatId('');
    setMessageThreadId('');
    setEnabled(true);
    resetChats();
    setModalOpen(true);
  };

  const openEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setName(channel.name);
    setChatId(channel.chatId);
    setMessageThreadId(
      channel.messageThreadId !== null && channel.messageThreadId !== undefined
        ? String(channel.messageThreadId)
        : ''
    );
    setEnabled(channel.enabled);
    resetChats();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !chatId.trim()) return;
    setSubmitting(true);

    const parsedThreadId = messageThreadId.trim() ? Number(messageThreadId) : undefined;
    const payload: ChannelFormData = {
      name: name.trim(),
      chatId: chatId.trim(),
      enabled,
      ...(parsedThreadId !== undefined && !Number.isNaN(parsedThreadId) ? { messageThreadId: parsedThreadId } : {}),
    };

    const ok = editingChannel
      ? await onUpdateChannel(editingChannel.id, payload)
      : await onCreateChannel(payload);

    setSubmitting(false);
    if (ok) {
      setModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteChannelItem) return;
    setSubmitting(true);
    const ok = await onDeleteChannel(deleteChannelItem.id);
    setSubmitting(false);
    if (ok) {
      setDeleteChannelItem(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Telegram Channels</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure Telegram targets (groups, supergroups, topics) for notification dispatch
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-[var(--teal)] text-on-accent hover:brightness-110">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Channel
        </Button>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] surface-raised overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel Name</TableHead>
              <TableHead>Chat ID</TableHead>
              <TableHead>Thread / Topic</TableHead>
              <TableHead className="w-24">Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                  Loading channels...
                </TableCell>
              </TableRow>
            ) : channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                  No notification channels configured yet. Click &quot;Add Channel&quot; to configure one.
                </TableCell>
              </TableRow>
            ) : (
              channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium text-[var(--text-primary)]">
                    {channel.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                    {channel.chatId}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)]">
                    {channel.messageThreadId !== null && channel.messageThreadId !== undefined ? (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Hash className="h-3 w-3 text-[var(--teal)]" />
                        {channel.messageThreadId}
                      </span>
                    ) : (
                      <span className="italic text-[var(--text-tertiary)]">group root</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => onToggleChannel(channel.id, channel.enabled)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendTestMessage(channel.id)}
                        disabled={testingId === channel.id || !channel.enabled}
                        className="h-8 px-2.5 text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {testingId === channel.id ? 'Sending...' : 'Send Test'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(channel)}
                        className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit Channel</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteChannelItem(channel)}
                        className="h-8 w-8 text-[var(--text-secondary)] hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete Channel</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? 'Edit Channel' : 'Create Channel'}
            </DialogTitle>
            <DialogDescription>
              Configure Telegram chat credentials. Supergroup IDs typically begin with a negative sign (e.g. -100...).
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ops Alerts or Client Submissions"
              />
            </div>
            <div className="space-y-2 rounded-xl border border-line-strong bg-[var(--bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Find my chats</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Add the bot to your group, send any message there, then scan to pick the chat
                    instead of typing its ID.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discoverChats}
                  disabled={chatsLoading}
                  className="h-8 shrink-0 px-2.5 text-xs"
                >
                  <RefreshCw className={cn('h-3 w-3 mr-1', chatsLoading && 'animate-spin')} />
                  {chatsLoading ? 'Scanning...' : 'Scan'}
                </Button>
              </div>

              {chatsLoaded && chats.length === 0 && (
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Nothing found. Telegram only reveals a chat after the bot sees activity in it.
                </p>
              )}

              {chats.length > 0 && (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {chats.map((chat) => {
                    const selected =
                      chat.chatId === chatId &&
                      (chat.messageThreadId !== null
                        ? String(chat.messageThreadId) === messageThreadId
                        : messageThreadId === '');
                    return (
                      <Button
                        key={`${chat.chatId}:${chat.messageThreadId ?? 'root'}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => applyDiscoveredChat(chat)}
                        className={cn(
                          'h-auto w-full justify-start gap-2 px-2 py-1.5 text-left',
                          selected && 'bg-[var(--teal)]/10'
                        )}
                      >
                        {selected ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[var(--teal)]" />
                        ) : (
                          <Hash className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                        )}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-xs text-[var(--text-primary)]">
                            {chat.title}
                            {chat.threadName ? ` / ${chat.threadName}` : ''}
                          </span>
                          <span className="truncate font-mono text-[10px] text-[var(--text-secondary)]">
                            {chat.chatId}
                            {chat.messageThreadId !== null ? ` · topic ${chat.messageThreadId}` : ''}
                            {` · ${chat.type}`}
                          </span>
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="channel-chatid">Telegram Chat ID</Label>
              <Input
                id="channel-chatid"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. -1001234567890 or 123456789"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                Filled in automatically when you pick a chat above. Supergroup IDs keep their leading
                minus sign.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="channel-threadid">Message Thread / Topic ID (Optional)</Label>
              <Input
                id="channel-threadid"
                type="number"
                value={messageThreadId}
                onChange={(e) => setMessageThreadId(e.target.value)}
                placeholder="Leave blank for group root"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3 surface-raised-sm">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Enable Channel</p>
                <p className="text-xs text-[var(--text-secondary)]">Allow rules to dispatch notifications here</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={submitting || !name.trim() || !chatId.trim()}
              className="bg-[var(--teal)] text-on-accent hover:brightness-110"
            >
              {submitting ? 'Saving...' : editingChannel ? 'Update Channel' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteChannelItem} onOpenChange={(open) => !open && setDeleteChannelItem(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete channel &quot;{deleteChannelItem?.name}&quot;? If any rules reference this channel, the deletion will be rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteChannelItem(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
