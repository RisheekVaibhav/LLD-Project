require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

const problems = [
  {
    title: 'Design a Parking Lot',
    slug: 'parking-lot',
    description: 'Design a parking lot system that supports multiple levels, different vehicle types (motorcycle, car, bus), and tracks available spots in real time.',
    requirements: [
      'Support multiple parking levels, each with multiple spots',
      'Support different vehicle types with different spot size requirements',
      'Assign the nearest available valid spot to an entering vehicle',
      'Track and free up a spot when a vehicle exits',
      'Calculate parking fee based on duration',
    ],
    difficulty: 'Medium',
  },
  {
    title: 'Design an Elevator System',
    slug: 'elevator-system',
    description: 'Design the control system for a bank of elevators in a building, handling requests efficiently.',
    requirements: [
      'Support multiple elevators serving multiple floors',
      'Handle both external (floor button) and internal (cabin button) requests',
      'Decide which elevator should serve a given request',
      'Handle simultaneous requests from multiple floors',
      'Support direction (up/down) state for each elevator',
    ],
    difficulty: 'Hard',
  },
  {
    title: 'Design a Vending Machine',
    slug: 'vending-machine',
    description: 'Design a vending machine that accepts payment, dispenses products, and manages inventory and change.',
    requirements: [
      'Support multiple product slots with different prices and stock counts',
      'Accept payment (assume coins/notes as simple units)',
      'Dispense the selected product and correct change',
      'Handle insufficient payment or out-of-stock cases',
      'Support restocking of inventory',
    ],
    difficulty: 'Easy',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Problem.deleteMany({});
    await Problem.insertMany(problems);
    console.log('Seeded 3 problems');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();