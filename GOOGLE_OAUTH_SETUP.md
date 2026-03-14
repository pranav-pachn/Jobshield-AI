# Google OAuth Setup Guide

This guide explains how to configure Google OAuth authentication for JobShield AI.

## Prerequisites

1. Google Cloud Console account
2. Node.js and npm installed
3. MongoDB running (for user storage)

## Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add the following authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy the Client ID and Client Secret

## Step 2: Environment Configuration

Create a `.env` file in the project root and add:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Backend
PORT=4000
MONGODB_URI=mongodb://localhost:27017/jobshield_ai
AI_SERVICE_URL=http://localhost:8000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# JWT
JWT_SECRET=your-jwt-secret-here

# AI Service
AI_SERVICE_PORT=8000
MODEL_NAME=distilbert-base-uncased
```

## Step 3: Install Dependencies

### Frontend
```bash
cd frontend
npm install next-auth
```

### Backend
```bash
cd backend
npm install express-session passport passport-google-oauth20 google-auth-library
npm install --save-dev @types/express-session @types/passport @types/passport-google-oauth20 @types/jsonwebtoken
```

## Step 4: Start the Services

1. Start MongoDB
2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Step 5: Test Google Authentication

1. Navigate to `http://localhost:3000/login`
2. Click the "Google" sign-in button
3. Complete the Google OAuth flow
4. You should be redirected to the dashboard

## How It Works

### Backend Flow
1. User clicks "Google" button → Redirects to `/api/auth/google`
2. Google authenticates user → Redirects to `/api/auth/google/callback`
3. Backend creates/updates user in MongoDB
4. Backend generates JWT token
5. Backend redirects to frontend with token and user data

### Frontend Flow
1. Login page detects token and user in URL params
2. Frontend calls `loginWithGoogle()` method
3. AuthContext saves token and user data
4. User is redirected to dashboard

## User Schema

The Google OAuth integration creates users with the following schema:

```typescript
{
  email: string;           // From Google
  name?: string;          // From Google
  avatar?: string;        // Google profile picture
  googleId?: string;      // Google user ID
  isVerified: boolean;    // true for Google users
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Notes

- Always use HTTPS in production
- Store secrets securely (don't commit to git)
- Set appropriate cookie security settings
- Validate user data from Google
- Implement rate limiting on auth endpoints

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Check that the redirect URI in Google Console matches exactly
   - Ensure the port number is correct

2. **"Invalid client" error**
   - Verify the Client ID and Client Secret are correct
   - Check that the OAuth app is enabled

3. **MongoDB connection errors**
   - Ensure MongoDB is running
   - Check the MONGODB_URI connection string

4. **Frontend not redirecting after Google auth**
   - Check that NEXTAUTH_URL matches your frontend URL
   - Verify the callback URL handling in the login page

### Debug Mode

To enable debug logging, set:
```env
DEBUG=passport:*
```

## Production Deployment

1. Update all URLs to use HTTPS
2. Set secure cookie flags:
   ```javascript
   cookie: { 
     secure: true,
     sameSite: 'strict'
   }
   ```
3. Use environment-specific configuration
4. Set up proper CORS origins
5. Enable rate limiting and security headers
