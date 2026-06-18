const express = require('express');
const router = express.Router();
const multer = require('multer');
const trainerAuthController = require('../controllers/trainerAuthController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG, JPG, PDF allowed.'));
  }
});

const fields = [
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'certificates', maxCount: 3 }
];

router.post('/register', upload.fields(fields), trainerAuthController.registerTrainer);
router.post('/login', trainerAuthController.loginTrainer);

module.exports = router;
