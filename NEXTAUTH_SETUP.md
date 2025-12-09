# NextAuth Environment Variables Setup

Your Smart Biofloc Monitoring System uses NextAuth for authentication. You need to add the following environment variables:

## Required Environment Variables

Add these to your `.env.local` file or in the **Vars** section of the v0 in-chat sidebar:

### 1. NEXTAUTH_SECRET
A random secret key used to encrypt JWT tokens and session data.

**Generate a secure secret:**
\`\`\`bash
openssl rand -base64 32
\`\`\`

Or use this online generator: https://generate-secret.vercel.app/32

**Add to .env.local:**
\`\`\`
NEXTAUTH_SECRET=your_generated_secret_here
\`\`\`

### 2. NEXTAUTH_URL (for local development)
The URL where your app is running.

**Add to .env.local:**
\`\`\`
NEXTAUTH_URL=http://localhost:3000
\`\`\`

**For production (after deployment):**
\`\`\`
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

## Complete .env.local Example

\`\`\`env
# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Neon Database (already configured)
DATABASE_URL=your_neon_database_url

# Other integrations...
BLOB_READ_WRITE_TOKEN=your_blob_token
\`\`\`

## Steps to Add Variables in v0:

1. Click the **Settings** icon in the left sidebar
2. Go to the **Vars** section
3. Click **Add Variable**
4. Add `NEXTAUTH_SECRET` with your generated secret
5. Add `NEXTAUTH_URL` with `http://localhost:3000`
6. Save changes
7. Restart the development server

After adding these variables, your authentication should work properly!
