/// @flow
import { RiderModel } from '../rider/rider.model';
import { RideModel } from '../ride/ride.model';

export const LOYALTY_STATUS = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
};

export interface Rule {
  status: string;
  min: number;
  max: number;
  multiplier: number;
}

// Contains loyalty rules
export const loyaltyRules: Array<Rule> = [
  {
    status: LOYALTY_STATUS.BRONZE,
    min: 0,
    max: 20,
    multiplier: 1,
  },
  {
    status: LOYALTY_STATUS.SILVER,
    min: 20,
    max: 50,
    multiplier: 3,
  },
  {
    status: LOYALTY_STATUS.GOLD,
    min: 50,
    max: 100,
    multiplier: 5,
  },
  {
    status: LOYALTY_STATUS.PLATINUM,
    min: 100,
    max: 0,
    multiplier: 10,
  },
];

/**
 * Loyalty class
 */
export class LoyaltyService {
  /**
   * Process a new completed ride
   * @param rider
   * @param ride
   * @returns {Promise<void>}
   */
  static async processNewRideComplete(rider: RiderModel, ride: RideModel): Promise<void> {
    rider.totalRideCompleted += 1;
    rider.loyaltyStatus = LoyaltyService.getTotalRideStatus(rider.totalRideCompleted);

    await rider.save();

    ride.loyaltyPointEarned = LoyaltyService.getPointEarned(ride, rider.loyaltyStatus);
    await ride.save();
  }

  /**
   * Get point earned for a ride
   * @param ride
   * @param status
   * @returns {number}
   */
  static getPointEarned(ride: RideModel, status: string) {
    const rule: Rule = LoyaltyService.getRuleFromStatus(status);

    return rule.multiplier * ride.amount;
  }

  /**
   * Get the loyalty rule from the status
   * @param status
   * @returns {Promise<Rule|Rule | undefined>}
   */
  static getRuleFromStatus(status: string): any {
    return loyaltyRules.find((rule: Rule) => rule.status === status);
  }

  /**
   * Get Status from total ride
   * @param totalRide
   * @returns {string}
   */
  static getTotalRideStatus(totalRide: number): string {
    const rule: Rule = LoyaltyService.getTotalRideRule(totalRide);
    return rule.status;
  }

  /**
   * Get Rule from total ride value
   * @param totalRide
   * TODO: Find out how to type hint this return with .find()
   * @returns {Rule}
   */
  static getTotalRideRule(totalRide: number): any {
    return loyaltyRules.find((rule: Rule) => {
      return rule.min <= totalRide && (rule.max ? totalRide < rule.max :  true);
    });
  }
}
