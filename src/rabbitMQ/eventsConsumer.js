// @flow

import md5 from 'md5';
import { RiderService } from '../api/v1/rider/rider.service';
import { RideService } from '../api/v1/ride/ride.service';
import logger from '../logger';
import { RiderModel } from '../api/v1/rider/rider.model';
import { RideModel } from '../api/v1/ride/ride.model';
import { MessageError } from './messageError';

export interface EventConsumerInterface {
  consume(data: Object): Promise<any>
}

export type PayloadRideCreate = {
  id: number;
  amount: number;
  rider_id: number;
}

export class RideCreateEvent implements EventConsumerInterface {
  ridesProcessing: Map<number, Date>;

  constructor() {
    this.ridesProcessing = new Map();
  }

  async consume(data: PayloadRideCreate): Promise<RideModel> {
    const lastRiderRequestDate: ?Date = this.ridesProcessing.get(data.rider_id);

    // If a rider is found, it should means it's a problem (bot / network issue / ddos..)
    const date = new Date();
    if (lastRiderRequestDate) {
      const elapsedTime = date.getTime() - lastRiderRequestDate.getTime();
      if (elapsedTime < 1000) {
        throw new MessageError(`Rider can't ask for a ride as there is one already processing : ${elapsedTime}`);
      }
    }

    this.ridesProcessing.set(data.rider_id, date);
    const ride: RideModel = await RideService.processNewRide(data);
    logger.log('info', `New ride created: ${ride._id} from ${ride.rideId}`);
    this.ridesProcessing.delete(data.rider_id);

    return ride;
  }
}

export type PayloadRideComplete = {
  id: number;
  amount: number;
  rider_id: number;
}

export class RideCompletedEvent implements EventConsumerInterface {
  async consume(data: PayloadRideComplete): Promise<RideModel> {
    const ride: RideModel = await RideService.processCompleteRide(data);
    logger.log('info', `Ride ${ride.rideId} has been completed`);

    return ride;
  }
}

export type PayloadPhoneUpdate = {
  id: number;
  phone_number: string;
}

export class RiderPhoneUpdateEvent implements EventConsumerInterface {
  async consume(data: PayloadPhoneUpdate): Promise<RiderModel> {
    const rider: RiderModel = await RiderService.updatePhone(data);
    logger.log('info', `Phone ${rider.phoneNumber} has been updated for ${rider.riderId}`);

    return rider;
  }
}

export type PayloadSignUp = {
  id: number;
  name: string;
}

export class RiderSignUpEvent implements EventConsumerInterface {
  async consume(data: PayloadSignUp): Promise<RiderModel> {
    const rider: RiderModel = await RiderService.processNewRider(data);
    logger.log('info', `New rider created: ${rider._id} from id '${rider.riderId}'`);

    return rider;
  }
}
