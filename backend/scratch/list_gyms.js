const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const Gym = require('../src/models/Gym');
    const gyms = await Gym.find({}, 'name verified active ownerId location.city');
    console.log('GYMS IN DB:');
    console.log(JSON.stringify(gyms, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
