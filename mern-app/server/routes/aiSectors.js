const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const AiSector = require('../models/AiSector');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'ai-sector-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   GET /api/ai-sectors
// @desc    Get all AI sectors (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    console.log('GET /api/ai-sectors - Query params:', req.query);
    console.log('GET /api/ai-sectors - Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    let query = {};
    
    // Public only sees published sectors
    if (!req.headers.authorization) {
      console.log('No auth header - setting status to published only');
      query.status = 'published';
    } else if (status) {
      // Handle comma-separated status values
      const statusValues = status.split(',');
      console.log('Status values:', statusValues);
      if (statusValues.length > 1) {
        query.status = { $in: statusValues };
      } else {
        query.status = status;
      }
    } else {
      // Authenticated but no status specified - show all
      console.log('Auth header present but no status - showing all');
    }

    console.log('Final query:', JSON.stringify(query));

    const sectors = await AiSector.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AiSector.countDocuments(query);

    console.log(`Found ${sectors.length} AI sectors out of ${total} total`);

    res.json({
      success: true,
      data: sectors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get AI sectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ai-sectors/:id
// @desc    Get single AI sector
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const sector = await AiSector.findById(req.params.id);
    
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'AI Sector not found'
      });
    }

    // Non-authenticated users can only see published sectors
    if (!req.headers.authorization && sector.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'AI Sector not found'
      });
    }

    res.json({
      success: true,
      data: sector
    });
  } catch (error) {
    console.error('Get AI sector error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'AI Sector not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/ai-sectors
// @desc    Create new AI sector
// @access  Private (admin only)
router.post('/', protect, authorize('admin', 'editor'), upload.single('thumbnail'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const sectorData = { ...req.body };
    
    // Handle thumbnail upload
    if (req.file) {
      sectorData.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Handle tags - convert comma-separated string to array
    if (typeof sectorData.tags === 'string') {
      sectorData.tags = sectorData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Handle images array - convert comma-separated string to array
    if (typeof sectorData.images === 'string') {
      sectorData.images = sectorData.images.split(',').map(img => img.trim()).filter(img => img);
    }

    // Handle boolean fields
    if (typeof sectorData.featured === 'string') {
      sectorData.featured = sectorData.featured === 'true';
    }

    // Handle numeric fields
    if (typeof sectorData.order === 'string') {
      sectorData.order = parseInt(sectorData.order) || 0;
    }

    const sector = new AiSector(sectorData);
    await sector.save();

    res.status(201).json({
      success: true,
      data: sector,
      message: 'AI Sector created successfully'
    });
  } catch (error) {
    console.error('Create AI sector error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating AI sector'
    });
  }
});

// @route   PUT /api/ai-sectors/:id
// @desc    Update AI sector
// @access  Private (admin only)
router.put('/:id', protect, authorize('admin', 'editor'), upload.single('thumbnail'), async (req, res) => {
  try {
    const sectorData = { ...req.body };
    
    // Handle thumbnail upload
    if (req.file) {
      sectorData.thumbnail = `/uploads/${req.file.filename}`;
      
      // Delete old thumbnail if exists
      const oldSector = await AiSector.findById(req.params.id);
      if (oldSector && oldSector.thumbnail) {
        const oldPath = path.join(__dirname, '..', oldSector.thumbnail);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Handle tags - convert comma-separated string to array
    if (typeof sectorData.tags === 'string') {
      sectorData.tags = sectorData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Handle images array - convert comma-separated string to array
    if (typeof sectorData.images === 'string') {
      sectorData.images = sectorData.images.split(',').map(img => img.trim()).filter(img => img);
    }

    // Handle boolean fields
    if (typeof sectorData.featured === 'string') {
      sectorData.featured = sectorData.featured === 'true';
    }

    // Handle numeric fields
    if (typeof sectorData.order === 'string') {
      sectorData.order = parseInt(sectorData.order) || 0;
    }

    const sector = await AiSector.findByIdAndUpdate(
      req.params.id,
      sectorData,
      { new: true, runValidators: true }
    );

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'AI Sector not found'
      });
    }

    res.json({
      success: true,
      data: sector,
      message: 'AI Sector updated successfully'
    });
  } catch (error) {
    console.error('Update AI sector error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating AI sector'
    });
  }
});

// @route   DELETE /api/ai-sectors/:id
// @desc    Delete AI sector
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const sector = await AiSector.findById(req.params.id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'AI Sector not found'
      });
    }

    // Delete thumbnail file
    if (sector.thumbnail) {
      const imagePath = path.join(__dirname, '..', sector.thumbnail);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await sector.deleteOne();

    res.json({
      success: true,
      message: 'AI Sector deleted successfully'
    });
  } catch (error) {
    console.error('Delete AI sector error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting AI sector'
    });
  }
});

// @route   POST /api/ai-sectors/upload
// @desc    Upload AI sector image
// @access  Private (admin only)
router.post('/upload', protect, authorize('admin', 'editor'), upload.single('thumbnail'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading image'
    });
  }
});

// @route   PUT /api/ai-sectors/reorder
// @desc    Reorder AI sectors
// @access  Private (admin only)
router.put('/reorder', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Orders must be an array'
      });
    }

    const bulkOps = orders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));

    await AiSector.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'AI Sectors reordered successfully'
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering AI sectors'
    });
  }
});

module.exports = router;
