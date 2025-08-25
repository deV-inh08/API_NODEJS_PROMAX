import { Kafka } from "kafkajs"

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092', 'localhost:9092'],
})

const producer = kafka.producer()

const runProducer = async () => {

  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello by Vinh dev' },
    ],
  })

  await producer.disconnect()
}
runProducer().catch(console.error)