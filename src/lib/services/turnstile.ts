import { timingSafeEqual } from 'node:crypto';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  timestamp?: string;
  hostname?: string;
  action?: string;
}

interface TurnstileValidationResult {
  success: boolean;
  status?: number;
  code?: string;
  message?: string;
}

interface TurnstileValidationInput {
  token?: string;
  expectedAction: string;
  remoteIp?: string;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_MAX_TOKEN_LENGTH = 2048;
const TURNSTILE_VERIFY_TIMEOUT_MS = 10_000;
const GENERIC_FAILURE_MESSAGE = 'CAPTCHA verification failed. Please try again.';

export const RAG_SERVICE_TOKEN_HEADER = 'X-Service-Token';

const RAG_SERVICE_TOKEN = process.env.RAG_SERVICE_TOKEN;

export function isRagServiceTokenValid(provided: string | null): boolean {
  if (!provided || !RAG_SERVICE_TOKEN) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(RAG_SERVICE_TOKEN);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('TURNSTILE_SECRET_KEY environment variable is not configured');
  }

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      errorCodes: ['missing-input-response'],
    };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  let data: TurnstileVerifyResponse;

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(TURNSTILE_VERIFY_TIMEOUT_MS),
      body,
    });

    if (!response.ok) {
      return {
        success: false,
        errorCodes: ['turnstile-service-error'],
      };
    }

    data = await response.json();
  } catch {
    return {
      success: false,
      errorCodes: ['turnstile-service-error'],
    };
  }

  return {
    success: data.success,
    errorCodes: data['error-codes'],
    timestamp: data.challenge_ts,
    hostname: data.hostname,
    action: data.action,
  };
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

function getExpectedHostnames(): Set<string> {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean)
  );
}

export async function validateTurnstileToken({
  token,
  expectedAction,
  remoteIp,
}: TurnstileValidationInput): Promise<TurnstileValidationResult> {
  const turnstileConfigured = isTurnstileConfigured();
  const shouldEnforce = process.env.NODE_ENV === 'production' || turnstileConfigured;

  if (!shouldEnforce) {
    return { success: true };
  }

  if (!turnstileConfigured) {
    return {
      success: false,
      status: 503,
      code: 'TURNSTILE_NOT_CONFIGURED',
      message: 'CAPTCHA verification is temporarily unavailable.',
    };
  }

  const expectedHostnames = getExpectedHostnames();

  if (expectedHostnames.size === 0) {
    return {
      success: false,
      status: 503,
      code: 'TURNSTILE_HOSTNAMES_NOT_CONFIGURED',
      message: 'CAPTCHA verification is temporarily unavailable.',
    };
  }

  if (!token || token.trim() === '') {
    return {
      success: false,
      status: 400,
      code: 'TURNSTILE_TOKEN_REQUIRED',
      message: 'CAPTCHA verification is required.',
    };
  }

  if (token.length > TURNSTILE_MAX_TOKEN_LENGTH) {
    return {
      success: false,
      status: 400,
      code: 'TURNSTILE_VERIFICATION_FAILED',
      message: GENERIC_FAILURE_MESSAGE,
    };
  }

  const result = await verifyTurnstileToken(token, remoteIp);

  if (!result.success) {
    return {
      success: false,
      status: 400,
      code: 'TURNSTILE_VERIFICATION_FAILED',
      message: GENERIC_FAILURE_MESSAGE,
    };
  }

  if (result.action !== expectedAction) {
    return {
      success: false,
      status: 400,
      code: 'TURNSTILE_ACTION_MISMATCH',
      message: GENERIC_FAILURE_MESSAGE,
    };
  }

  if (!result.hostname || !expectedHostnames.has(result.hostname)) {
    return {
      success: false,
      status: 400,
      code: 'TURNSTILE_HOSTNAME_MISMATCH',
      message: GENERIC_FAILURE_MESSAGE,
    };
  }

  return { success: true };
}
