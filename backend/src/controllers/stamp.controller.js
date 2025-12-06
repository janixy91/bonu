import Card from '../models/Card.model.js';
import Business from '../models/Business.model.js';
import StampHistory from '../models/StampHistory.model.js';
import { validateOTP } from '../services/otp.service.js';

/**
 * POST /stamps/validate
 * Validate a 5-digit code and add a stamp to the customer's card
 * Body: { code: string, businessId?: string }
 * If businessId is provided, adds stamp to that business's card
 * Otherwise, finds the business owned by the logged-in user and adds stamp to that card
 */
export const validateStampCode = async (req, res) => {
  try {
    const { code, businessId } = req.body;
    
    if (!code || typeof code !== 'string' || code.length !== 5) {
      return res.status(400).json({ error: 'Invalid code format. Code must be 5 digits' });
    }
    
    // Validate OTP and get user ID
    const userId = validateOTP(code);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    
    // Determine which business to add stamp for
    let targetBusinessId = businessId;
    
    if (!targetBusinessId) {
      // Find business owned by the logged-in employee
      const business = await Business.findOne({ ownerId: req.user._id });
      if (!business) {
        return res.status(400).json({ error: 'No business found for this employee. Please specify businessId.' });
      }
      targetBusinessId = business._id;
    }
    
    // Find the customer's card for this business
    const card = await Card.findOne({ userId, businessId: targetBusinessId }).populate('businessId');
    
    if (!card) {
      return res.status(404).json({ error: 'No card found for this customer and business' });
    }
    
    const business = card.businessId;
    
    if (card.currentStamps >= business.totalStamps) {
      return res.status(400).json({ error: 'Card is already full' });
    }
    
    // Add stamp
    card.currentStamps += 1;
    await card.save();
    
    // Create history entry
    await StampHistory.create({
      userId: card.userId,
      cardId: card._id,
      businessId: card.businessId._id,
      action: 'stamp',
    });
    
    const updatedCard = await Card.findById(card._id)
      .populate('businessId')
      .populate('userId', 'name email');
    
    res.json({
      message: 'Stamp added successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Validate stamp code error:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
};

