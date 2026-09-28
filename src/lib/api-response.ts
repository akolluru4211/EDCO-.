import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "PROFILE_SAVE_FAILED"
  | "DATABASE_ERROR"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "INTEGRATION_UNAVAILABLE"
  | "FILE_UPLOAD_FAILED"
  | "GATEWAY_TIMEOUT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_SERVER_ERROR";


export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  request_id?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode | string;
    message: string;
    request_id?: string;
    details?: any;
  };
}

export function apiSuccess<T>(data: T, status: number = 200, requestId?: string): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(requestId ? { request_id: requestId } : {})
    },
    { status }
  );
}

export function apiError(
  code: ApiErrorCode | string,
  message: string,
  status: number = 400,
  details?: any,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(requestId ? { request_id: requestId } : {}),
        ...(details ? { details } : {})
      }
    },
    { status }
  );
}
