# NeighborHub Development Setup

This guide will help you set up the NeighborHub application for development.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

## Installation Steps

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install-deps
```

This will install dependencies for the root, frontend, and backend.

### 2. Environment Setup

#### Backend Environment (.env)

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/neighbor-hub
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Frontend Environment (.env)

Create a `.env` file in the `frontend` directory:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 3. Database Setup

#### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and update `MONGODB_URI` in your backend `.env`

#### Seed Sample Data

To populate your database with sample data:

```bash
cd backend
node seedData.js
```

This creates:

- Sample neighborhood
- Test users with different roles
- Forum posts
- Marketplace listings
- Safety reports

### 4. Cloudinary Setup (Optional)

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Create an upload preset for unsigned uploads
4. Update your environment variables

### 5. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 3000) concurrently.

Or start them individually:

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

## Test Accounts

After running the seed script, you can use these test accounts:

- **Admin**: john.smith@example.com / password123
- **User**: sarah.johnson@example.com / password123
- **User**: mike.rodriguez@example.com / password123
- **Moderator**: lisa.chen@example.com / password123

## Development URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## Available Scripts

From the root directory:

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-deps` - Install all dependencies

From the backend directory:

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seedData.js` - Populate database with sample data

From the frontend directory:

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Structure

```
neighbor-hub/
├── frontend/          # React application
│   ├── public/        # Static files
│   ├── src/          # Source code
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── ...
├── backend/           # Express.js API
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── ...
└── ...
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Check your MONGODB_URI in the backend .env file
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify database credentials

2. **CORS Errors**

   - Ensure the frontend is running on port 3000
   - Check that the backend CORS configuration allows the frontend URL

3. **Authentication Issues**

   - Verify JWT_SECRET is set in backend .env
   - Check that tokens are being sent in Authorization headers

4. **Module Not Found Errors**
   - Run `npm run install-deps` to install all dependencies
   - Clear node_modules and reinstall if needed

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both servers are running
5. Review the API endpoints in the browser developer tools

## Next Steps

Once you have the basic setup running:

1. Explore the existing functionality
2. Review the API documentation in the route files
3. Look at the React components and contexts
4. Try creating posts, listings, and safety reports
5. Test the real-time features with Socket.io

Happy coding! 🏘️
