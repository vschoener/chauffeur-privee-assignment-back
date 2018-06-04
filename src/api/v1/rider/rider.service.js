/**
 * RiderService manage the rider needs
 */
import { Rider } from './rider.model';
import { PayloadSignUp } from '../../../rabbitMQ/eventsConsumer';

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
      throw new Error('Rider already exists');
    }

    const rider = new Rider({
      riderId: riderData.id,
      name: riderData.name,
    });

    return await rider.save();
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
