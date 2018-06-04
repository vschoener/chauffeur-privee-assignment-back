// @flow

import mongoose from 'mongoose';

/**
 * I'm not sure of the best approach here about the the Rider ID
 * if it's better to store it as 'id' and override the ObjectID of Mongo,
 * Or simply create a new riderId
 * But I think we should keep ObjectID information
 * (@see https://docs.mongodb.com/manual/reference/method/ObjectId/)
 */
export const schema: mongoose.Schema = new mongoose.Schema({
  riderId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    require: false,
    //  use validator international method,
  },
});

// Seems redundant but it enforces the type and code completion around our RiderModel
export class RiderModel extends mongoose.Model {
  riderId: number;
  name: string;
  phoneNumber: number;

  // Only an example of what we could do
  get formattedpPoneNumber() {
    return this.phoneNumber;
  }
}

schema.loadClass(RiderModel);

// On Typescript I can use an interface and enforce Model<TypeInterface>
// But there is not flow type on Mongoose 5 :(
export const Rider: typeof RiderModel = mongoose.model('Rider', schema);
