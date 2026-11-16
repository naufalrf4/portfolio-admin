import { describe, expect, test } from 'bun:test';
import { updateAboutSchema } from '../about.schema';

describe('updateAboutSchema', () => {
  test('accepts legacy experience items with a null logo URL', () => {
    const result = updateAboutSchema.safeParse({
      fullName: 'Naufal Rizqullah Firdaus',
      email: 'naufalrf32@gmail.com',
      roles: [],
      skills: [],
      experience: [
        {
          type: 'Organizational',
          title: 'Staff',
          organization: 'Example Club',
          startDate: '2024-01',
          endDate: null,
          logoUrl: null,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
