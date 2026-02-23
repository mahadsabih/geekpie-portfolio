const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
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
    cb(null, 'project-' + uniqueSuffix + ext);
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

// @route   GET /api/projects
// @desc    Get all projects (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, featured, status, limit = 20, page = 1 } = req.query;
    
    console.log('GET /api/projects - Query params:', req.query);
    console.log('GET /api/projects - Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    let query = {};
    
    // Public only sees published projects
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
    
    if (category) {
      query.category = category;
    }
    
    if (featured) {
      query.featured = featured === 'true';
    }

    console.log('Final query:', JSON.stringify(query));

    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments(query);

    console.log(`Found ${projects.length} projects out of ${total} total`);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/debug/all
// @desc    Debug endpoint to get all projects without filters
// @access  Public (for debugging)
router.get('/debug/all', async (req, res) => {
  try {
    const allProjects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`Debug: Total projects in DB: ${allProjects.length}`);
    allProjects.forEach(p => {
      console.log(`  - ${p.title} | status: ${p.status} | _id: ${p._id}`);
    });
    res.json({
      success: true,
      count: allProjects.length,
      data: allProjects
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Non-authenticated users can only see published projects
    if (!req.headers.authorization && project.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (admin only)
router.post('/', protect, authorize('admin', 'editor'), upload.single('thumbnail'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['branding', 'web-design', '3d-design', 'ui-ux', 'motion', 'illustration', 'design', 'mockup', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const projectData = { ...req.body };
    
    // Handle thumbnail upload
    if (req.file) {
      projectData.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Parse tags if sent as string
    if (typeof projectData.tags === 'string') {
      try {
        projectData.tags = JSON.parse(projectData.tags);
      } catch {
        projectData.tags = projectData.tags.split(',').map(tag => tag.trim());
      }
    }

    // Parse images if sent as string
    if (typeof projectData.images === 'string') {
      try {
        projectData.images = JSON.parse(projectData.images);
      } catch {
        projectData.images = [];
      }
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (admin only)
router.put('/:id', protect, authorize('admin', 'editor'), upload.single('thumbnail'), async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    // Handle thumbnail upload
    if (req.file) {
      projectData.thumbnail = `/uploads/${req.file.filename}`;
      
      // Delete old thumbnail if exists
      const oldProject = await Project.findById(req.params.id);
      if (oldProject && oldProject.thumbnail) {
        const oldPath = path.join(__dirname, '..', oldProject.thumbnail);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Parse tags if sent as string
    if (typeof projectData.tags === 'string') {
      try {
        projectData.tags = JSON.parse(projectData.tags);
      } catch {
        projectData.tags = projectData.tags.split(',').map(tag => tag.trim());
      }
    }

    // Parse images if sent as string
    if (typeof projectData.images === 'string') {
      try {
        projectData.images = JSON.parse(projectData.images);
      } catch {
        projectData.images = [];
      }
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      projectData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete thumbnail file
    if (project.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', project.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
});

// @route   POST /api/projects/upload
// @desc    Upload additional project images
// @access  Private (admin only)
router.post('/upload', protect, authorize('admin', 'editor'), upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      success: true,
      data: imageUrls,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading images'
    });
  }
});

// @route   PUT /api/projects/reorder
// @desc    Reorder projects
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

    await Project.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Projects reordered successfully'
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering projects'
    });
  }
});

module.exports = router;