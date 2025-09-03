import amqplib from 'amqplib'

const runConsumer = async () => {
  try {
    const connection = await amqplib.connect('amqp://guest:301108@localhost')
    const channel = await connection.createChannel()
    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true
    })

    // receviced the message from consumer
    channel.consume(
      queueName,
      (message) => {
        console.log(`Receviced ${message.content.toString()} message`)
      },
      {
        noAck: false
      }
    )
  } catch (error) {
    console.error(error)
  }
}
runConsumer().catch(console.error)
