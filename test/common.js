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
      amount: 100,
      loyaltyExpect: 100,
    },
    silver: {
      amount: 10,
      loyaltyExpect: 30,
    }
  }
}
