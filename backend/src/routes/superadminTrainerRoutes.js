const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');

// GET /api/superadmin/trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json({ trainers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
