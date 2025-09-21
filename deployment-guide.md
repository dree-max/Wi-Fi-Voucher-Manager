# 🚀 Vercel Deployment Guide for Wi-Fi Voucher Manager

## Database Connection Strings

### Railway Production Database:
```
mysql://root:XabfeomvkLFJvnTUiJLEbgRItrDwNjGX@turntable.proxy.rlwy.net:23949/railway
```

### For Vercel Deployment:
Use this in Vercel environment variables:
```
DATABASE_URL=mysql://root:XabfeomvkLFJvnTUiJLEbgRItrDwNjGX@turntable.proxy.rlwy.net:23949/wifi_voucher_db
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

- **Protocol**: `mysql://`
- **Username**: `root`
- **Password**: `XabfeomvkLFJvnTUiJLEbgRItrDwNjGX`
- **Host**: `turntable.proxy.rlwy.net`
- **Port**: `23949`
- **Database**: `wifi_voucher_db` (will be created automatically)

## Next Steps After Deployment

1. Access your deployed app
2. The database schema will be created automatically
3. Test the application functionality
4. Monitor Railway dashboard for database activity
