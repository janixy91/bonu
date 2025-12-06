import { getCurrentOTP } from '../services/otp.service.js';

/**
 * GET /otp/current/:userId
 * Get the current valid OTP code for a user
 */
export const getCurrentOTPCode = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const otp = getCurrentOTP(userId);
    
    res.json({
      code: otp.code,
      validUntil: otp.validUntil,
    });
  } catch (error) {
    console.error('Get OTP error:', error);
    res.status(500).json({ error: 'Failed to get OTP code' });
  }
};

