// @flow
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from 'morgan';
import express from 'express';
import type { $Application } from 'express';

import type { AppConfig } from './config/';
import router from './api';

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

    constructor(
      expressApp: $Application,
      config: AppConfig,
    ) {
      this.expressApp = expressApp;
      this.config = config;
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
      this.expressApp.use(logger('combined'));

      // Attach app routes
      this.expressApp.use(router);


      // Api docs
      this.expressApp.use('/apidoc', express.static('apidoc'));
    }

    // initializeMongoDb() {
    //
    // }
    //
    // // Should be better to use Queue Interface in case one day it changes)
    // initializeRabbitMQ() {
    //
    // }

    init() {
      this.initializeExpress();
      // this.initializeMongoDb();
      // this.initializeRabbitMQ();
    }

    async start(): Promise<App> {
      this.server = await this.expressApp.listen(this.config.api.port);
      // eslint-disable-next-line no-console
      console.log(`✔ Server running on port ${this.config.api.port}`);

      return this;
    }

    async stop(): Promise<App> {
      return this;
    }

    getExpressApp(): $Application {
      return this.expressApp;
    }
}

export default App;
