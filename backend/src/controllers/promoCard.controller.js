import PromoCard from '../models/PromoCard.model.js';
import Business from '../models/Business.model.js';

/**
 * POST /promo-cards
 * Create a new promo card
 * Body: { businessId, title, description, type, limit?, benefitType, expiresAt? }
 */
export const createPromoCard = async (req, res) => {
  try {
    const { businessId, title, description, type, limit, benefitType, expiresAt } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!businessId || !title || !type || !benefitType) {
      return res.status(400).json({ error: 'businessId, title, type, and benefitType are required' });
    }

    // Validate type
    if (!['unlimited', 'limited'].includes(type)) {
      return res.status(400).json({ error: 'type must be "unlimited" or "limited"' });
    }

    // Validate limit for limited cards
    if (type === 'limited') {
      if (!limit || limit <= 0) {
        return res.status(400).json({ error: 'limit must be a positive number for limited cards' });
      }
    }

    // Verify business exists and user owns it
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership (business owner or admin)
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to create cards for this business' });
    }

    // Create promo card
    const promoCard = new PromoCard({
      businessId,
      title,
      description: description || '',
      type,
      limit: type === 'limited' ? limit : null,
      remaining: type === 'limited' ? limit : null,
      benefitType,
      expiresAt: expiresAt || null,
      active: true,
      soldOut: false,
      isDeleted: false,
    });

    await promoCard.save();

    const populatedCard = await PromoCard.findById(promoCard._id)
      .populate('businessId', 'name');

    res.status(201).json({
      message: 'Promo card created successfully',
      card: populatedCard,
    });
  } catch (error) {
    console.error('Create promo card error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create promo card' });
  }
};

/**
 * GET /promo-cards?businessId=xxx
 * Get all promo cards for a business
 */
export const getPromoCards = async (req, res) => {
  try {
    const { businessId } = req.query;
    const userId = req.user._id;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId query parameter is required' });
    }

    // Verify business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership (business owner or admin)
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view cards for this business' });
    }

    // Get all cards (including inactive and deleted)
    const cards = await PromoCard.find({
      businessId,
      isDeleted: false,
    })
      .populate('businessId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      cards,
      total: cards.length,
      active: cards.filter((c) => c.active && !c.soldOut).length,
      inactive: cards.filter((c) => !c.active).length,
      soldOut: cards.filter((c) => c.soldOut).length,
    });
  } catch (error) {
    console.error('Get promo cards error:', error);
    res.status(500).json({ error: 'Failed to get promo cards' });
  }
};

/**
 * GET /promo-cards/:id
 * Get a specific promo card with statistics
 */
export const getPromoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const card = await PromoCard.findById(id).populate('businessId', 'name email');
    
    if (!card) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Check ownership
    const business = await Business.findById(card.businessId._id);
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this card' });
    }

    // Get statistics
    const Code = (await import('../models/Code.model.js')).default;
    const totalCodes = await Code.countDocuments({ promoCardId: card._id });
    const usedCodes = await Code.countDocuments({ promoCardId: card._id, used: true });
    const unusedCodes = totalCodes - usedCodes;
    
    const percentageUsed = totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0;
    const percentageRemaining = card.type === 'limited' && card.limit > 0
      ? Math.round((card.remaining / card.limit) * 100)
      : null;

    res.json({
      card,
      statistics: {
        totalCodes,
        usedCodes,
        unusedCodes,
        percentageUsed,
        remaining: card.remaining,
        percentageRemaining,
      },
    });
  } catch (error) {
    console.error('Get promo card error:', error);
    res.status(500).json({ error: 'Failed to get promo card' });
  }
};

/**
 * PUT /promo-cards/:id
 * Update a promo card
 */
export const updatePromoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, benefitType, expiresAt, limit } = req.body;
    const userId = req.user._id;

    const card = await PromoCard.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Check ownership
    const business = await Business.findById(card.businessId);
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this card' });
    }

    // Update fields
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (benefitType !== undefined) card.benefitType = benefitType;
    if (expiresAt !== undefined) card.expiresAt = expiresAt || null;

    // Update limit for limited cards
    if (card.type === 'limited' && limit !== undefined) {
      if (limit <= 0) {
        return res.status(400).json({ error: 'limit must be a positive number' });
      }
      const difference = limit - card.limit;
      card.limit = limit;
      // Adjust remaining proportionally or keep current if it's less than new limit
      if (difference > 0) {
        card.remaining = Math.min(card.remaining + difference, limit);
      } else {
        card.remaining = Math.min(card.remaining, limit);
      }
      // Reset soldOut if we increased the limit
      if (card.remaining > 0) {
        card.soldOut = false;
        card.active = true;
      }
    }

    await card.save();

    const updatedCard = await PromoCard.findById(card._id)
      .populate('businessId', 'name');

    res.json({
      message: 'Promo card updated successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Update promo card error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update promo card' });
  }
};

/**
 * PATCH /promo-cards/:id/activate
 * Activate or deactivate a promo card
 */
export const togglePromoCardActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const userId = req.user._id;

    const card = await PromoCard.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Check ownership
    const business = await Business.findById(card.businessId);
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to modify this card' });
    }

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    card.active = active;
    await card.save();

    res.json({
      message: `Promo card ${active ? 'activated' : 'deactivated'} successfully`,
      card,
    });
  } catch (error) {
    console.error('Toggle promo card active error:', error);
    res.status(500).json({ error: 'Failed to toggle promo card active status' });
  }
};

/**
 * PATCH /promo-cards/:id/add-stock
 * Add stock to a limited promo card
 */
export const addStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const card = await PromoCard.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Check ownership
    const business = await Business.findById(card.businessId);
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to modify this card' });
    }

    // Only allow for limited cards
    if (card.type !== 'limited') {
      return res.status(400).json({ error: 'Can only add stock to limited cards' });
    }

    // Add stock atomically
    const updatedCard = await PromoCard.findByIdAndUpdate(
      id,
      {
        $inc: { remaining: amount },
        $set: { soldOut: false, active: true },
      },
      { new: true }
    ).populate('businessId', 'name');

    res.json({
      message: `Added ${amount} units to stock`,
      card: updatedCard,
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
};

/**
 * DELETE /promo-cards/:id
 * Soft delete a promo card
 */
export const deletePromoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const card = await PromoCard.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Check ownership
    const business = await Business.findById(card.businessId);
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this card' });
    }

    // Soft delete
    card.isDeleted = true;
    card.active = false;
    await card.save();

    res.json({
      message: 'Promo card deleted successfully',
    });
  } catch (error) {
    console.error('Delete promo card error:', error);
    res.status(500).json({ error: 'Failed to delete promo card' });
  }
};

