import { ErrorMessage } from "~/api/v1/constants/messages.constant"

// ==================== SUCCESS RESPONSE ====================
interface ISuccessResponse<T = any> {
  status: 'success'
  statusCode: number
  message: string
  data?: T
  metadata?: {
    timestamp: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export class SuccessResponse<T = any> {
  private response: ISuccessResponse<T>
  constructor(
    message: string = 'success',
    statusCode: number = 200,
    data?: T,
    metadata?: ISuccessResponse<T>['metadata']
  ) {
    this.response = {
      status: 'success',
      statusCode,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }
  }

  // Static factory methods for common success responses
  static ok<T>(data?: T, message: string = 'Success'): SuccessResponse<T> {
    return new SuccessResponse(message, 200, data)
  }

  static created<T>(data?: T, message: string = 'Resource created successfully'): SuccessResponse<T> {
    return new SuccessResponse(message, 201, data)
  }

  // Method to get response object
  getResponse(): ISuccessResponse<T> {
    return this.response
  }

  // Method to send response via Express Response object
  send(res: any): void {
    res.status(this.response.statusCode).json(this.response)
  }
}


// ==================== ERROR RESPONSE ====================

export class ErrorResponse extends Error {
  public statusCode: number
  public errorType: string
  public isOperational: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public details?: any

  constructor(message: string, statusCode: number, errorType: string = 'GENERIC_ERROR', isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.errorType = errorType
    this.isOperational = isOperational
  }
}

// Specific Error Classes
export class BadRequestError extends ErrorResponse {
  constructor(message: string = ErrorMessage.BAD_REQUEST, details?: any) {
    super(message, 400, ErrorMessage.BAD_REQUEST)
    this.details = details
  }
}

export class UnauthorizedError extends ErrorResponse {
  constructor(message: string, details?: any) {
    super(message, 401, ErrorMessage.UNAUTHORIZED)
    this.details = details
  }
}

export class ForbiddenError extends ErrorResponse {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends ErrorResponse {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends ErrorResponse {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT')
    this.details = details
  }
}

export class ValidationError extends ErrorResponse {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class InternalServerError extends ErrorResponse {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}
