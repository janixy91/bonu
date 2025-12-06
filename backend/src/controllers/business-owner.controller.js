import Business from '../models/Business.model.js';

/**
 * GET /business-owner/my-business
 * Get current user's business configuration
 */
export const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id })
      .populate('ownerId', 'name email');
    
    if (!business) {
      return res.status(404).json({ error: 'No business found for this user' });
    }

    res.json({ business });
  } catch (error) {
    console.error('Get my business error:', error);
    res.status(500).json({ error: 'Failed to get business' });
  }
};

/**
 * PATCH /business-owner/my-business
 * Update current user's business configuration
 * Body: { name?, description?, logoUrl? }
 */
export const updateMyBusiness = async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;

    const business = await Business.findOne({ ownerId: req.user._id });
    
    if (!business) {
      return res.status(404).json({ error: 'No business found for this user' });
    }

    // Update fields
    if (name !== undefined) business.name = name;
    if (description !== undefined) business.description = description;
    if (logoUrl !== undefined) business.logoUrl = logoUrl;

    await business.save();

    const updatedBusiness = await Business.findById(business._id)
      .populate('ownerId', 'name email');

    res.json({
      message: 'Business updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Update my business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
};

