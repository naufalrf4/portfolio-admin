import { createHash, createHmac } from 'crypto';

const IP_HASH_SECRET = process.env.IP_HASH_SECRET?.trim();

export function hashIp(ip: string): string {
  const digest = IP_HASH_SECRET
    ? createHmac('sha256', IP_HASH_SECRET).update(ip).digest('hex')
    : createHash('sha256').update(ip).digest('hex');

  return digest.substring(0, 32);
}
