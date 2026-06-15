const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const GymOwner = require('../models/GymOwner');
const { protectOwner } = require('../middleware/authMiddleware');
const { sendGymAddedEmail } = require('../utils/email');

// All routes here are protected by protectOwner middleware
router.use(protectOwner);

// POST /api/gyms (Add Gym)
router.post('/', async (req, res) => {
  try {
    const { name, description, phone, email, location, capacity, amenities, hours } = req.body;

    // Validation
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Gym name must be between 3 and 100 characters", statusCode: 400 });
    }
    if (!description || description.trim().length < 20 || description.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Description must be between 20 and 1000 characters", statusCode: 400 });
    }
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone number (must be 10 digits)", statusCode: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format", statusCode: 400 });
    }
    if (!location || !location.address || !location.city || !location.state || !location.zipCode) {
      return res.status(400).json({ success: false, message: "Please fill all required location fields", statusCode: 400 });
    }
    if (!capacity || capacity < 20 || capacity > 10000) {
      return res.status(400).json({ success: false, message: "Gym capacity must be between 20 and 10000", statusCode: 400 });
    }
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one amenity", statusCode: 400 });
    }

    const gym = new Gym({
      ownerId: req.owner._id,
      name: name.trim(),
      description: description.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      location: {
        address: location.address.trim(),
        city: location.city.trim(),
        state: location.state.trim(),
        zipCode: location.zipCode.trim(),
        latitude: location.latitude,
        longitude: location.longitude
      },
      hours,
      capacity,
      amenities,
      images: req.body.images || [],
      verified: false,
      active: true
    });

    await gym.save();

    // Add gym reference to owner
    req.owner.gyms.push(gym._id);
    await req.owner.save();

    // Send email
    sendGymAddedEmail(req.owner.email, gym.name);

    res.status(201).json({
      success: true,
      message: "Gym added successfully",
      data: gym,
      statusCode: 201
    });

  } catch (error) {
    console.error("Add gym error:", error);
    res.status(500).json({ success: false, message: "Operation failed", error: error.message, statusCode: 500 });
  }
});

// GET /api/gyms (Get all gyms of authenticated owner)
router.get('/', async (req, res) => {
  try {
    const gyms = await Gym.find({ ownerId: req.owner._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Operation successful",
      data: gyms,
      statusCode: 200
    });
  } catch (error) {
    console.error("List gyms error:", error);
    res.status(500).json({ success: false, message: "Operation failed", error: error.message, statusCode: 500 });
  }
});

// GET /api/gyms/:gymId (Get single gym details)
router.get('/:gymId', async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, ownerId: req.owner._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found", statusCode: 404 });
    }
    res.status(200).json({
      success: true,
      message: "Operation successful",
      data: gym,
      statusCode: 200
    });
  } catch (error) {
    console.error("Get gym error:", error);
    res.status(500).json({ success: false, message: "Operation failed", error: error.message, statusCode: 500 });
  }
});

// PUT /api/gyms/:gymId (Update gym details)
router.put('/:gymId', async (req, res) => {
  try {
    const { name, description, phone, email, location, capacity, amenities, hours } = req.body;

    const gym = await Gym.findOne({ _id: req.params.gymId, ownerId: req.owner._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found", statusCode: 404 });
    }

    // Update fields if provided
    if (name) gym.name = name.trim();
    if (description) gym.description = description.trim();
    if (phone) gym.phone = phone.trim();
    if (email) gym.email = email.toLowerCase().trim();
    if (location) {
      gym.location = {
        ...gym.location,
        ...location
      };
    }
    if (capacity) gym.capacity = capacity;
    if (amenities) gym.amenities = amenities;
    if (hours) gym.hours = hours;
    if (req.body.images) gym.images = req.body.images;

    await gym.save();

    res.status(200).json({
      success: true,
      message: "Operation successful",
      data: gym,
      statusCode: 200
    });
  } catch (error) {
    console.error("Update gym error:", error);
    res.status(500).json({ success: false, message: "Operation failed", error: error.message, statusCode: 500 });
  }
});

// DELETE /api/gyms/:gymId (Delete Gym)
router.delete('/:gymId', async (req, res) => {
  try {
    const gym = await Gym.findOneAndDelete({ _id: req.params.gymId, ownerId: req.owner._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found", statusCode: 404 });
    }

    // Remove reference from owner
    req.owner.gyms = req.owner.gyms.filter(id => id.toString() !== gym._id.toString());
    await req.owner.save();

    res.status(200).json({
      success: true,
      message: "Gym deleted",
      statusCode: 200
    });
  } catch (error) {
    console.error("Delete gym error:", error);
    res.status(500).json({ success: false, message: "Operation failed", error: error.message, statusCode: 500 });
  }
});

module.exports = router;
