# FixItNow Backend API

A comprehensive backend API for the Smart Complaint & Maintenance Portal built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Complaint Management**: Create, read, update, and delete maintenance complaints
- **File Upload**: Image upload for before/after photos
- **Real-time Status Tracking**: Update complaint status with notes and timestamps
- **Admin Dashboard**: Analytics and user management
- **QR Code Integration**: Location tagging for complaints
- **Role-based Access**: Student, Staff, Maintenance, and Admin roles

## Tech Stack

- **Node.js** (v24.0.2)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js v24.0.2 or higher
- MongoDB installed and running
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FIXITNOW/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env.example` to `config.env`
   - Update the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/fixitnow
     JWT_SECRET=your_jwt_secret_key_here_change_in_production
     NODE_ENV=development
     ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create new complaint |
| GET | `/api/complaints` | Get all complaints (filtered) |
| GET | `/api/complaints/:id` | Get single complaint |
| PATCH | `/api/complaints/:id/status` | Update complaint status |
| PATCH | `/api/complaints/:id/assign` | Assign complaint to staff |
| PATCH | `/api/complaints/:id/resolve` | Resolve complaint |
| POST | `/api/complaints/:id/notes` | Add note to complaint |
| DELETE | `/api/complaints/:id` | Delete complaint (admin only) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/maintenance-staff` | Get maintenance staff |
| POST | `/api/admin/maintenance-staff` | Create maintenance staff |
| PATCH | `/api/admin/users/:id/status` | Update user status |
| GET | `/api/admin/analytics` | Get analytics data |
| GET | `/api/admin/export` | Export complaints data |

## User Roles

1. **Student**: Can submit complaints and view their own complaints
2. **Staff**: Can submit complaints and view their own complaints
3. **Maintenance**: Can view assigned complaints, update status, and resolve issues
4. **Admin**: Full access to all features including user management and analytics

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'staff', 'maintenance', 'admin'],
  studentId: String (required for students),
  department: String (required for staff),
  phone: String,
  isActive: Boolean
}
```

### Complaint Schema
```javascript
{
  title: String,
  description: String,
  category: ['electrical', 'plumbing', 'furniture', 'wifi', 'heating', 'cleaning', 'other'],
  priority: ['low', 'medium', 'high', 'urgent'],
  status: ['pending', 'assigned', 'in_progress', 'resolved', 'closed'],
  location: {
    building: String,
    room: String,
    floor: String,
    qrCode: String
  },
  reportedBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  images: {
    before: Array,
    after: Array
  },
  notes: Array,
  isResolved: Boolean,
  resolutionNotes: String
}
```

## File Upload

The API supports image uploads for complaint photos:

- **Before Photos**: Uploaded when creating a complaint
- **After Photos**: Uploaded when resolving a complaint
- **File Types**: Images only (jpg, png, gif, etc.)
- **File Size**: Maximum 5MB per file
- **Storage**: Local file system in `uploads/` directory

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong JWT secret
3. Configure MongoDB connection with proper authentication
4. Set up proper file storage (consider cloud storage for images)
5. Configure CORS for your frontend domain
6. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 

---

## 1. **Create an Admin User (Recommended: Directly in MongoDB)**

Since the registration form only allows "student" and "staff" roles, you should create an admin user directly in your MongoDB database.

### **Option A: Using MongoDB Compass or Atlas UI**
1. Open your database (`fixitnow`) in MongoDB Compass or Atlas.
2. Go to the `users` collection.
3. Click **Insert Document** and add:
   ```json
   {
     "name": "Admin User",
     "email": "admin@fixitnow.com",
     "password": "<hashed_password>",
     "role": "admin",
     "isActive": true
   }
   ```
   - For the password, you need to hash it using bcrypt. See below for how to generate a hash.

### **Option B: Using the Backend (Node.js Script)**
You can create a quick script to insert an admin user:

1. In your `backend` folder, create a file called `createAdmin.js`:
   ```js
   const mongoose = require('mongoose');
   const bcrypt = require('bcryptjs');
   const User = require('./models/User');
   require('dotenv').config({ path: './config.env' });

   async function createAdmin() {
     await mongoose.connect(process.env.MONGODB_URI);
     const password = await bcrypt.hash('admin123', 10); // Change password as needed
     const admin = new User({
       name: 'Admin User',
       email: 'admin@fixitnow.com',
       password,
       role: 'admin',
       isActive: true
     });
     await admin.save();
     console.log('Admin user created!');
     process.exit();
   }

   createAdmin();
   ```
2. Run the script:
   ```bash
   node createAdmin.js
   ```

---

## 2. **Login as Admin**
- Go to your frontend (`http://localhost:3000/login`)
- Use:
  - **Email:** `admin@fixitnow.com`
  - **Password:** `admin123` (or whatever you set)

---

## 3. **Security Reminder**
- Change the admin password after first login.
- Never share your admin credentials.
- Remove the script after use.

---

**Let me know if you want me to generate the script for you, or if you need help with any of these steps!** 