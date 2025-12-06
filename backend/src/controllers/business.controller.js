import Business from '../models/Business.model.js';

export const createBusiness = async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      ownerId: req.user._id,
    };

    const business = new Business(businessData);
    await business.save();

    res.status(201).json({
      message: 'Business created successfully',
      business,
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
};

export const listBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate({
        path: 'ownerId',
        select: 'name email',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`📊 Found ${businesses.length} businesses`);
    
    // Log first business to verify fields
    if (businesses.length > 0) {
      console.log('📊 Sample business:', {
        name: businesses[0].name,
        description: businesses[0].description,
        hasDescription: !!businesses[0].description,
      });
    }
    
    // Ensure businesses array is always returned
    const businessesList = businesses || [];
    
    res.json({ businesses: businessesList });
  } catch (error) {
    console.error('List businesses error:', error);
    res.status(500).json({ error: 'Failed to list businesses' });
  }
};

export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('ownerId', 'name email');
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ business });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to get business' });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership
    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this business' });
    }

    Object.assign(business, req.body);
    await business.save();

    res.json({
      message: 'Business updated successfully',
      business,
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership
    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this business' });
    }

    await Business.findByIdAndDelete(req.params.id);

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
};


