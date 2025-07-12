const pool = require('../config/db');

exports.findByMobile = (mobile) => {
  return pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobile]);
};

exports.create = (mobile) => {
  return pool.query('INSERT INTO users (mobile_number) VALUES ($1) RETURNING *', [mobile]);
};

exports.setOTP = (otp, expiry, mobile) => {
  return pool.query(
    'UPDATE users SET otp = $1, otp_expiry = $2 WHERE mobile_number = $3',
    [otp, expiry, mobile]
  );
};

exports.clearOTP = (mobile) => {
  return pool.query(
    'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE mobile_number = $1',
    [mobile]
  );
};

exports.updatePassword = (userId, hashedPassword) => {
  return pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
};
