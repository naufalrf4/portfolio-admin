import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type AssetValue = string | null | undefined;

type R2EnvironmentKey =
  | 'ADMIN_R2_ACCOUNT_ID'
  | 'ADMIN_R2_BUCKET_NAME'
  | 'ADMIN_R2_ACCESS_KEY_ID'
  | 'ADMIN_R2_SECRET_ACCESS_KEY';

function getRequiredEnv(name: R2EnvironmentKey): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

let cachedStorageClient: S3Client | null = null;

function getStorageClient(): S3Client {
  if (cachedStorageClient) {
    return cachedStorageClient;
  }

  const accountId = getRequiredEnv('ADMIN_R2_ACCOUNT_ID');
  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error('ADMIN_R2_ACCOUNT_ID must be a 32-character Cloudflare account ID.');
  }

  cachedStorageClient = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv('ADMIN_R2_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('ADMIN_R2_SECRET_ACCESS_KEY'),
    },
  });

  return cachedStorageClient;
}

function getBucketName(): string {
  return getRequiredEnv('ADMIN_R2_BUCKET_NAME');
}

const LEGACY_GCS_BUCKET_NAME = 'media.naufalrf.net';
const LEGACY_GCS_PUBLIC_BASE_URL = 'https://media.naufalrf.net';

function normalizeStorageKeyCandidate(value: string): string | null {
  const [pathPart, queryPart] = value.split('?', 2);
  const normalizedPath = pathPart?.trim();

  if (!normalizedPath) {
    return null;
  }

  if (!queryPart) {
    return normalizedPath;
  }

  const loweredQuery = queryPart.toLowerCase();
  const looksLikeSignedQuery = [
    'x-goog-',
    'x-amz-',
    'googleaccessid=',
    'signature=',
    'expires=',
  ].some((token) => loweredQuery.includes(token));

  return looksLikeSignedQuery ? normalizedPath : value.trim();
}

function isLikelySignedStorageUrl(url: URL): boolean {
  return [
    'X-Goog-Algorithm',
    'X-Goog-Credential',
    'X-Goog-Signature',
    'GoogleAccessId',
    'X-Amz-Algorithm',
    'X-Amz-Credential',
    'X-Amz-Signature',
    'X-Amz-Expires',
    'Expires',
    'Signature',
  ].some((key) => url.searchParams.has(key));
}

function extractStorageKeyFromUrl(value: string): string | null {
  try {
    const parsedUrl = new URL(value);
    if (value.startsWith(`${LEGACY_GCS_PUBLIC_BASE_URL}/`)) {
      return decodeURIComponent(value.slice(LEGACY_GCS_PUBLIC_BASE_URL.length + 1)) || null;
    }

    const rawPath = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));

    if (
      parsedUrl.hostname === 'storage.googleapis.com' &&
      rawPath.startsWith(`${LEGACY_GCS_BUCKET_NAME}/`)
    ) {
      return rawPath.slice(LEGACY_GCS_BUCKET_NAME.length + 1) || null;
    }

    if (parsedUrl.hostname === `${LEGACY_GCS_BUCKET_NAME}.storage.googleapis.com`) {
      return rawPath || null;
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeStoredAssetValue(value: AssetValue): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmedValue)) {
    return normalizeStorageKeyCandidate(trimmedValue);
  }

  const extractedKey = extractStorageKeyFromUrl(trimmedValue);
  if (extractedKey) {
    return extractedKey;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (isLikelySignedStorageUrl(parsedUrl)) {
      return null;
    }
  } catch {
    return null;
  }

  return trimmedValue;
}

export type UploadFolder = 'projects' | 'about' | 'achievements' | 'resumes';

export interface UploadResult {
  key: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/rtf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class StorageService {
  async uploadFile(file: File, folder: UploadFolder): Promise<UploadResult> {
    this.validateFile(file, folder);

    const key = this.generateKey(file.name, folder);
    const buffer = Buffer.from(await file.arrayBuffer());

    await getStorageClient().send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: this.getCacheControl(folder),
      })
    );

    return { key };
  }

  async signGetUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      getStorageClient(),
      new GetObjectCommand({ Bucket: getBucketName(), Key: key }),
      { expiresIn: expiresInSeconds }
    );
  }

  async deleteFile(key: string): Promise<void> {
    await getStorageClient().send(
      new DeleteObjectCommand({ Bucket: getBucketName(), Key: key })
    );
  }

  async getPresignedUploadUrl(
    filename: string,
    folder: UploadFolder
  ): Promise<{ url: string; key: string }> {
    const key = this.generateKey(filename, folder);
    const url = await getSignedUrl(
      getStorageClient(),
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        ContentType: 'application/octet-stream',
      }),
      { expiresIn: 3600 }
    );

    return { url, key };
  }

  private validateFile(file: File, folder: UploadFolder): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const allowedTypes = folder === 'resumes' ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  private generateKey(filename: string, folder: UploadFolder): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-180);
    return `${folder}/${timestamp}-${sanitizedFilename}`;
  }

  private getCacheControl(folder: UploadFolder): string {
    return folder === 'resumes'
      ? 'public, max-age=3600, s-maxage=3600'
      : 'public, max-age=31536000, immutable';
  }
}

export const storageService = new StorageService();
