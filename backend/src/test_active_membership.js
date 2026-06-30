const mongoose = require('mongoose');
require('dotenv').config();

const testActive = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Membership = require('./models/Membership');
    const Gym = require('./models/Gym');

    // Simulate for user '6a3e1e6f9e91a7ce3510d7b8'
    const userId = "6a3e1e6f9e91a7ce3510d7b8";
    
    const activeMem = await Membership.findOne({
      customerId: userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('gymId', 'name location phone email heroImage images');
    
    console.log("Populated Active Membership:", JSON.stringify(activeMem, null, 2));
    
    if (activeMem) {
      const now = new Date();
      const diffTime = Math.abs(new Date(activeMem.endDate) - now);
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log("Days left:", daysLeft);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

testActive();
