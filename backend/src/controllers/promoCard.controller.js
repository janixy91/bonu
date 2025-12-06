import PromoCard from '../models/PromoCard.model.js';

/**
 * PATCH /admin/promo-cards/:id/activate
 * Activate or deactivate a promo card (admin only)
 */
export const togglePromoCardActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    promoCard.active = active;
    await promoCard.save();

    res.json({
      message: `Promo card ${active ? 'activated' : 'deactivated'} successfully`,
      promoCard,
    });
  } catch (error) {
    console.error('Toggle promo card active error:', error);
    res.status(500).json({ error: 'Failed to update promo card' });
  }
};

