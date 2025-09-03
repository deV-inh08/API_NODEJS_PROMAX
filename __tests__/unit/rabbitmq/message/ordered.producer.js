import amqplib from 'amqplib'

export async function producerOrderedMessage() {
  const connection = await amqplib.connect('amqp://guest:301108@localhost')
  const channel = await connection.createChannel()
  const queueName = 'ordered-queue-message'

  // create queue
  await channel.assertQueue(queueName, {
    durable: true // keep queue
  })

  for (let i = 0; i < 10; i++) {
    const message = `ordered message ${i}`
    console.log('message::', message)
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true // keep message when server error || restart server
    })
  }

  setTimeout(() => {
    connection.close()
  }, 1000)
}

producerOrderedMessage().catch((error) => console.error(error))
