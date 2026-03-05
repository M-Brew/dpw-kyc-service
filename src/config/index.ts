import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 5005,
  mongodbUri: process.env.DB_URI || 'mongodb://localhost/dpw_kyc_db',
  kafka: {
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
    clientId: 'kyc-service',
    groupId: "kyc-service-transactions",
    topics: {
      transactionEvents: 'transaction-events',
      kycEvents: 'kyc-events', // To notify other services about KYC status
    }
  },
  thirdPartyKycApi: {
    url: process.env.THIRD_PARTY_KYC_API_URL || 'https://api.mock-kyc.com',
    apiKey: process.env.THIRD_PARTY_KYC_API_KEY || 'your_kyc_api_key',
  }
};
