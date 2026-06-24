import { AppError } from '../middleware/errorHandler.middleware';

export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message, statusCode);
  }
}

export function asyncHandler<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
) {
  return (...args: Parameters<T>) => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw error;
    });
  };
}
