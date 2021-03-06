// @flow

/**
 * RideService manage everything about ride
 */
import { Ride, RideStatus } from './ride.model';
import { Rider } from '../rider/rider.model';
import { RiderService } from '../rider/rider.service';
import type { PayloadRideComplete, PayloadRideCreate } from '../../../rabbitMQ/eventsConsumer';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MessageError } from '../../../rabbitMQ/messageError';

// TODO: Implement a Payload Validator before sending the data to mongo
// Or using `validator` on mongo ?

/**
 * Manage needs about Rider
 */
export class RideService {
  /**
   * Create ride
   * @param data
   * @returns {Promise<?Ride>}
   */
  static async processNewRide(data: PayloadRideCreate): Promise<Ride> {
    const rider: Rider = await RiderService.getRiderFromRiderId(data.rider_id);
    if (!rider) {
      throw MessageError.getRequeueError(
        `Ride ${data.id} can't be created, rider ${data.rider_id} doesn't exist`,
        'warn',
      );
    }

    const existingRide: Ride = await RideService.getRideFromId(data.id);
    if (existingRide) {
      throw new MessageError(`Ride ${data.id} already exists`);
    }

    const lastRide: Ride = await RideService.getLastRideFromRider(rider.riderId);
    if (lastRide) {
      // In real world, user can't create 2 ride while the last is still running (CREATE)
      // Besides, we already check concurrent request in less than 1 seconds.
      // Let's assume it's a real world case and user must finish a ride before having a new one
      if (lastRide.status === RideStatus.CREATED) {
        // If message are not disordered, we should not requeue.
        // throw new MessageError(`The ride ${lastRide.rideId} is already running, you can't start a new one`);
        // Otherwise requeue
        throw new MessageError(`The ride ${lastRide.rideId} is already running, you can't start a new one`);
      }
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
    const ride: Ride = await RideService.getRideFromId(data.id);
    if (!ride) {
      throw MessageError.getRequeueError(`Ride ${data.id} doesn't exist`, 'warn');
    }

    if (parseInt(ride.riderId, 10) !== parseInt(data.rider_id, 10)) {
      throw new MessageError('Riders don\'t match');
    }

    if (ride.status === RideStatus.COMPLETED) {
      throw new MessageError('Ride is already completed');
    }

    ride.status = RideStatus.COMPLETED;
    // I'm not sure if the amount change (estimation when created ?)
    ride.amount = data.amount;
    await ride.save();

    // Leave our service manage this task
    const rider: Rider = await RiderService.getRiderFromRiderId(ride.riderId);
    await LoyaltyService.processNewRideComplete(rider, ride);

    return ride;
  }

  /**
   * Get last rider ride
   * @param riderId
   * @returns {Promise<Ride>}
   */
  static async getLastRideFromRider(riderId: number): Promise<?Ride> {
    return Ride.findOne({ riderId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get Ride from its original id
   * @param rideId
   * @returns {Promise<Rider>}
   */
  static async getRideFromId(rideId: string): Promise<?Ride> {
    return Ride.findOne({ rideId }).exec();
  }
}
