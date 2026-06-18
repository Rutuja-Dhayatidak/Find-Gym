const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  });
};

const sendRegistrationEmail = async (email, name) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Received - Find Gym',
      text: `Thank you for registering as a Gym Owner on Find Gym!\n\nYour registration is under review. We verify all KYC documents within 24-48 hours.\n\nOnce approved, you'll receive a confirmation email and can login to your dashboard.\n\nWhat happens next:\n✓ We review your documents\n✓ You'll receive approval email\n✓ Login and start adding your gyms\n✓ Earn commissions on bookings\n\nFor any questions, contact: support@findgym.com`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Registration email failed:', err);
    return false;
  }
};

const sendGymAddedEmail = async (email, gymName) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Gym Added Successfully',
      text: `Great! Your gym ${gymName} has been added successfully.\n\nStatus: Pending Verification\nOur team will verify your gym details within 24 hours. Once verified, it will appear in the Find Gym app.\n\nMeanwhile, you can:\n✓ Add classes\n✓ Add trainers\n✓ Create membership plans\n✓ Set pricing and policies\n\nDashboard: https://findgym.com/gym-owner-dashboard`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Gym addition email failed:', err);
    return false;
  }
};

const sendAdminNotification = async (name, email, phone, pan) => {
  try {
    const transporter = getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@findgym.com';
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: 'New Gym Owner Registration - Pending Approval',
      text: `New Gym Owner Registration:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPAN: ${pan}\n\nReview at: https://admin.findgym.com/pending-gym-owners`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Admin notification email failed:', err);
    return false;
  }
};

// Trainer Specific Emails
const sendTrainerRegistrationEmail = async (email, name) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Application Received - Find Gym',
      text: `Dear ${name},\n\nYour trainer application has been received. Our team will review your documents within 24-48 hours. We'll notify you by email once a decision has been made.\n\nThank you for choosing Find Gym.`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer registration email failed:', err);
    return false;
  }
};

const sendTrainerApprovalEmail = async (email, name) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Application Approved! - Find Gym',
      text: `Dear ${name},\n\nCongratulations! Your trainer application has been approved. Login to your dashboard and complete your profile setup to go live on Find Gym.\n\nLogin: http://localhost:5173/trainer-login`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer approval email failed:', err);
    return false;
  }
};

const sendTrainerRejectionEmail = async (email, name, reason, reapplyCount) => {
  try {
    const transporter = getTransporter();
    const canReapply = reapplyCount < 3;
    const reapplyText = canReapply 
      ? `You can reapply with corrected information from your dashboard. (Attempts used: ${reapplyCount}/3)`
      : `You have reached the maximum number of registration attempts (3).`;

    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Application Status Update - Find Gym',
      text: `Dear ${name},\n\nUnfortunately, your application was not approved.\nReason: ${reason}\n\n${reapplyText}\n\nFor any appeals or queries, contact: support@findgym.com`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer rejection email failed:', err);
    return false;
  }
};

const sendTrainerActiveEmail = async (email, name, city) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: "You're Live on Find Gym!",
      text: `Dear ${name},\n\nYour profile is now live. Customers in ${city} can find and book you. Check your dashboard to manage bookings.\n\nDashboard: http://localhost:5173/trainer/dashboard`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer activation email failed:', err);
    return false;
  }
};

const sendTrainerBlockEmail = async (email, name, reason) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Suspended - Find Gym',
      text: `Dear ${name},\n\nYour account has been suspended.\nReason: ${reason}\n\nTo appeal this decision, contact: support@findgym.com`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer block email failed:', err);
    return false;
  }
};

const sendTrainerAdminNotification = async (name, city, adminEmail) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: adminEmail || process.env.ADMIN_EMAIL || 'admin@findgym.com',
      subject: 'New Trainer Application - Pending Review',
      text: `A new trainer application from ${name} in ${city} is pending review.\n\nReview at: http://localhost:5174/admin/trainers/pending`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Trainer admin notification email failed:', err);
    return false;
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `Find Gym <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verification Code - Find Gym',
      text: `Your verification OTP is: ${otp}\n\nDo not share this OTP with anyone.\nIt is valid for 10 minutes.`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('OTP email failed:', err);
    return false;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendGymAddedEmail,
  sendAdminNotification,
  sendTrainerRegistrationEmail,
  sendTrainerApprovalEmail,
  sendTrainerRejectionEmail,
  sendTrainerActiveEmail,
  sendTrainerBlockEmail,
  sendTrainerAdminNotification,
  sendOTPEmail
};
