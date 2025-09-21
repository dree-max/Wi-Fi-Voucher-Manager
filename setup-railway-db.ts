#!/usr/bin/env node
import { createConnection } from 'mysql2/promise';

// Railway connection string (public)
const RAILWAY_URL = 'mysql://root:XabfeomvkLFJvnTUiJLEbgRItrDwNjGX@turntable.proxy.rlwy.net:23949/railway';

async function setupRailwayDatabase() {
  console.log('🚂 Setting up Railway MySQL Database...\n');

  try {
    // Connect to Railway MySQL
    console.log('📡 Connecting to Railway MySQL...');
    const connection = await createConnection(RAILWAY_URL);
    console.log('✅ Connected to Railway MySQL successfully!');

    // Create the wifi_voucher_db database
    console.log('\n🏗️  Creating wifi_voucher_db database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS wifi_voucher_db');
    console.log('✅ Database wifi_voucher_db created successfully!');

    // Switch to the new database
    await connection.execute('USE wifi_voucher_db');
    console.log('✅ Switched to wifi_voucher_db database');

    // Show existing tables (should be empty for new database)
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('📋 Found existing tables:');
      tables.forEach((table: any) => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('ℹ️  No tables found (this is normal for a new database)');
    }

    await connection.end();
    console.log('\n🎉 Railway database setup completed successfully!');
    
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env file with the new connection string');
    console.log('   2. Run "npm run db:push" to create the schema');
    console.log('   3. Test the connection');
    console.log('   4. Deploy to Vercel');

  } catch (error) {
    console.error('❌ Railway database setup failed!');
    console.error('Error details:', error);
    process.exit(1);
  }
}

setupRailwayDatabase();
