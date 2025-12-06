import StampHistory from '../models/StampHistory.model.js';

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const history = await StampHistory.find({ userId })
      .populate('businessId', 'name logoUrl')
      .populate('cardId')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

