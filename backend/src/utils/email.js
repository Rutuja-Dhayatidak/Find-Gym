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

module.exports = {
  sendRegistrationEmail,
  sendGymAddedEmail,
  sendAdminNotification
};
