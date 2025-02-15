const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error('Recipient email is required');
  }
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
const sendAcceptanceEmail = async ({ to, studentName, groupTitle, creatorName, creatorPhone, creatorEmail }) => {
  const emailHtml = `
    <h2>Congratulations! You've been accepted to the group!</h2>
    <p>Hello ${studentName},</p>
    <p>Your request to join "${groupTitle}" has been accepted.</p>
    <p>Group Creator Details:</p>
    <ul>
      <li>Name: ${creatorName}</li>
      <li>Email: ${creatorEmail}</li>
      <li>Phone: ${creatorPhone}</li>
    </ul>
    <p>Please contact your group creator to discuss further details.</p>
  `;

  await sendEmail({
    to,
    subject: 'Group Request Accepted!',
    html: emailHtml
  });
};


module.exports = { sendEmail, createTransporter , sendAcceptanceEmail};