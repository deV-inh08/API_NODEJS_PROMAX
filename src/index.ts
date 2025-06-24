import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import helmet from 'helmet'
import Database from '~/api/v1/db/init.mongo'
import MongoDBMonitor from '~/monitoring/mongoDb.monitor'
import routerApiV1 from '~/api/v1/routes/index.route'

const app = express()

// ==================== BODY PARSING ====================
app.use(
  express.json({
    limit: '10mb'
  })
)
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ==================== MIDDLEWARE ====================

// Compression middleware
app.use(compression())

app.use(morgan('dev'))

// Security headers
app.use(helmet())



// ==================== API ROUTE ====================
app.use('/api/v1', routerApiV1)

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

// ==================== HANDLE ERROR ====================

// export app
export { app }
