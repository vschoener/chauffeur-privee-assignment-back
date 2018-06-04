/**
 * RiderService manage the rider needs
 */
import { Rider } from './rider.model';
import { PayloadSignUp } from '../../../rabbitMQ/eventsConsumer';
import type { PayloadPhoneUpdate } from '../../../rabbitMQ/eventsConsumer';

/**
 * Manage needs about Rider
 */
export class RiderService {
  /**
   * Process new rider
   * @param riderData
   * @returns {Promise<Rider>}
   */
  static async processNewRider(riderData: PayloadSignUp): Promise<Rider> {
    const existingRider = await this.getRiderFromRiderId(riderData.id);
    if (existingRider) {
      throw new Error(`Rider ${riderData.id} already exists`);
    }

    const rider = new Rider({
      riderId: riderData.id,
      name: riderData.name,
    });

    return await rider.save();
  }

  /**
   * Update Rider phone number
   * @param riderData
   * @returns {Promise<void>}
   */
  static async updatePhone(riderData: PayloadPhoneUpdate): Promise<Rider> {
    const existingRider = await this.getRiderFromRiderId(riderData.id);
    if (!existingRider) {
      throw new Error(`Rider ${riderData.id} doesn't exists, phone can't be saved`);
    }

    // Update phone only if they're different
    if (existingRider.phoneNumber !== riderData.phone_number) {
      existingRider.phoneNumber = riderData.phone_number;
      await existingRider.save();
    }

    return existingRider;
  }

  /**
   * Get Rider Id from original one
   * @param riderId
   * @returns {Promise<Rider>}
   */
  static async getRiderFromRiderId(riderId: number): Promise<?Rider> {
    return await Rider.findOne({ riderId }).exec();
  }
}
