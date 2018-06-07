// @flow
import { expect } from 'chai';

import common from '../../../common';
import { Ride } from '../../../../src/api/v1/ride/ride.model';
import { RideService } from '../../../../src/api/v1/ride/ride.service';
import type {
  PayloadRideCreate,
  PayloadSignUp
} from '../../../../src/rabbitMQ/eventsConsumer';
import { RiderService } from '../../../../src/api/v1/rider/rider.service';
import { Rider } from '../../../../src/api/v1/rider/rider.model';
import { LoyaltyService, LOYALTY_STATUS} from '../../../../src/api/v1/loyalty/loyalty.service';
import type { Rule } from '../../../../src/api/v1/loyalty/loyalty.service';

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

  const payloadRideCreate: PayloadRideCreate = {
    rider_id: rider.riderId,
    id: common.ride.bronze.id,
    amount: common.ride.bronze.amount,
  };
  ride = await RideService.processNewRide(payloadRideCreate);
});

afterAll(async () => {
  await mongodb.disconnect();
});

// Add some tests but not everything is covered
describe('Loyalty computing', () => {
  it('should return the status Bronze for 0 < totalRide < 20', async () => {
    expect(LoyaltyService.getTotalRideStatus(10)).equal(LOYALTY_STATUS.BRONZE);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.BRONZE);
    expect(rule.status).equal(LOYALTY_STATUS.BRONZE);
  });

  it('should return the status Silver for 20 < totalRide < 50', async () => {
    expect(LoyaltyService.getTotalRideStatus(35)).equal(LOYALTY_STATUS.SILVER);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.SILVER);
    expect(rule.status).equal(LOYALTY_STATUS.SILVER);
  });

  it('should return the status Silver for 50 < totalRide < 100', async () => {
    expect(LoyaltyService.getTotalRideStatus(75)).equal(LOYALTY_STATUS.GOLD);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.GOLD);
    expect(rule.status).equal(LOYALTY_STATUS.GOLD);
  });

  it('should return the status Silver for 50 < totalRide < 100', async () => {
    expect(LoyaltyService.getTotalRideStatus(100)).equal(LOYALTY_STATUS.PLATINUM);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.PLATINUM);
    expect(rule.status).equal(LOYALTY_STATUS.PLATINUM);
  });

  it('should calculate the right point earned for Bronze user', async () => {
    const point = LoyaltyService.getPointEarned(ride, LOYALTY_STATUS.BRONZE);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.BRONZE);
    expect(point).equal(ride.amount * rule.multiplier);
  });

  it('should calculate the right point earned for Silver user', async () => {
    const point = LoyaltyService.getPointEarned(ride, LOYALTY_STATUS.SILVER);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.SILVER);
    expect(point).equal(ride.amount * rule.multiplier);
  });

  it('should calculate the right point earned for GOLD user', async () => {
    const point = LoyaltyService.getPointEarned(ride, LOYALTY_STATUS.GOLD);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.GOLD);
    expect(point).equal(ride.amount * rule.multiplier);
  });

  it('should calculate the right point earned for GOLD user', async () => {
    const point = LoyaltyService.getPointEarned(ride, LOYALTY_STATUS.PLATINUM);
    const rule: Rule = LoyaltyService.getRuleFromStatus(LOYALTY_STATUS.PLATINUM);
    expect(point).equal(ride.amount * rule.multiplier);
  });

  it('should process the loyalty when ride complete', async () => {
    await LoyaltyService.processNewRideComplete(rider, ride);
    expect(ride.loyaltyPointEarned).equal(100);
    expect(rider.loyaltyStatus).equal(LOYALTY_STATUS.BRONZE);
    expect(rider.totalRideCompleted).equal(1);
  });

  it('should change the loyalty status', async () => {
    rider.totalRideCompleted = 24;
    await LoyaltyService.processNewRideComplete(rider, ride);
    expect(ride.loyaltyPointEarned).equal(300);
    expect(rider.loyaltyStatus).equal(LOYALTY_STATUS.SILVER);
    expect(rider.totalRideCompleted).equal(25);
  });
});
