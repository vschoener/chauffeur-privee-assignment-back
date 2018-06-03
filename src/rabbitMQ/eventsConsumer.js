// @flow
export interface EventConsumerInterface {
  consume(data: Object): void
}

export type PayloadRideCreate = {
  id: number;
  amount: number;
  riderId: number;
}

export class RideCreateEvent implements EventConsumerInterface {
  consume(data: PayloadRideCreate) {

  }
}

export type PayloadRideComplete = {
  id: number;
  amount: number;
  riderId: number;
}

export class RideCompletedEvent implements EventConsumerInterface {
  consume(data: PayloadRideComplete) {

  }
}

export type PayloadPhoneUpdate = {
  id: number;
  phone: string;
}

export class RiderPhoneUpdateEvent implements EventConsumerInterface {
  consume(data: PayloadPhoneUpdate) {

  }
}

export type PayloadSignUp = {
  id: number;
  phone: string;
}

export class RiderSignUpEvent implements EventConsumerInterface {
  consume(data: PayloadSignUp) {

  }
}
