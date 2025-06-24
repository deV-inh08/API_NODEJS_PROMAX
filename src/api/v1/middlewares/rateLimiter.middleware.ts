import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const generalLimiter = rateLimit({
  windowMs: 50 * 60 * 1000, // 15 minutes
  max: 100, //  100 request per window
  message: {
    status: 'error',
    message: 'Too many request, please try again later'
  }
})
