const express = require('express');
const router = express.Router();
const GymOwner = require('../models/GymOwner');

// GET /api/superadmin/gym-owners
router.get('/', async (req, res) => {
  try {
    const owners = await GymOwner.find().populate('gyms');
    res.json({ owners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
