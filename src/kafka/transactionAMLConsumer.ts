import { Kafka } from "kafkajs";

import config from "../config";
import AMLFlag from "../models/amlFlag.model";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

const initConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: config.kafka.topics.transactionEvents, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.info(`AML Service: Received transaction event from Kafka topic ${topic}: ${JSON.stringify(event)}`);

        // Simple AML rules (replace with complex logic/ML models)
        if (event.type === 'transaction_completed' && event.status === 'SUCCESS') {
          if (event.amount > 50000 && event.currency === 'GHS') { // High value transaction
            await AMLFlag.create({
              userId: event.senderUserId,
              transactionId: event.transactionId,
              reason: 'HighValueTransaction',
              severity: 'HIGH',
              details: event,
            });
            console.warn(`AML Flagged: High value transaction for user ${event.senderUserId}, Transaction ID: ${event.transactionId}`);
          }
          // Add more rules:
          // - Frequent small transactions
          // - Transactions to/from sanctioned countries (requires external data)
          // - Unusual transaction patterns (requires historical data and ML)
        }
      },
    });
    console.info('Kafka AML Consumer started.');
  } catch (error) {
    console.error('Error connecting Kafka AML Consumer:', error);
    setTimeout(initConsumer, 5000);
  }
};

export { initConsumer };