import type { Request, Response, NextFunction } from 'express'
import { type AnyZodObject, ZodError } from 'zod'
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