import { MessageService } from './src/services/consumerQueue.service'

const queueName = 'test-topic'
const messageServices = new MessageService()

// messageServices.consumerToQueue(queueName).then(() => {
//     console.log(`message consumer started ${queueName}`);
// }).catch((error: any) => {
//     console.log(error);
// })

messageServices.consumerToQueueNormal(queueName).then(() => {
    console.log(`Message consumerToQueueNormal started ${queueName}`);
}).catch((error) => {
    console.error(`Message Error: ${error}`)
})

messageServices.consumerToQueueFailed(queueName).then(() => {
    console.log(`Message consumerToQueueFailed started ${queueName}`);
}).catch((error) => {
    console.error(`Message Error: ${error}`)
})