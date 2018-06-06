// @flow
import type { Channel, ChannelModel } from 'amqplib/lib/channel_model';
import * as amqplib from 'amqplib';
import md5 from 'md5';
import type { AMPQConfig } from '../config';
import logger from '../logger';
import type { EventConsumerInterface } from './eventsConsumer';
import { MessageError } from './messageError';

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

    if (this.config.qos > 0) {
      this.channel.qos(this.config.qos);
    }
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
    this.channel.consume(this.queueInfo.queue, async (msg) => {
      // Destructuring attributes from object
      // We could also enforce type on these one
      // @content is a Buffer
      const { fields, content } = msg;
      const contentAsString = content.toString();
      const encodedMessage = md5(contentAsString);
      let contentObj;
      try {
        contentObj = await JSON.parse(contentAsString);
      } catch (e) {
        logger.log('error', `${e.message}: ${contentAsString}`);
        return this.channel.ack(msg, false);
      }
      const eventConsumer = events.get(contentObj.type);

      if (!eventConsumer) {
        // Log this one as an error and have report about it with our logger services in case we need to
        logger.log('error', `Event not found: [x] ${fields.routingKey}:'${contentAsString}'`);
        return this.channel.ack(msg, false);
      }

      if (messagesStack.findIndex((message) => message === encodedMessage) >= 0) {
        logger.log('info', `Duplicated message, skipped. : ${contentAsString}`);
        return this.channel.ack(msg, false);
      }

      logger.log('info', `Event found: ${fields.routingKey}:'${contentAsString}'`);
      messagesStack.push(encodedMessage);

      // We control and limit the message coming
      let sendAck = true;
      await eventConsumer.consume(contentObj.payload)
        .catch((e: MessageError) => {
          if (e instanceof MessageError) {
            logger.log(e.logLevel, `${e.requeue ? 'Requeue ' : 'Discard '
            }${contentAsString}. Payload: ${contentAsString} with message: ${e.message}`);
            if (e.requeue) {
              // Remove the message from our stack to replay it later
              messagesStack.splice(messagesStack.indexOf(encodedMessage), 1);
              // Maybe we could add limit to retry a message ? Or message should always been ok but sometimes
              // disordered (use message timestamp ?)
              this.channel.nack(msg);
              sendAck = false;
            }
            return;
          }
          logger.log('error', e.message);
        });

      // Keep memory low on this
      if (messagesStack.length > 1024) {
        messagesStack.shift();
      }

      if (sendAck) {
        this.channel.ack(msg, false);
      }
    }, { noAck: false });
  }
}
