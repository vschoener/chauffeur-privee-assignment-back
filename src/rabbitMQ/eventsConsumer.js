// @flow

import { RiderService } from '../api/v1/rider/rider.service';
import logger from '../logger';

export interface EventConsumerInterface {
  consume(data: Object): Promise<any>
}

export type PayloadRideCreate = {
  id: number;
  amount: number;
  riderId: number;
}

export class RideCreateEvent implements EventConsumerInterface {
  consume(data: PayloadRideCreate): Promise<void> {
    return Promise.resolve();
  }
}

export type PayloadRideComplete = {
  id: number;
  amount: number;
  riderId: number;
}

export class RideCompletedEvent implements EventConsumerInterface {
  consume(data: PayloadRideComplete): Promise<void> {
    return Promise.resolve();
  }
}

export type PayloadPhoneUpdate = {
  id: number;
  phone: string;
}

export class RiderPhoneUpdateEvent implements EventConsumerInterface {
  consume(data: PayloadPhoneUpdate): Promise<void> {
    return Promise.resolve();
  }
}

export type PayloadSignUp = {
  id: number;
  name: string;
}

export class RiderSignUpEvent implements EventConsumerInterface {
  async consume(data: PayloadSignUp): Promise<void> {
    try {
      const rider = await RiderService.processNewRider(data);
      logger.log('info', `New Rider saved: ${rider._id} from id '${rider.riderId}'`);
    } catch (e) {
      logger.log('error', e);
    }
  }
}
