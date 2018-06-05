// @flow

import mongoose from 'mongoose';

export const RideStatus = {
  CREATED: 'CREATED',
  COMPLETED: 'COMPLETED',
  // Real case might have CANCELED for example and help to not count the loyalty point
};

export const schema: mongoose.Schema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.Long,
    required: true,
    unique: true,
  },
  riderId: {
    type: mongoose.Schema.Types.Long,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    require: true,
    default: RideStatus.CREATED,
  },
  dateAdd: {
    type: Date,
    require: true,
    default: Date.now,
  },
  loyaltyPointEarned: {
    type: Number,
    require: false,
    default: 0,
  }
});

export class RideModel extends mongoose.Model {
  rideId: number;
  riderId: number;
  amount: number;
  status: string;
  loyaltyPointEarned: number;
}

schema.loadClass(RideModel);

// On Typescript I can use an interface and enforce Model<TypeInterface>
// But there is not flow type on Mongoose 5 :(
export const Ride: RideModel = mongoose.model('Ride', schema);
