# NeighborHub - Vercel Deployment Guide

## Prerequisites

- MongoDB Atlas database (already configured)
- Cloudinary account (already configured)
- Vercel account

## Environment Variables Required

### Backend (.env)

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (handled automatically via .env.production)

- REACT_APP_API_URL=/api
- REACT_APP_SOCKET_URL="" (uses same domain in production)
- REACT_APP_CLOUDINARY_CLOUD_NAME=drjws4gkf
- REACT_APP_CLOUDINARY_UPLOAD_PRESET=neighbor-hub-uploads

## Deployment Steps

1. **Connect Repository to Vercel**

   - Import project from GitHub in Vercel dashboard
   - Select "neighbor-hub" repository

2. **Configure Environment Variables**

   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all backend environment variables listed above

3. **Deploy**
   - Vercel will automatically detect the vercel.json configuration
   - Backend API will be available at `/api/*` endpoints
   - Frontend will be served at the root domain

## Project Structure

```
neighbor-hub/
├── frontend/           # React app (builds to static files)
├── backend/           # Express API server (serverless functions)
├── vercel.json        # Vercel deployment configuration
└── README.md
```

## Features Deployed

- ✅ User authentication and registration
- ✅ Real-time messaging with Socket.io
- ✅ Forum posts and comments
- ✅ Marketplace listings
- ✅ Safety reports
- ✅ Image uploads via Cloudinary
- ✅ Security features (rate limiting, input sanitization)

## Post-Deployment

1. Test all API endpoints
2. Verify Socket.io real-time features
3. Test image uploads
4. Confirm database connectivity

The app is production-ready with enterprise-level security and performance optimizations.
