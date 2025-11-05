/**
 * Deep Link Shortener Server
 *
 * Main server file that initializes Express app and all routes
 *
 * @module server
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { connectDatabase } = require('./config/database');
const apiRoutes = require('./routes/api');
const redirectRoutes = require('./routes/redirect');

// Initialize Express app
const app = express();

// ═══════════════════════════════════════════════════════════════
// 🔒 Security Middleware
// ═══════════════════════════════════════════════════════════════

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// ═══════════════════════════════════════════════════════════════
// 🔧 General Middleware
// ═══════════════════════════════════════════════════════════════

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════════════════════════
// 📍 Routes
// ═══════════════════════════════════════════════════════════════

// API routes
app.use('/api', apiRoutes);

// Redirect routes (must be last to catch short codes)
app.use('/', redirectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ═══════════════════════════════════════════════════════════════
// ❌ Error Handling
// ═══════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  });
});

// ═══════════════════════════════════════════════════════════════
// 🚀 Server Startup
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deeplink-shortener';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase(MONGODB_URI);

    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🚀 Deep Link Shortener Server');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('');
      console.log('📝 API Endpoints:');
      console.log(`   POST   http://localhost:${PORT}/api/shorten`);
      console.log(`   GET    http://localhost:${PORT}/api/stats/:shortCode`);
      console.log(`   GET    http://localhost:${PORT}/api/links`);
      console.log(`   GET    http://localhost:${PORT}/:shortCode`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
