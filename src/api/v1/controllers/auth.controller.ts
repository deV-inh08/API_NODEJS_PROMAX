import type { Request, Response, NextFunction } from 'express'

// route -> validate (zod) -> middleware (rate-limit) -> controller -> Services (DB) -> Models (declare schema)