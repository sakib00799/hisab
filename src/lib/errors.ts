export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UPGRADE_REQUIRED"
  | "CONFLICT"
  | "BAD_REQUEST";

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export const unauthorized = () =>
  new AppError("UNAUTHORIZED", "Authentication required", 401);

export const forbidden = (message = "You do not have permission") =>
  new AppError("FORBIDDEN", message, 403);

export const notFound = (resource = "Resource") =>
  new AppError("NOT_FOUND", `${resource} not found`, 404);

export const upgradeRequired = () =>
  new AppError(
    "UPGRADE_REQUIRED",
    "Upgrade your plan to access this feature",
    403
  );

export const conflict = (message: string) =>
  new AppError("CONFLICT", message, 409);

export const badRequest = (message: string, details?: unknown) =>
  new AppError("BAD_REQUEST", message, 400, details);
