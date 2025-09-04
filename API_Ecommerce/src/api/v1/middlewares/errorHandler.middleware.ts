import type { Request, Response, NextFunction } from 'express'
import envConfig from '~/api/v1/config/env.config'
import { ErrorResponse } from '~/api/v1/utils/response.util'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorResponse) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      errorType: err.errorType,
      ...(err.details && {
        details: err.details
      }),
      metaData: {
        timeStamp: new Date().toISOString()
      }
    })
  }

  // default error
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: envConfig.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    errorType: 'INTERNAL_SERVER_ERROR'
  })
}
