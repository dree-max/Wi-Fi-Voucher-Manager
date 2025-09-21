#!/usr/bin/env node
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function checkTables() {
  console.log('🔍 Checking table structures...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // Check vouchers table structure
    console.log('📋 Vouchers table structure:');
    const [voucherRows] = await connection.execute('DESCRIBE vouchers');
    console.table(voucherRows);
    
    // Check user_sessions table structure
    console.log('\n📋 User_sessions table structure:');
    const [sessionRows] = await connection.execute('DESCRIBE user_sessions');
    console.table(sessionRows);
    
    // Check data counts
    console.log('\n📊 Data counts:');
    const [voucherCount] = await connection.execute('SELECT COUNT(*) as count FROM vouchers');
    const [sessionCount] = await connection.execute('SELECT COUNT(*) as count FROM user_sessions');
    
    console.log(`Vouchers: ${(voucherCount as any)[0].count}`);
    console.log(`User sessions: ${(sessionCount as any)[0].count}`);
    
    // Check existing foreign key constraints
    console.log('\n🔗 Existing foreign key constraints:');
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_SCHEMA = 'wifi_voucher_db' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.table(constraints);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    process.exit(1);
  }
}

checkTables();