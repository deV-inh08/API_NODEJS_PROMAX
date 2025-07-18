import fs from 'fs'
import z from 'zod'
import path from 'path'
import env from 'dotenv'

// call fn config env - only load .env if not in test environment
if (process.env.NODE_ENV !== 'test') {
  env.config({
    path: '.env'
  })
}

// check file .env is exists
const checkIsExistEnvFile = () => {
  if (!fs.existsSync(path.resolve('.env'))) {
    console.log('file Env not found')
  }
}
checkIsExistEnvFile()

//  config Schema
const configSchemaEnv = z.object({
  PORT: z.string().default('3000'),
  DB_URI: z.string().default('mongodb://localhost:27017'),
  DB_NAME: z.string().default('testing'),
  DB_OPTION: z.string().default('retryWrites=true&w=majority'),
  NODE_ENV: z.string().default('test'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_TOKEN_SECRET: z.string().default('test_access_secret_key_123456'),
  JWT_REFRESH_TOKEN_SECRET: z.string().default('test_refresh_secret_key_123456'),
  ALGORITHM: z.string().default('HS256'),
  EMAIL_ADMIN: z.string().default('test@gmail.com'),
  EMAIL_APP_PASSWORD: z.string().default('email_app_password'),
  FIREBASE_API_KEY: z.string().default('firebase'),
  FIREBASE_AUTH_DOMAIN: z.string().default('firebase'),
  FIREBASE_PROJECT_ID: z.string().default('firebase'),
  FIREBASE_STORAGE: z.string().default('firebase'),
  FIREBASE_MESSAGING_SENDER_ID: z.string().default('firebase'),
  FIREBASE_APP_ID: z.string().default('firebase'),
  FIREBASE_MEASUREMENT_ID: z.string().default('firebase'),
  TWILIO_ACCOUNT_SID: z.string().default('abcdddd'),
  TWILIO_AUTH_TOKEN: z.string().default('hahahha'),
  TWILIO_PHONE_NUMBER: z.string().default('000000'),
  TWILIO_SERVICES_SID: z.string().default('jakasldsal')
})

// from schema -> object {isSuccess, data: {} }
const object = configSchemaEnv.safeParse(process.env)

// check schema is correct
if (!object.success && !object.data) {
  console.error('❌ Environment validation failed:', object.error.errors)
  throw new Error('Environment configuration is invalid')
}

const envConfig = object.data
export default envConfig
