// @flow
import type { Channel, ChannelModel } from 'amqplib/lib/channel_model';
import * as amqplib from 'amqplib';
import md5 from 'md5';
import type { AMPQConfig } from '../config';
import logger from '../logger';
import type { EventConsumerInterface } from './eventsConsumer';
import {MessageError} from './messageError';

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
  consume(events: Map<string, EventConsumerInterface>) {
    logger.log('info', ' [*] Waiting for Event Messages');

    // Used to manage duplicate message and might be used to reorder message
    const messagesStack: Array<String> = [];
    this.channel.consume(this.queueInfo.queue, (msg) => {

      // Destructuring attributes from object
      // We could also enforce type on these one
      // @content is a Buffer
      const { fields, content } = msg;
      const contentAsString = content.toString();
      const encodedMessage = md5(contentAsString);
      const contentObj = JSON.parse(contentAsString);
      const eventConsumer = events.get(contentObj.type);

      if (messagesStack.findIndex((message) => message === encodedMessage) >= 0) {
        logger.log('info', `Duplicated message, skipped. : ${contentAsString}`);
        return;
      }

      messagesStack.push(encodedMessage);
      if (eventConsumer) {
        logger.log('info', `Event found: ${fields.routingKey}:'${contentAsString}'`);
        // Catch error here to keep the process running
        eventConsumer.consume(contentObj.payload)
          .catch((e: MessageError) => {
            if (e instanceof MessageError) {
              logger.log(e.logLevel, (e.requeue ? 'Requeue ' : 'Discard' ) + e.message);
              if (e.requeue) {
                // Remove the message from our stack to replay it later
                messagesStack.splice(messagesStack.indexOf(encodedMessage), 1);
                // Maybe we could add limit to retry a message ? Or message should always been ok but sometimes
                // disordered (use message timestamp ?)
                this.channel.nack(msg);
              }
              return;
            }
            logger.log('error', e.message);
          });
      } else {
        // Log this one as an error and have report about it with our logger services in case we need to
        logger.log('error', `Event not found: [x] ${fields.routingKey}:'${contentAsString}'`);
      }

      // Keep memory low
      if (messagesStack.length > 1024) {
        messagesStack.shift();
      }
    });
  }
}
