export const OTP = {
  MAX_ATTEMPTS: 5, // Max OTP
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  RATE_LIMIT_TIME: 60 * 1000 // 1 minute between requests
} as const
