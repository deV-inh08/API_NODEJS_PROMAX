import mongoose from 'mongoose'
import os from 'os'
import process from 'process'
import type { CollectionMetricsType } from '~/monitoring/types/mongoMonitor.type'
import envConfig from '~/api/v1/config/env.config'

class MongoDBMonitor {
  // declare type
  private static instance: MongoDBMonitor
  private timeInterval: number
  private checkIntervalMonitor: NodeJS.Timeout | null = null
  private maxConnectionCores: number
  constructor(
    timeInterval: number = 30000, // check interval
    maxConnectionCores: number = 5 // example 1 cor => 5 connections
  ) {
    this.timeInterval = timeInterval
    this.maxConnectionCores = maxConnectionCores
  }

  static getInstance(): MongoDBMonitor {
    if (!MongoDBMonitor.instance) {
      MongoDBMonitor.instance = new MongoDBMonitor()
    }
    return MongoDBMonitor.instance
  }

  // Return object information metrics
  private collectionMetrics(): CollectionMetricsType {
    const numberConnections = mongoose.connections.length
    const numCors = os.cpus().length
    const memoriesUsage = process.memoryUsage()

    // return information metrics
    return {
      connections: numberConnections,
      maxRecommended: numCors * this.maxConnectionCores,
      memory: {
        rss: Math.round(memoriesUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoriesUsage.heapUsed / 1024 / 1024) // MB
      },
      timeStamp: new Date()
    }
  }

  // analyze metrics from 'collectionMetrics'
  private analyzeMetrics(metrics: CollectionMetricsType) {
    // check overload
    if (metrics.connections > metrics.maxRecommended) {
      console.warn(`🚨 CONNECTION OVERLOAD: ${metrics.connections}/${metrics.maxRecommended} connections`)
      console.warn(`💡 Consider reducing maxPoolSize or scaling horizontally`)
    }

    // check memory usage (warning at 1GB)
    if (metrics.memory.rss > 1024) {
      console.warn(`⚠️ HIGH MEMORY USAGE: ${metrics.memory.rss}MB RSS`)
    }

    // check metrics in development
    if (envConfig.NODE_ENV === 'development') {
      console.log(`📊 Connections: ${metrics.connections}, Memory: ${metrics.memory.rss}MB`)
    }
  }

  // get Collection Metrics
  getCurrentMetrics(): CollectionMetricsType {
    return this.collectionMetrics()
  }

  // check performance
  private performCheck() {
    // get metrics
    const metrics = this.getCurrentMetrics()
    // analyze metrics
    this.analyzeMetrics(metrics)
  }

  // startMonitor
  startMonitoring() {
    if (this.checkIntervalMonitor) {
      console.log('⚠️ Monitoring already running')
      return
    }
    console.log('📊 Starting connection monitoring...')

    // Run immediately, then on interval
    this.performCheck()

    this.checkIntervalMonitor = setInterval(() => {
      this.performCheck()
    }, this.timeInterval)
  }

  // stopMonitor
  stopMonitor() {
    if (this.checkIntervalMonitor) {
      clearInterval(this.checkIntervalMonitor)
      this.checkIntervalMonitor = null
      console.log('🛑 Connection monitoring stopped')
    }
  }
}

export default MongoDBMonitor
