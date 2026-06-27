const mongoose = require('mongoose');
const HealthStoreOrder = require('../models/HealthStoreOrder');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const migrateOrders = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/find_gym';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB for migration.');
    }

    const result = await HealthStoreOrder.updateMany(
      { orderSource: { $exists: false } },
      {
        $set: {
          orderSource: "website",
          customerType: "website_user",
          customerModel: "WebsiteUser"
        }
      }
    );

    console.log(`Migration completed successfully! Modified ${result.modifiedCount} orders.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Only close if we opened the connection here
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  migrateOrders();
}

module.exports = migrateOrders;
