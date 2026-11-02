import { z } from 'zod';

const cursorPositionSchema = z.object({
  timestamp: z.iso.datetime({ offset: true }),
  id: z.string().min(1),
});

export type CursorPosition = Readonly<z.infer<typeof cursorPositionSchema>>;

export function encodeCursor(position: CursorPosition): string {
  return Buffer.from(JSON.stringify(position)).toString('base64url');
}

export function decodeCursor(encoded: string): CursorPosition {
  const json = Buffer.from(encoded, 'base64url').toString('utf8');
  return cursorPositionSchema.parse(JSON.parse(json));
}

export function getCursorPredicate(
  cursor: CursorPosition,
): (row: CursorPosition) => boolean {
  return (row) =>
    row.timestamp > cursor.timestamp ||
    (row.timestamp === cursor.timestamp && row.id > cursor.id);
}
