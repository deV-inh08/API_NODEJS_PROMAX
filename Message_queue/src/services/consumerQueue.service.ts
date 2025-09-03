import { consumerQueue, connectRabbitMq } from "../db/init.rabbitmq";


export class MessageService {

    consumerToQueue = async (queueName: string) => {
        try {
            const { channel } = await connectRabbitMq()
            await consumerQueue(channel, queueName)
        } catch (error) {
            console.error('Consumer to Queue failed');
        }
    }

    consumerToQueueNormal = async (queueName: string) => {
        try {
            const { channel } = await connectRabbitMq()
            const nofiQueue = 'notificationQueueProcess'
            channel.consume(nofiQueue, (msg) => {
                try {
                    const numberTest = Math.random()
                    console.log({ numberTest });
                    if (!msg) throw new Error('Cannot found message')
                    if (numberTest < 0.5) {
                        throw new Error('Send notification failed')
                    }
                    console.log(`SEND notificationQueue succesfully processed::: ${msg.content.toString()}`);
                    channel.ack(msg)
                } catch (error) {
                    channel.nack(msg!, false, false)
                }
            })
        } catch (error) {
            console.error('Consumer to Queue Normal failed');
        }
    }

    consumerToQueueFailed = async (queueName: string) => {
        try {
            const { channel } = await connectRabbitMq()
            const notificationExchangeDLX = 'notificationExDLX'
            const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'
            const notiQueueHandler = 'notificationQueueHotFix'

            await channel.assertExchange(notificationExchangeDLX, 'direct', {
                durable: true
            })

            const queueResult = await channel.assertQueue(notiQueueHandler, {
                exclusive: false
            })

            await channel.bindQueue(queueResult.queue, notificationExchangeDLX, notificationRoutingKeyDLX)
            await channel.consume(queueResult.queue, (msgFailed) => {
                console.log(`this notification error: pls hot fix:: ${msgFailed?.content.toString()}`);
            }, {
                noAck: true
            })
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}