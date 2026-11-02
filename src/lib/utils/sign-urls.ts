import { normalizeStoredAssetValue, storageService } from '@/lib/services/storage';

type SignableRecord = object;

interface SignConfig {
  fields?: string[];
  nested?: Record<string, string[]>;
}

const PUBLIC_ASSET_BASE_URL = 'https://assets.naufalrf.net';
const PUBLIC_IMAGE_FOLDERS = new Set(['about', 'projects', 'achievements']);

export function toPublicImageUrl(value: string): string {
  const storageKey = getStorageKey(value);
  if (!storageKey) return value;

  const [folder, ...segments] = storageKey.split('/');
  if (!folder || !PUBLIC_IMAGE_FOLDERS.has(folder) || segments.length === 0) return value;
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return value;

  return `${PUBLIC_ASSET_BASE_URL}/${storageKey.split('/').map(encodeURIComponent).join('/')}`;
}

export function mapPublicImageUrls<T extends SignableRecord>(
  record: T,
  config: SignConfig
): T {
  if (!record) return record;

  const mappedRecord = { ...record } as Record<string, unknown>;
  for (const field of config.fields ?? []) {
    if (typeof mappedRecord[field] === 'string') {
      mappedRecord[field] = toPublicImageUrl(mappedRecord[field] as string);
    }
  }

  for (const [arrayField, fields] of Object.entries(config.nested ?? {})) {
    const items = mappedRecord[arrayField];
    if (!Array.isArray(items)) continue;
    mappedRecord[arrayField] = items.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const mappedItem = { ...(item as Record<string, unknown>) };
      for (const field of fields) {
        if (typeof mappedItem[field] === 'string') {
          mappedItem[field] = toPublicImageUrl(mappedItem[field] as string);
        }
      }
      return mappedItem;
    });
  }

  return mappedRecord as T;
}

function getStorageKey(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = normalizeStoredAssetValue(value);
  if (
    !normalizedValue ||
    /^https?:\/\//.test(normalizedValue) ||
    /^\/api\//.test(normalizedValue)
  ) {
    return null;
  }

  return normalizedValue.includes('/') ? normalizedValue : null;
}

export async function signAssetUrls<T extends SignableRecord>(
  record: T,
  config: SignConfig,
  expiresInSeconds = 3600
): Promise<T> {
  if (!record) {
    return record;
  }

  const signedRecord = { ...record } as Record<string, unknown>;

  if (config.fields) {
    const promises = config.fields.map(async (field) => {
      const storageKey = getStorageKey(signedRecord[field]);
      if (storageKey) {
        signedRecord[field] = await storageService.signGetUrl(storageKey, expiresInSeconds);
      }
    });
    await Promise.all(promises);
  }

  if (config.nested) {
    const nestedPromises = Object.entries(config.nested).map(async ([arrayField, fields]) => {
      const arrayValue = signedRecord[arrayField];
      if (!Array.isArray(arrayValue)) {
        return;
      }

      signedRecord[arrayField] = await Promise.all(
        arrayValue.map(async (item) => {
          if (!item || typeof item !== 'object') {
            return item;
          }

          const signedItem = { ...(item as Record<string, unknown>) };
          await Promise.all(
            fields.map(async (field) => {
              const storageKey = getStorageKey(signedItem[field]);
              if (storageKey) {
                signedItem[field] = await storageService.signGetUrl(storageKey, expiresInSeconds);
              }
            })
          );
          return signedItem;
        })
      );
    });
    await Promise.all(nestedPromises);
  }

  return signedRecord as T;
}

export async function signAssetUrlsMany<T extends SignableRecord>(
  records: T[],
  config: SignConfig,
  expiresInSeconds = 3600
): Promise<T[]> {
  if (!records || !Array.isArray(records)) {
    return records;
  }

  return Promise.all(records.map((record) => signAssetUrls(record, config, expiresInSeconds)));
}

export async function signStringArray(keys: string[], expiresInSeconds = 3600): Promise<string[]> {
  if (!keys || !Array.isArray(keys)) {
    return keys;
  }

  return Promise.all(
    keys.map(async (key) => {
      const storageKey = getStorageKey(key);
      if (storageKey) {
        return storageService.signGetUrl(storageKey, expiresInSeconds);
      }
      return key;
    })
  );
}
