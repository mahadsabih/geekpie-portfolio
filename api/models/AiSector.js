const mongoose = require('mongoose');
const slugify = require('slugify');

const aiSectorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 300
  },
  category: {
    type: String,
    required: false,
    enum: ['branding', 'web-design', '3d-design', 'ui-ux', 'motion', 'illustration', 'design', 'mockup', 'other'],
    default: 'branding'
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  client: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  timeline: {
    type: String,
    trim: true
  },
  projectDate: {
    type: Date,
    default: Date.now
  },
  projectUrl: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug before saving
aiSectorSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Update slug on title modification
aiSectorSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  update.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AiSector', aiSectorSchema);
