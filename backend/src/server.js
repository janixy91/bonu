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
import clienteRoutes from './routes/cliente.routes.js';
import pilotRoutes from './routes/pilot.routes.js';

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
app.use('/api/admin/promo-cards', promoCardRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/pilot', pilotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BONU API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BONU API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      docs: 'API documentation coming soon'
    }
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Connect to DB and start server
connectDB().then(() => {
  startServer();
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;

