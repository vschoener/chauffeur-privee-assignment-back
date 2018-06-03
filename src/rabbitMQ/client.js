// @flow
import type { Channel, ChannelModel } from 'amqplib/lib/channel_model';
import * as amqplib from 'amqplib';
import type { AMPQConfig } from '../config';
import logger from '../logger';
import type { EventConsumerInterface } from './eventsConsumer';

/**
 * Class Client
 */
export default class Client {
  config: AMPQConfig;
  conn: ChannelModel;
  channel: Channel;
  queueInfo: Object;

  /**
   * Constructor
   * @param config
   */
  constructor(config: AMPQConfig) {
    this.config = config;
  }

  /**
   * Connect to the RabbitMQ server and prepare Exchange / Queue binding
   * @returns {Promise<void>}
   */
  async connect(): Promise<void> {
    logger.log('info', `Connecting to RabbitMQ server: ${this.config.url}`);

    this.conn = await amqplib.connect(this.config.url);
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange(this.config.exchange, 'topic', { durable: true });
    this.queueInfo = await this.channel.assertQueue('', { exclusive: true });

    this.config.topics.forEach((topic: string) => {
      this.channel.bindQueue(this.queueInfo.queue, this.config.exchange, topic);
    });
  }

  /**
   * Bind RabbitMQ messages as event from routing key
   * @param events
   */
  bindEvents(events: Map<string, EventConsumerInterface>) {
    logger.log('info', ' [*] Waiting for Event Messages');

    this.channel.consume(this.queueInfo.queue, (msg) => {
      // Destructuring attributes from object
      // We could also enforce type on these one
      const { fields, content } = msg;
      const eventConsumer = events.get(fields.routingKey);

      if (eventConsumer) {
        logger.log('info', "Event found: [x] %s:'%s'", fields.routingKey, content.toString());
        eventConsumer.consume(JSON.parse(content.toString()));
      } else {
        // Log this one as an error and have report about it with our logger services in case we need to
        // fix somethings wrong
        logger.log('error', "Event not found: [x] %s:'%s'", fields.routingKey, content.toString());
      }
    });
  }
}
