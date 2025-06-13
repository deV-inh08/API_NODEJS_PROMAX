import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import helmet from 'helmet'
import envConfig from '~/config/env.config'
import instanceMongoDb from '~/api/v1/db/init.mongo'
import { checkOverLoad } from '~/api/v1/helpers/checkConnect.helper'

const app = express()

// init middleware
app.use(compression())
app.use(morgan('dev'))
app.use(helmet())

// init DB
instanceMongoDb.connect()
checkOverLoad()

// init routes
app.get('/', (req, res) => {
  const str = 'duongvinh'
  res.status(200).json({
    message: 'Hello world',
    metaData: str.repeat(100000)
  })
})


// handling Error

export { app }

