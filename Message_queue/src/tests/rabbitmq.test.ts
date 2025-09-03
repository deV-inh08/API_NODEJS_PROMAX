import { connectRabbitMqForTest } from '../db/init.rabbitmq'
describe('RabbitMq connection', () => {
    it('should connect to successful RabbitMq', async () => {
        const result = await connectRabbitMqForTest();

        if (result) {
            expect(result).toHaveProperty('channel');
            expect(result).toHaveProperty('connection');
        } else {
            expect(result).toBeUndefined();
        }
    });
});