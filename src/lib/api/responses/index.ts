import { NextResponse } from 'next/server';

type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

type ErrorResponse = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json<SuccessResponse<T>>({
    success: true,
    data,
    message,
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
) {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

export function notFoundResponse(resource: string = 'Resource') {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function validationErrorResponse(details: unknown) {
  return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', details);
}

export function serverErrorResponse(message: string = 'Internal server error') {
  return errorResponse(message, 500, 'INTERNAL_ERROR');
}
