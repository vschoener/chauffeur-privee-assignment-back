/**
 * RideService manage everything about ride
 */
import { Ride, RideStatus } from './ride.model';
import { Rider } from '../rider/rider.model';
import { RiderService } from '../rider/rider.service';
import type { PayloadRideComplete, PayloadRideCreate } from '../../../rabbitMQ/eventsConsumer';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MessageError } from '../../../rabbitMQ/messageError';

/**
 * Manage needs about Rider
 */
export class RideService {
  /**
   * Create ride
   * @param data
   * @returns {Promise<?Ride>}
   */
  static async processNewRide(data: PayloadRideCreate): Promise<?Ride> {
    const rider = await RiderService.getRiderFromRiderId(data.rider_id);
    if (!rider) {
      throw MessageError.getRequeueError(`Ride ${data.id} can't be created, rider ${data.rider_id} doesn't exist`, 'warn');
    }

    const existingRide = await RideService.getRideFromId(data.id);
    if (existingRide) {
      throw new MessageError(`Ride ${data.id} already exists`);
    }

    const lastRide = await RideService.getLastRideFromRider(rider.riderId);
    if (lastRide && lastRide.status === RideStatus.CREATED) {
      throw new MessageError(`The ride ${lastRide.rideId} is already running, you can't start a new one`);
    }

    if (data.amount <= 0) {
      throw new MessageError(`Amount ${data.amount} must be positive`);
    }

    const ride = new Ride({
      rideId: data.id,
      riderId: data.rider_id,
      amount: data.amount,
      status: RideStatus.CREATED,
    });

    return ride.save();
  }

  /**
   * End a running ride
   * @param data
   * @returns {Promise<*>}
   */
  static async processCompleteRide(data: PayloadRideComplete): Promise<?Ride> {
    const ride = await RideService.getRideFromId(data.id);
    if (!ride) {
      throw MessageError.getRequeueError(`Ride ${data.id} doesn't exist`, 'warn');
    }

    // In case there is an issue with the riders
    // Do not compare with extra type as it's a Mongoose.Long <> number
    // Maybe store this one using int32 would resolve this kind of issue :/
    if (ride.riderId != data.rider_id) {
      throw new MessageError(`Riders don't match`);
    }

    if (ride.status === RideStatus.COMPLETED) {
      throw new MessageError('Ride is already completed');
    }

    ride.status = RideStatus.COMPLETED;
    // I'm not sure if the amount change (estimation when created ?)
    ride.amount = data.amount;
    await ride.save();

    // Leave our service manage this task
    const rider = await RiderService.getRiderFromRiderId(ride.riderId);
    await LoyaltyService.processNewRideComplete(rider, ride);

    return ride;
  }

  /**
   * Get last rider ride
   * @param riderId
   * @returns {Promise<*>}
   */
  static async getLastRideFromRider(riderId: number) {
    return await Ride.findOne({ riderId }).sort({ 'dateAdd': -1 }).exec();
  }

  /**
   * Get Ride from its original id
   * @param rideId
   * @returns {Promise<Rider>}
   */
  static async getRideFromId(rideId: string): Promise<?Ride> {
    return await Ride.findOne({ rideId }).exec();
  }
}
