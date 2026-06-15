const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GymOwner = require('../models/GymOwner');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendRegistrationEmail, sendAdminNotification } = require('../utils/email');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/auth/gym-owner-register
router.post('/gym-owner-register', upload.fields([
  { name: 'kycDocument', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const ownerName = req.body.ownerName || req.body.name;
    const { email, phone, password, gstNumber } = req.body;

    // Parse bank details (supports nested objects or direct flat fields)
    const bankName = req.body.bankName || (req.body.bankAccount ? req.body.bankAccount.bankName : '');
    const accountNumber = req.body.accountNumber || (req.body.bankAccount ? req.body.bankAccount.accountNumber : '');
    const accountHolderName = req.body.accountHolderName || (req.body.bankAccount ? req.body.bankAccount.accountHolderName : '');
    const ifscCode = req.body.ifscCode || (req.body.bankAccount ? req.body.bankAccount.ifscCode : '');

    // Parse kyc details
    const aadharNumber = req.body.aadharNumber || (req.body.kyc ? req.body.kyc.aadharNumber : '');
    const panNumber = req.body.panNumber || (req.body.kyc ? req.body.kyc.panNumber : '');

    // Validation checks
    if (!ownerName || ownerName.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Name must be at least 3 characters", statusCode: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format", statusCode: 400 });
    }
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone number (must be 10 digits)", statusCode: 400 });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters", statusCode: 400 });
    }
    if (!aadharNumber || aadharNumber.replace(/\D/g, '').length !== 12) {
      return res.status(400).json({ success: false, message: "Invalid Aadhar number (must be 12 digits)", statusCode: 400 });
    }
    if (!panNumber || panNumber.trim().length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid PAN number (must be 10 characters)", statusCode: 400 });
    }
    if (!accountNumber || accountNumber.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Account number must be at least 10 digits", statusCode: 400 });
    }
    if (!ifscCode || ifscCode.trim().length !== 11) {
      return res.status(400).json({ success: false, message: "Invalid IFSC code (must be 11 characters)", statusCode: 400 });
    }

    // Check unique email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered", statusCode: 400 });
    }

    // Check files
    const kycDocFile = req.files && req.files['kycDocument'] ? req.files['kycDocument'][0] : null;
    const bankProofFile = req.files && req.files['bankProof'] ? req.files['bankProof'][0] : null;

    if (!kycDocFile) {
      return res.status(400).json({ success: false, message: "KYC Document file upload is required", statusCode: 400 });
    }
    if (!bankProofFile) {
      return res.status(400).json({ success: false, message: "Bank Proof file upload is required", statusCode: 400 });
    }

    // Upload files to Cloudinary
    let kycDocumentUrl, bankProofUrl;
    try {
      kycDocumentUrl = await uploadToCloudinary(kycDocFile.buffer, 'kyc');
      bankProofUrl = await uploadToCloudinary(bankProofFile.buffer, 'bank_proof');
    } catch (uploadError) {
      return res.status(500).json({ success: false, message: "Document upload failed. Please try again.", statusCode: 500 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Gym Owner
    const gymOwner = new GymOwner({
      name: ownerName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      gstNumber,
      bankAccount: {
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
        verified: false
      },
      kyc: {
        aadharNumber,
        panNumber,
        kycDocumentUrl,
        bankProofUrl,
        verified: false
      }
    });

    await gymOwner.save();

    // Create User record
    const user = new User({
      name: ownerName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'gym_owner',
      gymOwnerId: gymOwner._id
    });

    await user.save();

    // Send emails
    sendRegistrationEmail(gymOwner.email, gymOwner.name);
    sendAdminNotification(gymOwner.name, gymOwner.email, gymOwner.phone, aadharNumber.substring(8), panNumber);

    res.status(200).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      data: {
        gymOwnerId: gymOwner._id,
        status: gymOwner.status
      },
      statusCode: 200
    });

  } catch (error) {
    console.error("Gym owner register error:", error);
    res.status(500).json({ success: false, message: "Registration failed. Please try again.", error: error.message, statusCode: 500 });
  }
});

// POST /api/auth/gym-owner-login
router.post('/gym-owner-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all required fields", statusCode: 400 });
    }

    const gymOwner = await GymOwner.findOne({ email: email.toLowerCase() });
    if (!gymOwner) {
      return res.status(400).json({ success: false, message: "Invalid credentials", statusCode: 400 });
    }

    const isMatch = await bcrypt.compare(password, gymOwner.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials", statusCode: 400 });
    }

    // Generate token
    const token = jwt.sign(
      { id: gymOwner._id, role: 'gym_owner' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Operation successful",
      data: {
        token,
        owner: {
          _id: gymOwner._id,
          name: gymOwner.name,
          email: gymOwner.email,
          status: gymOwner.status
        }
      },
      statusCode: 200
    });
  } catch (error) {
    console.error("Gym owner login error:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again.", error: error.message, statusCode: 500 });
  }
});

module.exports = router;
