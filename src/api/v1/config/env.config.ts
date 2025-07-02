import fs from 'fs'
import z from 'zod'
import path from 'path'
import env from 'dotenv'

// call fn config env
env.config({
  path: '.env'
})

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
  DB_NAME: z.string().default('test_db'),
  DB_OPTION: z.string().default('retryWrites=true&w=majority'),
  NODE_ENV: z.string().default('test'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_TOKEN_SECRET: z.string().default('test_access_secret_key_123456'),
  JWT_REFRESH_TOKEN_SECRET: z.string().default('test_refresh_secret_key_123456'),
  ALGORITHM: z.string().default('HS256')
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
