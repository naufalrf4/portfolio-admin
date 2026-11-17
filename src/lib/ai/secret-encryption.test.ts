import { afterEach, describe, expect, test } from 'bun:test';
import { decryptSecret, encryptSecret } from './secret-encryption';

const originalSecret = process.env.NEXTAUTH_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.NEXTAUTH_SECRET;
  else process.env.NEXTAUTH_SECRET = originalSecret;
});

describe('AI credential encryption', () => {
  test('encrypts and decrypts a credential without storing it as plaintext', () => {
    process.env.NEXTAUTH_SECRET = 'test-secret-that-is-long-enough';
    const apiKey = 'typesafe-secret-key';
    const encrypted = encryptSecret(apiKey);

    expect(encrypted).not.toContain(apiKey);
    expect(decryptSecret(encrypted)).toBe(apiKey);
  });

  test('rejects ciphertext that has been changed', () => {
    process.env.NEXTAUTH_SECRET = 'test-secret-that-is-long-enough';
    const encrypted = encryptSecret('typesafe-secret-key');
    const [version, iv, tag, ciphertext] = encrypted.split('.');
    const changedTag = `${tag?.startsWith('0') ? '1' : '0'}${tag?.slice(1)}`;

    expect(() => decryptSecret(`${version}.${iv}.${changedTag}.${ciphertext}`)).toThrow();
  });

  test('returns null when no credential is stored', () => {
    expect(decryptSecret(null)).toBeNull();
  });
});
