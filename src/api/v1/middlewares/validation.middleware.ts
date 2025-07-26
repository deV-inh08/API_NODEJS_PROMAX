import type { Request, Response, NextFunction } from 'express'
import z, { type AnyZodObject, ZodError } from 'zod'
import { ValidationError } from '~/api/v1/utils/response.util'

export const validationReq = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const ErrorMessages = error.errors.map((error) => ({
          path: error.path.join('.'),
          message: error.message
        }))
        next(new ValidationError('Validation failed', ErrorMessages))
      }
      next(error)
    }
  }
}

export const validateUpdateProduct = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Pre-process: Remove any product_type field (security)
      if (req.body && 'product_type' in req.body) {
        delete req.body.product_type
        console.log('🚫 Removed product_type from request body')
      }

      // Validate with schema
      const result = await schema.parseAsync({
        params: req.params,
        body: req.body
      })

      // Replace request with cleaned data
      req.params = result.params
      req.body = result.body

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }))
        next(new ValidationError('Validation failed', errorMessages))
      } else {
        next(error)
      }
    }
  }
}
