import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Code from '../models/Code.model.js';
import Business from '../models/Business.model.js';
import { generateUniqueCode } from '../utils/code.utils.js';

dotenv.config();

/**
 * Seed script to generate example codes
 * Usage: node src/scripts/seedCodes.js
 */
const seedCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bonu');
    console.log('✅ Connected to MongoDB');

    // Get all businesses
    const businesses = await Business.find();
    
    if (businesses.length === 0) {
      console.log('⚠️  No businesses found. Please create businesses first.');
      process.exit(1);
    }

    console.log(`📦 Found ${businesses.length} businesses`);

    // Clear existing codes (optional - comment out if you want to keep existing codes)
    // await Code.deleteMany({});
    // console.log('🗑️  Cleared existing codes');

    // Generate codes for each business
    const codesToCreate = [];
    const codesPerBusiness = 5; // Number of codes per business

    for (const business of businesses) {
      for (let i = 0; i < codesPerBusiness; i++) {
        const code = await generateUniqueCode();
        
        // Set expiration date to 30 days from now
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // Different benefit names for variety
        const benefits = [
          'Desayuno completo',
          'Café + Croissant',
          'Café + Pintxo',
          'Desayuno continental',
          'Café + Tostada',
        ];

        codesToCreate.push({
          code,
          businessId: business._id,
          benefitName: benefits[i % benefits.length],
          expirationDate,
          used: false,
          usedAt: null,
        });
      }
    }

    // Insert codes
    const createdCodes = await Code.insertMany(codesToCreate);
    console.log(`✅ Created ${createdCodes.length} codes`);

    // Display summary
    console.log('\n📊 Summary:');
    for (const business of businesses) {
      const businessCodes = createdCodes.filter(
        (c) => c.businessId.toString() === business._id.toString()
      );
      console.log(`  ${business.name}: ${businessCodes.length} codes`);
      businessCodes.forEach((c) => {
        console.log(`    - ${c.code} (${c.benefitName})`);
      });
    }

    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding codes:', error);
    process.exit(1);
  }
};

// Run seed
seedCodes();

