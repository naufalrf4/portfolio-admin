import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const FORMAT_VERSION = 'v1';

function getEncryptionKey() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required to encrypt AI provider credentials.');
  }

  return createHash('sha256').update(`portfolio-admin:ai-secret:${secret}`).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptSecret(value: string | null | undefined): string | null {
  if (!value) return null;

  const [version, ivPart, tagPart, ciphertextPart] = value.split('.');
  if (version !== FORMAT_VERSION || !ivPart || !tagPart || !ciphertextPart) {
    throw new Error('Encrypted AI credential has an unsupported format.');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivPart, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, 'base64url')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}
