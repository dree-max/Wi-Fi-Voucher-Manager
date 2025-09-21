# MySQL Workbench Integration Setup

## Prerequisites

1. **MySQL Server**: Ensure MySQL Server is installed and running on your local machine
2. **MySQL Workbench**: Have MySQL Workbench installed for database management
3. **Node.js**: Node.js 16+ installed on your system

## Step 1: Database Setup in MySQL Workbench

### 1.1 Create Database
```sql
CREATE DATABASE wifi_voucher_db;
```

### 1.2 Create User (Optional but recommended)
```sql
-- Create a dedicated user for the application
CREATE USER 'wifi_admin'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON wifi_voucher_db.* TO 'wifi_admin'@'localhost';
FLUSH PRIVILEGES;
```

### 1.3 Update Connection String
Edit the `.env` file in your project root with your MySQL connection details:

```env
# For root user (not recommended for production)
DATABASE_URL=mysql://root:your_root_password@localhost:3306/wifi_voucher_db

# For dedicated user (recommended)
DATABASE_URL=mysql://wifi_admin:your_secure_password@localhost:3306/wifi_voucher_db
```

## Step 2: Install Dependencies

```bash
# Install MySQL2 driver (already done if you followed the conversion)
npm install mysql2

# Install all dependencies
npm install
```

## Step 3: Database Migration

### 3.1 Generate Migration Files
```bash
npm run db:push
```

This will:
- Connect to your MySQL database
- Create all the required tables based on the schema
- Set up indexes and relationships

### 3.2 Verify in MySQL Workbench
After running the migration, refresh your MySQL Workbench and you should see these tables:
- `analytics_data`
- `portal_settings`
- `sessions`
- `system_settings`
- `user_sessions`
- `users`
- `voucher_plans`
- `vouchers`

## Step 4: Seed Initial Data (Optional)

```bash
# Run the seeding script to populate with sample data
npx tsx server/seed.ts
```

This will create:
- Sample voucher plans (Basic, Premium, etc.)
- Test voucher codes
- Sample analytics data

## Step 5: Start the Application

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
mysql://[username]:[password]@[host]:[port]/[database_name]
```

### Common Configurations

**Local Development:**
```
DATABASE_URL=mysql://root:password@localhost:3306/wifi_voucher_db
```

**Local with Custom User:**
```
DATABASE_URL=mysql://wifi_admin:secure_password@localhost:3306/wifi_voucher_db
```

**Custom Port (if MySQL runs on different port):**
```
DATABASE_URL=mysql://username:password@localhost:3307/wifi_voucher_db
```

## Troubleshooting

### Connection Issues

1. **MySQL Server Not Running**
   ```bash
   # Start MySQL service (Windows)
   net start mysql

   # Start MySQL service (macOS with Homebrew)
   brew services start mysql

   # Start MySQL service (Linux)
   sudo systemctl start mysql
   ```

2. **Authentication Issues**
   - Verify username/password in MySQL Workbench
   - Ensure the user has proper privileges
   - Check if MySQL is using the correct authentication plugin

3. **Port Issues**
   - Default MySQL port is 3306
   - Check MySQL configuration for custom port
   - Verify firewall settings

4. **Database Not Found**
   ```sql
   -- Create database if it doesn't exist
   CREATE DATABASE IF NOT EXISTS wifi_voucher_db;
   ```

### Common MySQL Commands

**Check Tables:**
```sql
USE wifi_voucher_db;
SHOW TABLES;
```

**Check Table Structure:**
```sql
DESCRIBE vouchers;
DESCRIBE voucher_plans;
```

**View Sample Data:**
```sql
SELECT * FROM voucher_plans;
SELECT * FROM vouchers LIMIT 10;
```

## Development Workflow

1. **Make Schema Changes**: Edit `shared/schema.ts`
2. **Apply Changes**: Run `npm run db:push`
3. **Verify in Workbench**: Check tables and structure
4. **Test**: Run the application and verify functionality

## Production Considerations

1. **Connection Pooling**: The current setup creates a single connection. For production, consider implementing connection pooling
2. **SSL**: Enable SSL for database connections in production
3. **Backup**: Set up regular database backups
4. **Monitoring**: Implement database performance monitoring

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database users
3. **Limit user privileges** to only what's needed
4. **Enable SSL** for database connections in production
5. **Regular updates** of MySQL server and dependencies