const Trainer = require('../models/Trainer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendTrainerActiveEmail } = require('../utils/email');

exports.getTrainerProfile = async (req, res) => {
  try {
    // req.trainer comes from protectTrainer middleware
    res.status(200).json({ success: true, trainer: req.trainer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.trainer._id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    // A trainer can only edit when approved or active
    if (trainer.status !== 'approved' && trainer.status !== 'active') {
      return res.status(403).json({ success: false, message: "You can only edit profile when approved or active" });
    }

    const {
      name, phone, dateOfBirth, gender, city,
      specializations, experience, certifications, bio, languages,
      trainingTypes, pricePerSession, pricePerMonth, availability,
      trialSession, trialPrice
    } = req.body;

    // Optional uploads
    const profilePhotoFile = req.files && req.files['profilePhoto'] ? req.files['profilePhoto'][0] : null;
    if (profilePhotoFile) {
      const profilePhotoUrl = await uploadToCloudinary(profilePhotoFile.buffer, 'trainers/profile');
      trainer.profilePhoto = profilePhotoUrl;
    }

    if (name) trainer.name = name;
    if (phone) trainer.phone = phone;
    if (dateOfBirth) trainer.dateOfBirth = dateOfBirth;
    if (gender) trainer.gender = gender;
    if (city) trainer.city = city;
    if (bio) trainer.bio = bio;
    if (pricePerSession) trainer.pricePerSession = Number(pricePerSession);
    if (pricePerMonth) trainer.pricePerMonth = Number(pricePerMonth);
    if (trialSession !== undefined) trainer.trialSession = trialSession === 'true' || trialSession === true;
    if (trialPrice) trainer.trialPrice = Number(trialPrice);
    if (experience) trainer.experience = Number(experience);

    if (specializations) {
      trainer.specializations = Array.isArray(specializations) ? specializations : JSON.parse(specializations);
    }
    if (certifications) {
      trainer.certifications = Array.isArray(certifications) ? certifications : JSON.parse(certifications);
    }
    if (languages) {
      trainer.languages = Array.isArray(languages) ? languages : JSON.parse(languages);
    }
    if (trainingTypes) {
      trainer.trainingTypes = Array.isArray(trainingTypes) ? trainingTypes : JSON.parse(trainingTypes);
    }
    if (availability) {
      trainer.availability = typeof availability === 'string' ? JSON.parse(availability) : availability;
    }

    // Transition state from approved to active if full profile is completed
    const oldStatus = trainer.status;
    if (oldStatus === 'approved') {
      // Check if required profile setup is complete
      const isProfileComplete = trainer.name && trainer.phone && trainer.city && trainer.bio && 
                                trainer.specializations?.length > 0 && trainer.trainingTypes?.length > 0 && 
                                trainer.pricePerSession > 0;
      if (isProfileComplete) {
        trainer.status = 'active';
        trainer.activatedAt = new Date();
        trainer.statusHistory.push({
          status: 'active',
          changedByRole: 'trainer',
          reason: 'Profile setup completed',
          changedAt: new Date()
        });
        await sendTrainerActiveEmail(trainer.email, trainer.name, trainer.city);
      }
    }

    await trainer.save();
    res.status(200).json({ success: true, message: "Profile updated successfully", trainer });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

exports.getTrainerStatus = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.trainer._id);
    res.status(200).json({
      status: trainer.status,
      message: trainer.status === 'pending' ? "Your application is under review. We'll notify you within 48 hours." :
               trainer.status === 'approved' ? "Congratulations! You are approved. Complete your profile to go live." :
               trainer.status === 'active' ? "Your profile is live! Customers can find you." :
               trainer.status === 'rejected' ? `Application rejected. Reason: ${trainer.rejectionReason}` :
               "Account suspended. Contact support@findgym.com",
      rejectionReason: trainer.rejectionReason,
      reapplyCount: trainer.reapplyCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.reapplyTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.trainer._id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    if (trainer.status !== 'rejected') {
      return res.status(400).json({ success: false, message: "You can only reapply if application is rejected" });
    }

    if (trainer.reapplyCount >= 3) {
      return res.status(400).json({ success: false, message: "Maximum reapply limit of 3 reached." });
    }

    // Upload new documents if provided
    const aadharCardFile = req.files && req.files['aadharCard'] ? req.files['aadharCard'][0] : null;
    const certificatesList = req.files && req.files['certificates'] ? req.files['certificates'] : [];

    if (aadharCardFile) {
      const aadharUrl = await uploadToCloudinary(aadharCardFile.buffer, 'trainers/kyc');
      trainer.kyc.aadharUrl = aadharUrl;
    }
    if (certificatesList.length > 0) {
      const certificateUrls = [];
      for (const cert of certificatesList) {
        const url = await uploadToCloudinary(cert.buffer, 'trainers/certificates');
        certificateUrls.push(url);
      }
      trainer.kyc.certificateUrls = certificateUrls;
    }

    trainer.status = 'pending';
    trainer.reapplyCount += 1;
    trainer.statusHistory.push({
      status: 'pending',
      changedByRole: 'trainer',
      reason: `Reapplication attempt ${trainer.reapplyCount}`,
      changedAt: new Date()
    });

    await trainer.save();
    res.status(200).json({ success: true, message: "Reapplication submitted successfully", newStatus: 'pending' });
  } catch (error) {
    console.error("Reapply error:", error);
    res.status(500).json({ success: false, message: "Reapply failed", error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const trainer = await Trainer.findById(req.trainer._id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    trainer.availability = availability;
    await trainer.save();
    res.status(200).json({ success: true, message: "Availability updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Availability update failed", error: error.message });
  }
};

exports.getTrainerBookings = async (req, res) => {
  try {
    // Mock bookings as backend only holds trainers logic for now, but returning mock structure
    res.status(200).json({
      success: true,
      bookings: [
        { id: "B1", clientName: "Amit Sharma", type: "Home Visit", date: "2026-06-20", time: "Morning", price: 499, status: "Confirmed" },
        { id: "B2", clientName: "Pooja Patil", type: "Online", date: "2026-06-22", time: "Evening", price: 499, status: "Completed" }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrainerEarnings = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      earnings: {
        total: req.trainer.totalEarnings || 0,
        pending: 998,
        monthly: req.trainer.totalEarnings || 0,
        transactions: [
          { id: "TX100", bookingId: "B2", amount: 499, type: "Payout", status: "Completed", date: "2026-06-15" }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
