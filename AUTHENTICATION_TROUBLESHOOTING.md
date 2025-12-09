# Authentication Troubleshooting Guide

## Issue: "After logging in, still showing login page"

### Root Causes:
1. **Environment Variables Not Set**: NEXTAUTH_SECRET and NEXTAUTH_URL are required
2. **Database Not Initialized**: The profiles table doesn't exist yet
3. **Session/Cookie Issues**: Browser cookies might be blocked or session isn't persisting

### Solutions:

#### Step 1: Check Environment Variables
Make sure these are set in v0:
- `NEXTAUTH_SECRET`: Generate at https://generate-secret.vercel.app/32
- `NEXTAUTH_URL`: Set to `http://localhost:3000`

To add in v0:
1. Click sidebar → **Vars**
2. Add both variables
3. Click save

#### Step 2: Initialize Database
The signup page now auto-initializes the database, but you can manually trigger it:
- Visit: `/api/auth/init-db` in your browser
- Should see: "Database initialized successfully!"

#### Step 3: Clear Browser Data
Sometimes old cookies cause issues:
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Delete all cookies for localhost:3000
4. Try logging in again

#### Step 4: Check Console Logs
Look for `[v0]` prefixed messages in the browser console:
- Should see "Login successful, redirecting..." after login
- Should see "User query result: User found" during auth
- Should see "Session callback - creating session"

### Common Error Messages:

**"Invalid email or password"**
- User doesn't exist in database
- Password doesn't match
- Try creating a new account first

**"Database setup incomplete"**
- Run `/api/auth/init-db`
- Or wait for signup page to auto-initialize

**"Missing closing }" CSS error**
- Fixed in latest version
- Hard refresh the page (Ctrl+Shift+R)

### Testing Authentication:

1. **Create Account**:
   - Go to `/auth/signup`
   - Fill in: Full Name, Email, Password
   - Should redirect to login with success message

2. **Login**:
   - Enter same email/password
   - Should redirect to `/user/dashboard`
   - Should see navigation bar with Dashboard, Biofloc Monitor, Disease Detection

3. **Session Persistence**:
   - Refresh the page
   - Should still be logged in
   - If not, check NEXTAUTH_SECRET is set

### Debug Mode:

The authentication system now includes debug logging. Check your browser console for detailed information about the authentication flow.
