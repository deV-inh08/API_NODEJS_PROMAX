interface CollectionMetricsType {
  connections: number
  maxRecommended: number
  memory: {
    rss: number
    heapUsed: number
  }
  timeStamp: Date
}

export { CollectionMetricsType }
