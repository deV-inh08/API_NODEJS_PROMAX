import amqplib from 'amqplib'

async function consumerOrderedMessage() {
  const connection = await amqplib.connect('amqp://guest:301108@localhost')
  const channel = await connection.createChannel()
  const queueName = 'ordered-queue-message'

  // create queue
  await channel.assertQueue(queueName, {
    durable: true
  })

  channel.prefetch(1)

  // received message
  channel.consume(queueName, (msg) => {
    const message = msg.content.toString()
    setTimeout(() => {
      console.log('processed', message)
      channel.ack(msg)
    }, Math.random() * 1000)
  })

  process.on('SIGINT', async () => {
    await channel.close()
    await connection.close()
    process.exit(0)
  })
}

consumerOrderedMessage().catch((error) => console.error(error))
