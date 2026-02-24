const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const aiSectorRoutes = require('./routes/aiSectors');
const contactRoutes = require('./routes/contact');
const generateStaticSite = require('./generate-static');

const app = express();

// CORS configuration - allow multiple origins for flexibility
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  // Add your production domain
  'https://geekpie.com',
  'https://www.geekpie.com',
  // Vercel preview URLs
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (at root level)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes - Note: Vercel strips /api prefix, so routes are relative
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/ai-sectors', aiSectorRoutes);
app.use('/', contactRoutes); // Contact routes at /contact and /newsletter

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GeekPie Portfolio API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      projects: '/projects',
      aiSectors: '/ai-sectors',
      contact: '/contact',
      newsletter: '/newsletter',
      health: '/health'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate static site endpoint
app.post('/generate-static', async (req, res) => {
  try {
    const result = await generateStaticSite();
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Successfully generated ${result.projectsGenerated} portfolio pages` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!' 
  });
});

// ============================================
// MongoDB Connection for Vercel Serverless
// ============================================

// Cache the MongoDB connection to reuse across serverless invocations
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedDb.readyState === 1) {
    return cachedDb;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  cachedDb = connection.connection;
  console.log('Connected to MongoDB');
  return cachedDb;
}

// ============================================
// Export for Vercel Serverless Functions
// ============================================

// For Vercel serverless, we need to handle each request
// and ensure database connection is established
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// Local Development Server
// ============================================

// Only listen if running directly (not in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}
