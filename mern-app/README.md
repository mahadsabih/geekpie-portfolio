# GeekPie Portfolio Admin Dashboard

A full-stack MERN application for managing portfolio projects.

## Features

- **Admin Authentication**: Secure login with JWT tokens
- **Project Management**: Add, edit, delete, and reorder portfolio projects
- **Image Upload**: Drag-and-drop image upload for project thumbnails
- **Rich Text Editor**: Quill-based WYSIWYG editor for project descriptions
- **Categories**: Organize projects by category (Branding, Web Design, 3D Design, UI/UX, Motion, Illustration, Other)
- **Tags**: Add custom tags to projects
- **Featured Projects**: Mark projects as featured
- **Draft/Published Status**: Control project visibility
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

### Frontend
- React 18
- React Router v6
- Axios for API calls
- React Quill for rich text editing
- React Dropzone for file uploads
- Lucide React for icons
- React Toastify for notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

### 1. Install Backend Dependencies

```bash
cd mern-app/server
npm install
```

### 2. Install Frontend Dependencies

```bash
cd mern-app/client
npm install
```

### 3. Configure Environment Variables

The server uses the following environment variables (already configured in `.env`):

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/geekpie-portfolio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
mongod
```

### 5. Create Admin User

Run the seed script to create an initial admin user:

```bash
cd mern-app/server
node seed.js
```

Default credentials:
- **Email**: admin@geekpie.com
- **Password**: admin123

**Important**: Change the password after first login!

## Running the Application

### Start the Backend Server

```bash
cd mern-app/server
npm run dev
```

The server will run on http://localhost:5000

### Start the Frontend

```bash
cd mern-app/client
npm start
```

The React app will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (auth required)
- `PUT /api/projects/:id` - Update project (auth required)
- `DELETE /api/projects/:id` - Delete project (auth required)
- `POST /api/projects/upload` - Upload images (auth required)
- `PUT /api/projects/reorder` - Reorder projects (auth required)

## Project Structure

```
mern-app/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── projects.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/          # Uploaded images
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
└── client/
    ├── public/
    │   ├── index.html
    │   └── images/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js
    │   │   └── Layout.css
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Login.css
    │   │   ├── Dashboard.js
    │   │   ├── Dashboard.css
    │   │   ├── ProjectForm.js
    │   │   └── ProjectForm.css
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Usage

1. **Login**: Access http://localhost:3000/login and use the admin credentials
2. **Dashboard**: View all projects, search, filter by category
3. **Add Project**: Click "Add Project" to create a new portfolio item
4. **Edit Project**: Click the edit icon on any project card
5. **Delete Project**: Click the delete icon (requires confirmation)
6. **Toggle Featured**: Star icon to mark/unmark as featured
7. **Toggle Status**: Eye icon to publish/unpublish

## Production Deployment

1. Update `.env` with production values
2. Change JWT_SECRET to a secure random string
3. Use a production MongoDB instance
4. Build the React app: `npm run build`
5. Serve the build folder with a static server
6. Use HTTPS in production

## License

MIT License
