// src/utils/helpers.js


// src/utils/helpers.js

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // returns 6-digit OTP
};
