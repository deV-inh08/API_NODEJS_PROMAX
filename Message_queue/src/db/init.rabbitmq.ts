import amqplib from 'amqplib'
import type { Channel, ChannelModel } from 'amqplib'

export const connectRabbitMq = async (): Promise<{
    channel: Channel,
    connection: ChannelModel
}> => {
    const connection = await amqplib.connect({
        protocol: 'amqp',
        hostname: 'localhost', // hoặc địa chỉ server
        port: 5672,
        username: 'guest',     // Kiểm tra username
        password: '301108',     // Kiểm tra password
    })
    if (!connection) throw new Error('Connection not established')
    const channel = await connection.createChannel()
    return { channel, connection }
}

export const connectRabbitMqForTest = async () => {
    try {
        const connect = await connectRabbitMq()
        if (!connect) {
            throw new Error('Connect rabbitmq failed')
        }
        const { connection, channel } = connect

        // queue
        const queue = 'test-queue'
        const message = 'Hello, Tran Duong Vinh'
        await channel.assertQueue(queue)
        await channel.sendToQueue(queue, Buffer.from(message))

        // close connection 
        await connection.close()

        return {
            connection, channel
        }
    } catch (error) {
        console.error('error connection rabbitmq');
    }
}

export const consumerQueue = async (channel: Channel, queueName: string) => {
    try {
        await channel.assertQueue(queueName, {
            durable: true // keep queue when server error or restart
        })

        channel.consume(queueName, (msg) => {
            console.log(`Received message: ${queueName}:: ${msg?.content.toString()}`);
            // 1. Find user following shop
            // 2 Send message to user
            // 3 yes => ok
            // 4 error => DLX
        }, {
            noAck: true // When the system error ?
        })
    } catch (error) {
        console.error('error publish message to rabbitMQ')
    }
}


