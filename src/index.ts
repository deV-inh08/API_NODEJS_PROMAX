import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import helmet from 'helmet'
import Database from '~/api/v1/db/init.mongo'
import MongoDBMonitor from '~/monitoring/mongoDb.monitor'


const app = express()

// init middleware
app.use(compression())
app.use(morgan('dev'))
app.use(helmet())

// init routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world'
  })
})

app.get('/health', async (req, res) => {
  try {
    const database = Database.getInstace()
    const monitor = MongoDBMonitor.getInstance()

    const [dbHealth, metrics] = await Promise.all([
      database.healthCheck(),
      Promise.resolve(monitor.getCurrentMetrics())
    ])

    res.status(200).json({
      timeStamp: new Date(),
      database: dbHealth,
      metrics
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// handling Error

export { app }
