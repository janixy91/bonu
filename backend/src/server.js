import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import businessRoutes from './routes/business.routes.js';
import cardRoutes from './routes/card.routes.js';
import historyRoutes from './routes/history.routes.js';
import otpRoutes from './routes/otp.routes.js';
import stampRoutes from './routes/stamp.routes.js';
import adminRoutes from './routes/admin.routes.js';
import businessOwnerRoutes from './routes/business-owner.routes.js';
import codeRoutes from './routes/code.routes.js';
import promoCardRoutes from './routes/promoCard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/stamps', stampRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business-owner', businessOwnerRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/promo-cards', promoCardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BONU API is running' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bonu')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

