import { db } from '@/lib/db';
import { eq, desc, lt, count, sql } from 'drizzle-orm';
import { chatLogs } from '@/lib/db/schema';
import { createId } from '@paralleldrive/cuid2';
import type { CreateChatLogInput, ChatLogQueryInput } from '@/lib/validations/chat-log.schema';
import { subtractDaysFromNow } from '@/lib/utils/date';

type ChatLogMessage = CreateChatLogInput['messages'][number];
type ChatLogRow = {
  id: string;
  messages: ChatLogMessage[];
  createdAt: string;
};

export class ChatLogsService {
  async getAll(query: ChatLogQueryInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [logs, [{ total }]] = await Promise.all([
      db.select().from(chatLogs).limit(limit).offset(skip).orderBy(desc(chatLogs.updatedAt)),
      db.select({ total: count() }).from(chatLogs),
    ]);

    const logsWithStats = logs.map((log) => {
      const messages = log.messages as Array<{ role: string; timestamp: string }>;
      return {
        ...log,
        messageCount: messages.length,
        lastMessageAt: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
      };
    });

    return {
      logs: logsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const [log] = await db.select().from(chatLogs).where(eq(chatLogs.id, id)).limit(1);
    return log || null;
  }

  async getBySessionId(sessionId: string) {
    const [log] = await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.sessionId, sessionId))
      .limit(1);
    return log || null;
  }

  async upsert(data: CreateChatLogInput) {
    if (data.mode === 'append') {
      return this.appendMessages(data.sessionId, data.messages);
    }

    const now = new Date().toISOString();
    const [result] = await db
      .insert(chatLogs)
      .values({
        id: createId(),
        sessionId: data.sessionId,
        messages: data.messages,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: chatLogs.sessionId,
        set: {
          messages: data.messages,
          updatedAt: now,
        },
      })
      .returning();
    return result;
  }

  private async appendMessages(sessionId: string, messages: ChatLogMessage[]) {
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const existingRows = await tx.execute<ChatLogRow>(sql`
        SELECT "id", "messages", "createdAt"
        FROM "chat_logs"
        WHERE "sessionId" = ${sessionId}
        FOR UPDATE
      `);
      const existing = existingRows[0] ?? null;

      if (!existing) {
        const [created] = await tx
          .insert(chatLogs)
          .values({
            id: createId(),
            sessionId,
            messages,
            createdAt: now,
            updatedAt: now,
          })
          .returning();
        return created;
      }

      const mergedMessages = this.mergeMessages(existing.messages, messages);
      const [updated] = await tx
        .update(chatLogs)
        .set({
          messages: mergedMessages,
          updatedAt: now,
        })
        .where(eq(chatLogs.id, existing.id))
        .returning();
      return updated;
    });
  }

  private mergeMessages(existing: unknown, incoming: ChatLogMessage[]) {
    const existingMessages = this.normalizeMessages(existing);
    const seenIds = new Set(existingMessages.map((message) => message.id));
    const merged = [...existingMessages];

    for (const message of incoming) {
      if (seenIds.has(message.id)) {
        continue;
      }
      merged.push(message);
      seenIds.add(message.id);
    }

    return merged;
  }

  private normalizeMessages(value: unknown): ChatLogMessage[] {
    if (Array.isArray(value)) {
      return value as ChatLogMessage[];
    }

    if (typeof value !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as ChatLogMessage[]) : [];
    } catch {
      return [];
    }
  }

  async delete(id: string) {
    const [deleted] = await db.delete(chatLogs).where(eq(chatLogs.id, id)).returning();
    return deleted;
  }

  async deleteExpired(daysOld: number = 7) {
    const cutoffDate = subtractDaysFromNow(daysOld);

    const result = await db
      .delete(chatLogs)
      .where(lt(chatLogs.updatedAt, cutoffDate.toISOString()))
      .returning();

    return result.length;
  }
}

export const chatLogsService = new ChatLogsService();
