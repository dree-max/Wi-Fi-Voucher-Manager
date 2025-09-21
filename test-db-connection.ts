#!/usr/bin/env node
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './shared/schema.js';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

async function testConnection() {
  console.log('🔧 Testing MySQL Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please check your .env file and make sure DATABASE_URL is properly configured.');
    console.log('Example: DATABASE_URL=mysql://username:password@localhost:3306/wifi_voucher_db');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to MySQL database...');
    console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}`);
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection, { schema, mode: 'default' });
    
    console.log('✅ Database connection successful!');
    
    // Test basic query
    console.log('\n🔍 Testing basic database query...');
    const result = await connection.execute('SELECT VERSION() as version, DATABASE() as database_name');
    const [rows] = result;
    const info = Array.isArray(rows) ? rows[0] : rows;
    
    console.log(`✅ MySQL Version: ${(info as any).version}`);
    console.log(`✅ Current Database: ${(info as any).database_name}`);
    
    // Test if tables exist (optional - they might not exist yet)
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('✅ Found existing tables:');
      tables.forEach((table: any) => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('ℹ️  No tables found (this is normal for a new database)');
      console.log('   Run "npm run db:push" to create the schema');
    }
    
    await connection.end();
    console.log('\n🎉 Connection test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run db:push" to create database schema');
    console.log('   2. Run "npx tsx server/seed.ts" to add sample data (optional)');
    console.log('   3. Run "npm run dev" to start the application');
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   • Make sure MySQL server is running');
        console.log('   • Check if MySQL is listening on the correct port (usually 3306)');
        console.log('   • Verify firewall settings');
      } else if (error.message.includes('Access denied')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   • Check your username and password in DATABASE_URL');
        console.log('   • Verify the user has proper privileges');
        console.log('   • Test connection in MySQL Workbench first');
      } else if (error.message.includes('Unknown database')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   • Create the database first: CREATE DATABASE wifi_voucher_db;');
        console.log('   • Make sure the database name in DATABASE_URL matches');
      }
    }
    
    process.exit(1);
  }
}

testConnection();