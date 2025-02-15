const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { connectDb } = require('./db.js');
const authRoutes = require('./routes/auth.js');
const groupRoutes = require('./routes/group.js');
require('dotenv').config();
const { createTransporter } = require('./utils/emailService.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
  '127.0.0.1:5173'
));
app.use(express.json());

// Connect to MongoDB
connectDb();

// Email configuration
app.locals.emailTransporter = createTransporter();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});