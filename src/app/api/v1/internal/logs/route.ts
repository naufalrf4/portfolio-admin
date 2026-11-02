import { effectiveLevelFor } from '@naufalrf/contracts';
import { NextRequest, NextResponse } from 'next/server';
import { logSettingsService } from '@/lib/api/handlers/log-settings.service';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { logIngestService } from '@/lib/services/logIngest.service';
import {
  logEntrySchema,
  logIngestEnvelopeSchema,
} from '@/lib/validations/logIngest.schema';
import { logServiceSchema } from '@/lib/validations/log-settings.schema';

async function handleGet(req: NextRequest) {
  try {
    const settings = await logSettingsService.getCaptureSettings();
    const service = req.nextUrl.searchParams.get('service');

    if (service !== null) {
      const validation = logServiceSchema.safeParse(service);
      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      return successResponse({
        level: effectiveLevelFor(validation.data, settings),
        enabled: settings.enabled,
      });
    }

    return successResponse({
      minLevel: settings.minLevel,
      enabled: settings.enabled,
      serviceOverrides: settings.serviceOverrides,
    });
  } catch {
    return serverErrorResponse('Failed to fetch log capture settings');
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const validation = logIngestEnvelopeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const entries = validation.data.entries.flatMap((candidate) => {
      const entryValidation = logEntrySchema.safeParse(candidate);
      return entryValidation.success ? [entryValidation.data] : [];
    });
    const result = await logIngestService.ingest(entries);

    return NextResponse.json(
      { success: true, data: result },
      { status: 202 }
    );
  } catch {
    return serverErrorResponse('Failed to ingest logs');
  }
}

export const GET = withServiceAuth(handleGet);
export const POST = withServiceAuth(handlePost);
