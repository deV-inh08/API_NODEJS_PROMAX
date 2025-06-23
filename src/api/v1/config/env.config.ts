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
  DB_URI: z.string(),
  DB_NAME: z.string(),
  NODE_ENV: z.string(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  ALGORITHM: z.string()
})

// from schema -> object {isSuccess, data: {} }
const object = configSchemaEnv.safeParse(process.env)

// check schema is correct
if (!object.success && !object.data) {
  throw Error('File .env is correct')
}

const envConfig = object.data
export default envConfig
