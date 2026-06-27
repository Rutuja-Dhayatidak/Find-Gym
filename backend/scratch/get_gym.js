const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const Gym = require('../src/models/Gym');
    const gym = await Gym.findById("6a3cef838cbfaf582bb207ca");
    console.log('GYM DETAILS:');
    console.log(JSON.stringify(gym, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
