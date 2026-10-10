require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const cropPlanRoutes = require('./routes/cropPlanRoutes');
const mandiRoutes = require('./routes/mandiRoutes');
const yieldRoutes = require('./routes/yieldRoutes');
const schemeRoutes = require('./routes/schemeRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl), localhost, or cloud deployed domains
    if (
      !origin || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') ||
      origin.includes('vercel.app') ||
      origin.includes('onrender.com') ||
      origin.includes('netlify.app')
    ) {
      return callback(null, true);
    }
    const allowedOrigin = process.env.FRONTEND_URL;
    if (allowedOrigin && origin === allowedOrigin) return callback(null, true);
    callback(null, true); // Permissive fallback for production deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root & Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    service: 'KisanSetu API Server 🌾', 
    status: 'Active', 
    health: '/api/health',
    documentation: 'https://github.com/Ashu0378/Kisan-Setu' 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KisanSetu API is running 🌾', buildVersion: 'v1.0.5-no-jwt-expire', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crop-plans', cropPlanRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/yield', yieldRoutes);
app.use('/api/schemes', schemeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 KisanSetu Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
