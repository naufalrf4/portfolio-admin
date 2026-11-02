import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/utils/logger';

type ErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

interface ErrorContext {
  operation: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

interface ClientErrorResponse {
  success: false;
  error: string;
  code: ErrorType;
  requestId?: string;
}

function getErrorType(error: unknown): ErrorType {
  if (error instanceof ZodError) {
    return 'VALIDATION_ERROR';
  }

  if (error instanceof Error) {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    if (
      errorName.includes('postgres') ||
      errorName.includes('drizzle') ||
      errorMessage.includes('duplicate key') ||
      errorMessage.includes('violates') ||
      errorMessage.includes('foreign key') ||
      errorMessage.includes('relation')
    ) {
      return 'DATABASE_ERROR';
    }
    if (
      errorMessage.includes('invalid input syntax') ||
      errorMessage.includes('malformed array literal') ||
      errorMessage.includes('violates check constraint')
    ) {
      return 'VALIDATION_ERROR';
    }
    if (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized')) {
      return 'AUTH_ERROR';
    }
    if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      return 'NOT_FOUND';
    }
  }

  return 'INTERNAL_ERROR';
}

function getStatusCode(errorType: ErrorType): number {
  const statusCodeMap: Record<ErrorType, number> = {
    VALIDATION_ERROR: 400,
    AUTH_ERROR: 401,
    NOT_FOUND: 404,
    DATABASE_ERROR: 500,
    INTERNAL_ERROR: 500,
  };

  return statusCodeMap[errorType];
}

function getClientMessage(errorType: ErrorType): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return 'Check server logs for details';
  }

  const messages: Record<ErrorType, string> = {
    VALIDATION_ERROR: 'Invalid request data',
    AUTH_ERROR: 'Authentication required',
    NOT_FOUND: 'Resource not found',
    DATABASE_ERROR: 'Database operation failed',
    INTERNAL_ERROR: 'An unexpected error occurred',
  };

  return messages[errorType];
}

export function handleApiError(
  error: unknown,
  context: ErrorContext
): NextResponse<ClientErrorResponse> {
  const errorType = getErrorType(error);
  const statusCode = getStatusCode(errorType);
  const clientMessage = getClientMessage(errorType);

  const logContext: Record<string, unknown> = {
    operation: context.operation,
    errorType,
    statusCode,
  };

  if (context.requestId) {
    logContext.requestId = context.requestId;
  }

  if (context.userId) {
    logContext.userId = context.userId;
  }

  if (context.metadata) {
    logContext.metadata = context.metadata;
  }

  logger.error(`Operation failed: ${context.operation}`, error, logContext);

  const response: ClientErrorResponse = {
    success: false,
    error: clientMessage,
    code: errorType,
  };

  if (context.requestId) {
    response.requestId = context.requestId;
  }

  return NextResponse.json(response, { status: statusCode });
}
