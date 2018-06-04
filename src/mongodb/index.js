// @flow
import mongoose from 'mongoose';
import type { Connection } from 'mongodb'
import logger from '../logger';
import type { MongoConfig } from '../config';

mongoose.Promise = global.Promise;

/**
 * Class MongoDB
 */
export default class MongoDB {
  config: MongoConfig;
  db: mongoose.Connection;

  /**
   * Constructor
   * @param config
   */
  constructor(config: MongoConfig) {
    this.config = config;
  }

  /**
   * Connect to the RabbitMQ server and prepare Exchange / Queue binding
   * @returns {Promise<void>}
   */
  async connect(): Promise<void> {
    logger.log('info', `Connecting to MongoDB server: ${this.config.url}`);
    this.db = await mongoose.connect(this.config.url);
    logger.log('info', 'Connected to MongoDB');

  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db = null;
      await mongoose.disconnect();
    }
  }
}
