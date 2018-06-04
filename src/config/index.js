// @flow
import dotenv from 'dotenv';

dotenv.config({path: __dirname + '/../../.env'});

export type MongoConfig = {
  name: string;
  url: string;
  options: {
      ssl: boolean;
      sslValidate: boolean;
      sslCA: Array<mixed>
  }
}

export type AMPQConfig = {
  exchange: string,
  url: string,
  topics: Array<string>,
}

export type ApiServerConfig = {
    port: string;
}

export type AppConfig = {
    api: ApiServerConfig;
    mongodb: MongoConfig;
    amqp: AMPQConfig;
}

//  About new Buffer deprecated in Node 10:
// https://nodesource.com/blog/understanding-the-buffer-deprecation-in-node-js-10/
const appConfig: AppConfig = {
  api: {
    port: process.env.PORT || '8000',
  },
  mongodb: {
    name: 'loyalty',
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/temp',
    options: {
      ssl: process.env.MONGO_SSL === 'true',
      sslValidate: process.env.MONGO_SSL_VALIDATE === 'true',
      sslCA: [Buffer.from(process.env.MONGO_SSL_CERT || '', 'utf-8')],
    },
  },
  amqp: {
    exchange: process.env.AMQP_MAIN_EXCHANGE || 'events',
    url: process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672',
    topics: [
      'ride.*',
      'rider.*',
    ],
  },
};

export default appConfig;

