// @flow

import { RiderService } from '../api/v1/rider/rider.service';
import { RideService } from '../api/v1/ride/ride.service';
import logger from '../logger';

export interface EventConsumerInterface {
  consume(data: Object): Promise<any>
}

export type PayloadRideCreate = {
  id: number;
  amount: number;
  rider_id: number;
}

export class RideCreateEvent implements EventConsumerInterface {
  async consume(data: PayloadRideCreate): Promise<void> {
   const ride = await RideService.processNewRide(data);
   logger.log('info', `New ride created: ${ride._id} from ${ride.rideId}`);
  }
}

export type PayloadRideComplete = {
  id: number;
  amount: number;
  rider_id: number;
}

export class RideCompletedEvent implements EventConsumerInterface {
  consume(data: PayloadRideComplete): Promise<void> {
    return Promise.resolve();
  }
}

export type PayloadPhoneUpdate = {
  id: number;
  phone_number: string;
}

export class RiderPhoneUpdateEvent implements EventConsumerInterface {
  async consume(data: PayloadPhoneUpdate): Promise<void> {
    const rider = await RiderService.updatePhone(data);
    logger.log('info', `Phone ${rider.phoneNumber} has been updated for ${rider.riderId}`);
  }
}

export type PayloadSignUp = {
  id: number;
  name: string;
}

export class RiderSignUpEvent implements EventConsumerInterface {
  async consume(data: PayloadSignUp): Promise<void> {
    const rider = await RiderService.processNewRider(data);
    logger.log('info', `New rider created: ${rider._id} from id '${rider.riderId}'`);
  }
}
