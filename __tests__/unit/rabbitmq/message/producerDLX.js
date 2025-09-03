import amqplib from 'amqplib'

const runProducer = async () => {
  try {
    const connection = await amqplib.connect('amqp://guest:301108@localhost')
    const channel = await connection.createChannel()
    const queueName = 'test-topic'

    const notificationExchange = 'notificationEx'
    const nofiQueue = 'notificationQueueProcess'
    const notificationExchangeDLX = 'notificationExDLX'
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

    // 1. Create Exchange
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true
    })

    // 2. Create queue
    const queueResult = await channel.assertQueue(nofiQueue, {
      exclusive: false, // cho phép các kết nối truy cập vào hàng đợi cùng lúc
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
      messageTtl: 10000
    })

    // 3. Bind Queue
    await channel.bindQueue(queueResult.queue, notificationExchange)

    // 4. Send message
    const msg = 'a new product was created'
    console.log(`producer msg: ${msg}`)

    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '10000'
    })
    // cron job => set timeout to turn off
    // ...
    setTimeout(() => {
      connection.close()
      process.exit(0)
    }, 500)
  } catch (error) {
    console.error(error)
  }
}
runProducer().catch(console.error)
