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
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KisanSetu API is running 🌾', timestamp: new Date() });
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
