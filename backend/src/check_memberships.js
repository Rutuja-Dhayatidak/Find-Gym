const mongoose = require('mongoose');
require('dotenv').config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const Membership = require('./models/Membership');
    const User = require('./models/User');

    const memberships = await Membership.find().limit(5);
    console.log("Memberships sample:", JSON.stringify(memberships, null, 2));

    const activeMems = await Membership.find({ status: 'active' });
    console.log("Active memberships count:", activeMems.length);
    console.log("Active memberships sample:", JSON.stringify(activeMems.slice(0, 3), null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

check();
