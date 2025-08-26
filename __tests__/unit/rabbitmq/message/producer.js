import amqplib from 'amqplib'
const message = 'Hello RabbitMQ from tranduongvinh'

const runProducer = async () => {
  try {
    const connection = await amqplib.connect('amqp://guest:301108@localhost')
    const channel = await connection.createChannel()
    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true
    })

    // send message to consumer channel
    channel.sendToQueue(queueName, Buffer.from(message))
    console.log(`message sent:`, message)

    // cron job => set timeout to turn off
    // ...
  } catch (error) {
    console.error(error)
  }
}
runProducer().catch(console.error)
