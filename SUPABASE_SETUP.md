# Supabase Database Setup Guide

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Node.js 16+ installed on your system

## Step 1: Create Supabase Project

### 1.1 Create New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `wifi-voucher-manager`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Connection Details
After project creation, go to **Settings** → **Database**:
- Copy the **Connection string** (URI)
- Copy the **API URL** and **anon key** (if needed for direct Supabase client)

## Step 2: Environment Configuration

### 2.1 Local Development
Create/update your `.env` file:

```env
# Supabase Database URL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 2.2 Production (Vercel)
In Vercel dashboard, add environment variables:
- **`DATABASE_URL`**: Your Supabase connection string
- **`NODE_ENV`**: `production`

## Step 3: Install Dependencies

```bash
# Install new dependencies
npm install @supabase/supabase-js postgres

# Remove old MySQL dependencies (optional cleanup)
npm uninstall mysql2
```

## Step 4: Database Migration

### 4.1 Generate Migration Files
```bash
npm run db:push
```

This will:
- Connect to your Supabase PostgreSQL database
- Create all the required tables based on the schema
- Set up indexes and relationships

### 4.2 Verify in Supabase Dashboard
After running the migration, check your Supabase dashboard → **Table Editor**:

You should see these tables:
- `analytics_data`
- `portal_settings`
- `sessions`
- `system_settings`
- `user_sessions`
- `users`
- `voucher_plans`
- `vouchers`

## Step 5: Seed Initial Data (Optional)

```bash
# Run the seeding script to populate with sample data
npx tsx server/seed.ts
```

This will create:
- Sample voucher plans (Basic, Premium, etc.)
- Test voucher codes
- Sample analytics data

## Step 6: Start the Application

```bash
# Start in development mode
npm run dev
```

The application will be available at:
- **Admin Panel**: http://localhost:5000/admin/login
- **Customer Portal**: http://localhost:5000/

## Database Connection Details

### Connection Format
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Supabase Features Available
- **Real-time subscriptions**: Built-in real-time capabilities
- **Row Level Security**: Advanced security policies
- **Edge Functions**: Serverless functions
- **Storage**: File storage capabilities
- **Auth**: Built-in authentication system

## Troubleshooting

### Connection Issues

1. **SSL Required**: Supabase requires SSL connections
   - Ensure `ssl: 'require'` is set in connection options

2. **Connection String Format**
   - Use the full PostgreSQL connection string from Supabase
   - Make sure password is URL-encoded if it contains special characters

3. **Database Not Found**
   - Supabase creates the `postgres` database by default
   - No need to create additional databases

### Common Supabase Commands

**Check Tables:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Check Table Structure:**
```sql
\d vouchers
\d voucher_plans
```

**View Sample Data:**
```sql
SELECT * FROM voucher_plans;
SELECT * FROM vouchers LIMIT 10;
```

## Development Workflow

1. **Make Schema Changes**: Edit `shared/schema.ts`
2. **Apply Changes**: Run `npm run db:push`
3. **Verify in Supabase**: Check tables in Supabase dashboard
4. **Test**: Run the application and verify functionality

## Production Considerations

1. **Connection Pooling**: Supabase handles connection pooling automatically
2. **SSL**: SSL is required and handled automatically
3. **Backup**: Supabase provides automatic backups
4. **Monitoring**: Use Supabase dashboard for performance monitoring

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database access
3. **Enable Row Level Security** for production use
4. **Regular updates** of dependencies
5. **Monitor API usage** in Supabase dashboard

## Migration from Railway MySQL

If migrating from Railway MySQL:
1. Export any existing data from Railway
2. Set up Supabase project
3. Run database migrations
4. Import data (if needed)
5. Update environment variables
6. Test thoroughly before switching production
