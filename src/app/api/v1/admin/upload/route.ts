import { NextRequest, NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { storageService, UploadFolder } from '@/lib/services/storage';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/api/utils/error-handler';

async function handlePost(request: NextRequest, _context: unknown, session: Session) {
  const requestId = crypto.randomUUID();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as UploadFolder | null;

    if (!file) {
      logger.warn('Upload request missing file', { requestId, userId: session.user.id });
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder || !['projects', 'about', 'achievements', 'resumes'].includes(folder)) {
      logger.warn('Invalid folder specified', { requestId, folder });
      return NextResponse.json({ error: 'Invalid folder specified' }, { status: 400 });
    }

    logger.info('Uploading file to storage', {
      requestId,
      folder,
      filename: file.name,
      size: file.size,
      userId: session.user.id,
    });

    const uploadResult = await storageService.uploadFile(file, folder);
    const previewUrl = await storageService.signGetUrl(uploadResult.key, 900);

    logger.info('File uploaded successfully', {
      requestId,
      key: uploadResult.key,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        key: uploadResult.key,
        url: previewUrl,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.upload.file',
      requestId,
      metadata: { fileSize: request.headers.get('content-length') || 'unknown' },
    });
  }
}

export const POST = withAdminAuthContext(handlePost);
