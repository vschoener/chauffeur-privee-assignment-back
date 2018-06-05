// @flow
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import type { $Application } from 'express';
import type { AppConfig } from './config/';
import router from './api';
import logger from './logger';
import MongoDB from './mongodb';
import Client from './rabbitMQ/client';
import Event from './rabbitMQ/events';
import type { EventConsumerInterface } from './rabbitMQ/eventsConsumer';
import {
  RideCompletedEvent,
  RideCreateEvent,
  RiderPhoneUpdateEvent,
  RiderSignUpEvent,
} from './rabbitMQ/eventsConsumer';

// Can't import Server type, flow can't find it, too bad :(
// Even require('http') don't want to be resolved :/
// import type { Server } from 'http'

/**
 * In Node App, I always see everything in app.js without a class / object aspect but I feel it could be improve
 * that way if it's not overkill
 */
class App {
  expressApp: $Application;
  config: AppConfig;
  server: any;
  messagingClient: Client;
  mongoDb: MongoDB;

  constructor(
    expressApp: $Application,
    config: AppConfig,
  ) {
    this.expressApp = expressApp;
    this.config = config;
  }

  init() {
    this.initializeExpress();

    // Prepare our RabbitMQ client
    this.messagingClient = new Client(this.config.amqp);
    this.mongoDb = new MongoDB(this.config.mongodb);
  }

  // Should be private method
  initializeExpress() {
    // Attach basics Middleware

    // Use an error Handler middleware

    // Body parser
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));

    // Cors
    this.expressApp.use(cors());

    // Logging
    this.expressApp.use(morgan('combined', { stream: logger.stream }));

    // Attach app routes
    this.expressApp.use(router);


    // Api docs
    this.expressApp.use('/apidoc', express.static('apidoc'));
  }

  async prepareEventMessaging(): Promise<void> {
    logger.log('info', 'RabbitMQ initialization');
    await this.messagingClient.connect();

    const events: Map<string, EventConsumerInterface> = new Map();
    events.set(Event.RIDE.COMPLETED, new RideCompletedEvent());
    events.set(Event.RIDE.RIDE_CREATE, new RideCreateEvent());
    events.set(Event.RIDER.SIGN_UP, new RiderSignUpEvent());
    events.set(Event.RIDER.PHONE_UPDATE, new RiderPhoneUpdateEvent());

    this.messagingClient.consume(events);
  }

  async prepareMongoDb(): Promise<void> {
    await this.mongoDb.connect();
  }

  async start(): Promise<void> {
    await this.prepareMongoDb();
    await this.prepareEventMessaging();
    this.server = await this.expressApp.listen(this.config.api.port);
    logger.log('info', `✔ Server running on port ${this.config.api.port}`);
  }

  async stop(): Promise<void> {
  }

  getExpressApp(): $Application {
    return this.expressApp;
  }
}

export default App;
