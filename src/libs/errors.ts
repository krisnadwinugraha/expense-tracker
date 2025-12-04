// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 403, 'UNAUTHORIZED')
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: any
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}
