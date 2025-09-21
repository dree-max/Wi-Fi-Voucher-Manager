#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

async function testConnection() {
  console.log('🔧 Testing Supabase PostgreSQL Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please check your .env file and make sure DATABASE_URL is properly configured.');
    console.log('Example: DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to Supabase PostgreSQL database...');
    console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}`);
    
    const connection = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    const db = drizzle(connection, { schema, mode: 'default' });
    
    console.log('✅ Database connection successful!');
    
    // Test basic query
    console.log('\n🔍 Testing basic database query...');
    const result = await connection`SELECT version() as version, current_database() as database_name`;
    const info = result[0];
    
    console.log(`✅ PostgreSQL Version: ${info.version}`);
    console.log(`✅ Current Database: ${info.database_name}`);
    
    // Test if tables exist (optional - they might not exist yet)
    console.log('\n📋 Checking existing tables...');
    const tables = await connection`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Found existing tables:');
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
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
        console.log('   • Check your Supabase project status');
        console.log('   • Verify the connection string is correct');
        console.log('   • Ensure your IP is whitelisted (if using IP restrictions)');
      } else if (error.message.includes('password authentication failed')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   • Check your password in DATABASE_URL');
        console.log('   • Verify the username is correct (should be "postgres")');
        console.log('   • Test connection in Supabase dashboard first');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   • Use "postgres" as the database name (default Supabase database)');
        console.log('   • Check your project reference in the connection string');
      }
    }
    
    process.exit(1);
  }
}

testConnection();