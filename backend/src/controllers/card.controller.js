import Card from '../models/Card.model.js';
import Business from '../models/Business.model.js';
import StampHistory from '../models/StampHistory.model.js';

export const createCard = async (req, res) => {
  try {
    const { businessId } = req.body;
    const userId = req.user._id;

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if card already exists
    const existingCard = await Card.findOne({ userId, businessId });
    if (existingCard) {
      return res.status(400).json({ error: 'Card already exists for this business' });
    }

    // Create card
    const card = new Card({
      userId,
      businessId,
      currentStamps: 0,
      redeemedRewards: [],
    });
    await card.save();

    const populatedCard = await Card.findById(card._id)
      .populate('businessId')
      .populate('userId', 'name email');

    res.status(201).json({
      message: 'Card created successfully',
      card: populatedCard,
    });
  } catch (error) {
    console.error('Create card error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Card already exists' });
    }
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const getUserCards = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const cards = await Card.find({ userId })
      .populate('businessId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ cards });
  } catch (error) {
    console.error('Get user cards error:', error);
    res.status(500).json({ error: 'Failed to get cards' });
  }
};

export const getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .populate('businessId')
      .populate('userId', 'name email');

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ card });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
};

export const addStamp = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId).populate('businessId');

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
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
    console.error('Add stamp error:', error);
    res.status(500).json({ error: 'Failed to add stamp' });
  }
};

export const redeemReward = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId).populate('businessId');

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const business = card.businessId;
    if (card.currentStamps < business.totalStamps) {
      return res.status(400).json({
        error: `You need ${business.totalStamps - card.currentStamps} more stamps to redeem`,
      });
    }

    // Reset stamps and add redemption
    card.currentStamps = 0;
    card.redeemedRewards.push(new Date());
    await card.save();

    // Create history entry
    await StampHistory.create({
      userId: card.userId,
      cardId: card._id,
      businessId: card.businessId._id,
      action: 'redeem',
    });

    const updatedCard = await Card.findById(card._id)
      .populate('businessId')
      .populate('userId', 'name email');

    res.json({
      message: 'Reward redeemed successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
};

