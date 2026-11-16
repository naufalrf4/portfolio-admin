import { describe, expect, test } from 'bun:test';
import { updateProjectSchema } from '../project.schema';

describe('updateProjectSchema', () => {
  test('does not apply create defaults to a partial update', () => {
    const result = updateProjectSchema.safeParse({ order: 3 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ order: 3 });
    }
  });
});
