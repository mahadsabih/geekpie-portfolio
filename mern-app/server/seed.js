const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@geekpie.com' });
    console.log('Deleted existing admin user');

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@geekpie.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log('----------------------------');
    console.log('Email: admin@geekpie.com');
    console.log('Password: admin123');
    console.log('----------------------------');

    // Delete existing projects
    await Project.deleteMany({});
    console.log('Deleted existing projects');

    // Create sample projects
    const sampleProjects = [
      {
        title: 'Holographic Earpod with Casing Design',
        description: 'A futuristic earpod design featuring holographic elements and premium casing.',
        category: '3d-design',
        tags: ['3D Design', 'Product Design', 'Futuristic'],
        thumbnail: '/wp-content/uploads/2024/10/image1.webp',
        images: ['/wp-content/uploads/2024/10/image1.webp', '/wp-content/uploads/2024/10/image2.webp'],
        client: 'TechAudio Inc.',
        projectDate: new Date('2024-10-15'),
        projectUrl: 'https://example.com/earpod',
        featured: true,
        status: 'published',
        order: 1
      },
      {
        title: 'Modern 3D Layout for Dribbble Presentation',
        description: 'A stunning 3D layout design created for Dribbble portfolio presentation.',
        category: '3d-design',
        tags: ['3D Design', 'UI/UX', 'Presentation'],
        thumbnail: '/wp-content/uploads/2024/10/image2.webp',
        images: ['/wp-content/uploads/2024/10/image2.webp'],
        client: 'Design Studio Pro',
        projectDate: new Date('2024-11-01'),
        projectUrl: '',
        featured: true,
        status: 'published',
        order: 2
      },
      {
        title: 'Natura Branding',
        description: 'Complete brand identity design for Natura, an eco-friendly skincare company.',
        category: 'branding',
        tags: ['Branding', 'Logo Design', 'Packaging'],
        thumbnail: '/wp-content/uploads/2024/10/image3.webp',
        images: ['/wp-content/uploads/2024/10/image3.webp', '/wp-content/uploads/2024/10/image4.webp'],
        client: 'Natura Skincare',
        projectDate: new Date('2024-09-20'),
        projectUrl: 'https://natura-example.com',
        featured: false,
        status: 'published',
        order: 3
      },
      {
        title: 'Tricity Branding',
        description: 'Urban branding project for a metropolitan development initiative.',
        category: 'branding',
        tags: ['Branding', 'Urban Design', 'Identity'],
        thumbnail: '/wp-content/uploads/2024/10/image4.webp',
        images: ['/wp-content/uploads/2024/10/image4.webp'],
        client: 'Tricity Development Authority',
        projectDate: new Date('2024-08-10'),
        projectUrl: '',
        featured: false,
        status: 'published',
        order: 4
      },
      {
        title: 'Mockup 3D Product Visualization',
        description: 'High-quality 3D product mockups for e-commerce and marketing.',
        category: '3d-design',
        tags: ['3D Design', 'Mockup', 'E-commerce'],
        thumbnail: '/wp-content/uploads/2024/10/image5-scaled.webp',
        images: ['/wp-content/uploads/2024/10/image5-scaled.webp'],
        client: 'Various Clients',
        projectDate: new Date('2024-12-01'),
        projectUrl: '',
        featured: true,
        status: 'published',
        order: 5
      }
    ];

    for (const projectData of sampleProjects) {
      const project = new Project(projectData);
      await project.save();
      console.log(`Created project: ${project.title}`);
    }

    console.log('----------------------------');
    console.log('Database seeding complete!');
    console.log(`Created ${sampleProjects.length} sample projects`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
