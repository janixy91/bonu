// OTP Service - Generates time-based 5-digit codes valid for 10-15 seconds

// Store active OTPs in memory (in production, consider Redis for distributed systems)
const activeOTPs = new Map();

// OTP validity window: 12 seconds (between 10-15 seconds as requested)
const OTP_VALIDITY_SECONDS = 12;

/**
 * Generate a 5-digit numeric OTP for a user
 * @param {string} userId - User ID
 * @returns {Object} { code: string, validUntil: Date }
 */
export const generateOTP = (userId) => {
  // Generate random 5-digit code (10000-99999)
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  
  const validUntil = new Date(Date.now() + OTP_VALIDITY_SECONDS * 1000);
  
  // Store OTP with user ID and expiration
  activeOTPs.set(userId, {
    code,
    validUntil,
    userId,
  });
  
  return {
    code,
    validUntil,
  };
};

/**
 * Get current valid OTP for a user (generates new one if expired or doesn't exist)
 * @param {string} userId - User ID
 * @returns {Object} { code: string, validUntil: Date }
 */
export const getCurrentOTP = (userId) => {
  const existing = activeOTPs.get(userId);
  
  // Check if existing OTP is still valid
  if (existing && existing.validUntil > new Date()) {
    return {
      code: existing.code,
      validUntil: existing.validUntil,
    };
  }
  
  // Generate new OTP
  return generateOTP(userId);
};

/**
 * Validate an OTP code and return the associated user ID
 * @param {string} code - 5-digit code to validate
 * @returns {string|null} User ID if valid, null otherwise
 */
export const validateOTP = (code) => {
  const now = new Date();
  
  // Find the OTP in the map
  for (const [userId, otpData] of activeOTPs.entries()) {
    // Compare codes as strings
    if (otpData.code === code.toString() && otpData.validUntil > now) {
      // Remove used OTP
      activeOTPs.delete(userId);
      return userId;
    }
  }
  
  return null;
};

/**
 * Clean up expired OTPs (call periodically)
 */
export const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [userId, otpData] of activeOTPs.entries()) {
    if (otpData.validUntil <= now) {
      activeOTPs.delete(userId);
    }
  }
};

// Clean up expired OTPs every minute
setInterval(cleanupExpiredOTPs, 60000);

