# Authentication Setup Guide

This guide walks you through setting up authentication for the Poker Trainer app using NextAuth.js with Google OAuth and email/password authentication.

## Prerequisites

- A PostgreSQL database (we use Neon)
- A Google Cloud Console project for OAuth credentials
- Node.js 18+ and npm

## Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy your connection string (PostgreSQL URL)
4. Run the schema to create tables:

```bash
psql $DATABASE_URL -f lib/schema.sql
```

## Step 2: Configure Google OAuth

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the Google+ API
4. Go to "Credentials" → "Create OAuth consent screen"
5. Set up the consent screen with:
   - App name: "Poker Trainer"
   - User type: External
   - Add your email to test users

### Create OAuth 2.0 Credentials

1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Choose "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Copy the Client ID and Client Secret

## Step 3: Set Environment Variables

Create `.env.local` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database_name

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Node Environment
NODE_ENV=development
```

### Generate NEXTAUTH_SECRET

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Database Migrations

The schema is already created via `lib/schema.sql`. If you need to add new tables or columns:

```bash
psql $DATABASE_URL -f lib/schema.sql
```

## Step 6: Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` and test the authentication:

1. Sign up with email/password
2. Try Google OAuth login
3. Test the dashboard

## How Authentication Works

### Email/Password Flow

1. User signs up with email and password
2. Password is hashed using bcryptjs
3. User created in database with `password_hash`
4. NextAuth uses Credentials provider to verify

### Google OAuth Flow

1. User clicks "Continue with Google"
2. Redirected to Google login
3. After Google approval, user data sent to callback
4. Callback checks if user exists in database
5. If not, creates new user
6. Session created with JWT token

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  provider VARCHAR(50),      -- 'credentials' or 'google'
  provider_id VARCHAR(255),  -- Google account ID
  created_at TIMESTAMP
);
```

## Session Management

- Session strategy: JWT (JSON Web Tokens)
- Session max age: 7 days
- Cookie is httpOnly and secure in production
- SameSite set to "lax" for CSRF protection

## Troubleshooting

### "Invalid client ID" error

- Check GOOGLE_CLIENT_ID in .env.local
- Verify Client ID format matches Google Cloud Console
- Ensure redirect URI matches exactly

### "Database connection failed"

- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify schema is created: `psql $DATABASE_URL -c "SELECT * FROM users;"`

### "Session not created after signup"

- Check password_hash is stored correctly
- Verify NextAuth secret is set and consistent
- Clear browser cookies and try again

### Logout not working

- Ensure NEXTAUTH_URL matches your deployment URL
- Check for CORS issues in network tab
- Verify session strategy is 'jwt' in auth-config.ts

## Production Deployment

### Environment Variables

Update for production:

```
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret
NODE_ENV=production
```

### Google OAuth

Update redirect URIs in Google Cloud Console to:
- `https://yourdomain.com/api/auth/callback/google`

### Database

Ensure DATABASE_URL points to production database with proper backups.

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Neon Database Docs](https://neon.tech/docs)
- [Tailwind CSS](https://tailwindcss.com/)
