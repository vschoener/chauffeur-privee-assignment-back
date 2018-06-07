// @flow
import { expect } from 'chai';

import common from '../../../common';
import {Ride, RideStatus} from '../../../../src/api/v1/ride/ride.model';
import { RideService } from '../../../../src/api/v1/ride/ride.service';
import type {
  PayloadRideComplete,
  PayloadRideCreate,
  PayloadSignUp
} from '../../../../src/rabbitMQ/eventsConsumer';
import { RiderService } from '../../../../src/api/v1/rider/rider.service';
import { Rider } from '../../../../src/api/v1/rider/rider.model';

const mongodb = common.mongodb;
let ride: typeof Ride;
let rider: typeof Rider;

beforeAll(async () => {
  await mongodb.connect();
  await Ride.remove();
  await Rider.remove();

  const payloadSignUp: PayloadSignUp = {
    id: common.ride.bronze.riderId,
    name: "John",
  };
  rider = await RiderService.processNewRider(payloadSignUp);
});

afterAll(async () => {
  await mongodb.disconnect();
});

// Add some tests but not everything is covered
describe('Ride process', () => {
  it('should create a new ride', async () => {
    const payloadRideCreate: PayloadRideCreate = {
      rider_id: rider.riderId,
      id: common.ride.bronze.id,
      amount: common.ride.bronze.amount,
    };
    ride = await RideService.processNewRide(payloadRideCreate);
    // Would like to test id too but Long type makes things complicated.
    //expect(rider.riderId).equal(payloadSignUp.id);
    expect(ride.amount).equal(payloadRideCreate.amount);
  });

  it('should trying to create the same ride', async () => {
    const payloadRideCreate: PayloadRideCreate = {
      rider_id: rider.riderId,
      id: common.ride.bronze.id,
      amount: common.ride.bronze.amount,
    };

    try {
      ride = await RideService.processNewRide(payloadRideCreate);
    } catch(e) {
      expect(true);
      return;
    }
    throw new Error('Ride didn\'t exists');
  });

  it('should complete the ride', async () => {
    const payload: PayloadRideComplete = {
      id: common.ride.bronze.id,
      amount: common.ride.bronze.id,
      rider_id: rider.riderId,
    };
    ride = await RideService.processCompleteRide(payload);
    expect(ride.status).equal(RideStatus.COMPLETED);
  });
});
