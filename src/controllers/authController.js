
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP } = require('../utils/helpers');

// Signup
exports.signup = async (req, res) => {
  const { mobileNumber } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobileNumber]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await pool.query(
      'INSERT INTO users (mobile_number) VALUES ($1) RETURNING *',
      [mobileNumber]
    );

    res.status(201).json({ message: 'User registered. Please verify with OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  const { mobileNumber } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobileNumber]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP(); // generate a 6-digit OTP
    const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);

    await pool.query(
      'UPDATE users SET otp = $1, otp_expiry = $2 WHERE mobile_number = $3',
      [otp, otpExpiry, mobileNumber]
    );

    // In a real app, you’d send OTP via SMS
    res.status(200).json({ message: 'OTP sent successfully', otp }); // returning OTP for testing
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobileNumber]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const storedOTP = user.rows[0].otp;
    const otpExpiry = user.rows[0].otp_expiry;

    if (storedOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    await pool.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE mobile_number = $1', [mobileNumber]);

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot Password (same as sendOTP)
exports.forgotPassword = async (req, res) => {
  const { mobileNumber } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobileNumber]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);

    await pool.query(
      'UPDATE users SET otp = $1, otp_expiry = $2 WHERE mobile_number = $3',
      [otp, otpExpiry, mobileNumber]
    );

    res.status(200).json({ message: 'OTP sent for password reset', otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // from auth middleware

  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];

    // If password already exists, verify currentPassword
    if (userData.password) {
      const valid = await bcrypt.compare(currentPassword, userData.password);
      if (!valid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
