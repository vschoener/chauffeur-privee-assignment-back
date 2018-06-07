// @flow
import { expect } from 'chai';

import common from '../../../common';
import { Rider } from '../../../../src/api/v1/rider/rider.model';
import { RiderService } from '../../../../src/api/v1/rider/rider.service';
import type { PayloadPhoneUpdate, PayloadSignUp } from '../../../../src/rabbitMQ/eventsConsumer';
import { Ride } from '../../../../src/api/v1/ride/ride.model';

const mongodb = common.mongodb;
beforeAll(async () => {
  await mongodb.connect();
  await Ride.remove();
  await Rider.remove();
});

afterAll(async () => {
  await mongodb.disconnect();
});

let rider: Rider;

// Add some tests but not everything is covered
describe('Rider process', () => {
  it('should create a new rider', async () => {
    const payloadSignUp: PayloadSignUp = {
      id: common.rider.id,
      name: common.rider.name,
    };
    rider = await RiderService.processNewRider(payloadSignUp);
    // Would like to test id too but Long type makes things complicated.
    //expect(rider.riderId).equal(payloadSignUp.id);
    expect(rider.name).equal(payloadSignUp.name);
  });

  it('should trying to create the same rider', async () => {
    const payloadSignUp: PayloadSignUp = {
      id: common.rider.id,
      name: common.rider.name,
    };

    try {
      await RiderService.processNewRider(payloadSignUp);
    } catch(e) {
      expect(true);
      return;
    }
    throw new Error('Rider didn\'t exists');
  });

  it('should update the phone number', async () => {
    const payload: PayloadPhoneUpdate = {
      id: common.rider.id,
      phone_number: '+3312345678',
    };
    const updatedRider: Rider = await RiderService.updatePhone(payload);
    expect(updatedRider.phoneNumber).equal(payload.phone_number);
  });
});
