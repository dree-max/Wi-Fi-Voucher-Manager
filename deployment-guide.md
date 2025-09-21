# 🚀 Vercel Deployment Guide for Wi-Fi Voucher Manager

## Database Connection Strings

### Supabase Production Database:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### For Vercel Deployment:
Use this in Vercel environment variables:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## Deployment Steps

### 1. Push to Git Repository
- Create a GitHub repository
- Push your code to GitHub

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Environment Variables in Vercel
Add these environment variables in Vercel dashboard:
- `DATABASE_URL`: `mysql://root:XabfeomvkLFJvnTUiJLEbgRItrDwNjGX@turntable.proxy.rlwy.net:23949/wifi_voucher_db`
- `NODE_ENV`: `production`

### 4. Database Setup
After deployment, the database will be created automatically when the app runs for the first time.

## Connection String Breakdown

- **Protocol**: `postgresql://`
- **Username**: `postgres`
- **Password**: `[YOUR-SUPABASE-PASSWORD]`
- **Host**: `db.[PROJECT-REF].supabase.co`
- **Port**: `5432`
- **Database**: `postgres` (default Supabase database)

## Next Steps After Deployment

1. Access your deployed app
2. The database schema will be created automatically
3. Test the application functionality
4. Monitor Supabase dashboard for database activity
