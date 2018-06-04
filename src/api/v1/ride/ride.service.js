/**
 * RideService manage everything about ride
 */
import { Ride, RideStatus } from './ride.model';
import { Rider } from '../rider/rider.model';
import { RiderService } from '../rider/rider.service';
import type { PayloadRideCreate } from '../../../rabbitMQ/eventsConsumer';

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
      throw new Error(`Ride ${data.id} can't be created, rider ${data.rider_id} doesn't exist`);
    }

    const existingRide = await RideService.getRideFromId(data.id);
    if (existingRide) {
      throw new Error(`Ride ${data.id} already exists`);
    }

    const lastRide = await RideService.getLastRideFromRider(rider.riderId);
    if (lastRide && lastRide.status === RideStatus.CREATED) {
      throw new Error(`The ride ${lastRide.rideId} is already running, you can't start a new one`);
    }

    if (data.amount <= 0) {
      throw new Error(`Amount ${data.amount} must be positive`);
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
