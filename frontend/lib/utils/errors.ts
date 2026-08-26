export class AppError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'API_ERROR', statusCode);
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class InvestigationError extends AppError {
  constructor(message: string) {
    super(message, 'INVESTIGATION_ERROR');
  }
}
