# Authentication Setup with Supabase

This project uses Supabase for authentication with admin and customer portals.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Open `frontend/.env.local` file
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com,admin4@example.com
```

**Important:** Replace the admin emails with the actual email addresses of your 4 admin members.

### 4. Enable Email Auth in Supabase

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Make sure **Email** provider is enabled
3. Configure email templates (optional) under **Authentication** > **Email Templates**

### 5. Test the System

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and go to the frontend URL
3. Click **Sign Up** to create a new account
4. Check your email for verification link
5. Click the link to verify your email
6. Login with your credentials

### Admin Access

- Only users whose emails are in the `VITE_ADMIN_EMAILS` list can access `/admin` portal
- Regular users can access `/products` page
- All users must verify their email before logging in

### Features

✅ **Customer Portal**
- Sign up with email verification
- Login/Logout
- Access to Products page
- View recommendations and graphs

✅ **Admin Portal** (4 authorized members)
- Full dashboard with statistics
- Product management
- User management
- Admin-only access control

### Security Notes

- Never commit `.env.local` to GitHub (it's in `.gitignore`)
- Use environment variables for sensitive data
- Admin emails are checked on frontend, but you can add backend validation for extra security
- Supabase handles email verification automatically

### Troubleshooting

**"Invalid API key" error:**
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Make sure there are no extra spaces

**Can't access admin portal:**
- Verify your email is in the `VITE_ADMIN_EMAILS` list
- Make sure emails are comma-separated with no spaces

**Email not arriving:**
- Check spam folder
- Verify email provider is enabled in Supabase
- Check Supabase logs under **Authentication** > **Logs**

### Next Steps

- Customize email templates in Supabase
- Add password reset functionality
- Add user profile pages
- Implement role-based permissions
