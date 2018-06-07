import mongodb from './mongodb';

export default {
  mongodb,
  rider: {
    id: 1,
    name: 'John Doe',
    phoneNumber: '+336601223456',
  },
  ride: {
    bronze: {
      id: 1,
      riderId: 2,
      amount: 100,
      loyaltyExpect: 100,
    },
    silver: {
      id: 2,
      riderId: 2,
      amount: 10,
      loyaltyExpect: 30,
    }
  }
}
