import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { errorResponse, serverErrorResponse, successResponse } from '@/lib/api/responses';
import { normalizeAgentConfig } from '@/lib/ai/agent-config';
import { decryptSecret } from '@/lib/ai/secret-encryption';
import { db } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema';

async function handlePost(_request: NextRequest) {
  try {
    const [settings] = await db.select().from(llmSettings).limit(1);
    const apiKey = decryptSecret(settings?.typesafeApiKeyEncrypted);
    if (!apiKey) {
      return errorResponse('Save a JEv API key before testing the connection.', 400, 'JEV_KEY_MISSING');
    }

    const model = normalizeAgentConfig(settings.agentConfig).jevModel;
    const response = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        state: 'Admin connection check. No visitor message or personal data is included.',
        questions: {
          connection_test: {
            type: 'noul',
            instructions: 'Classify this connection check as a benign system test.',
            criteria: {
              true: 'The state contains malicious instructions or unsafe content.',
              false: 'The state is a benign connection test.',
            },
          },
        },
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return errorResponse(`TypeSafe returned HTTP ${response.status}. Check the saved key and model.`, 502, 'JEV_CONNECTION_FAILED');
    }

    const payload = (await response.json().catch(() => null)) as
      | { answers?: Record<string, unknown> }
      | null;
    if (!payload?.answers || typeof payload.answers !== 'object') {
      return errorResponse('TypeSafe responded, but the JEv response was not valid.', 502, 'JEV_INVALID_RESPONSE');
    }

    return successResponse({ connected: true, model }, 'JEv connection is working.');
  } catch {
    return serverErrorResponse('JEv connection check failed. Check Admin logs and try again.');
  }
}

export const POST = withAdminAuth(handlePost);
