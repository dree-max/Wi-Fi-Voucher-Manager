import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
import * as schema from "@shared/schema";
import { config } from "dotenv";

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse the database URL to get connection details
const dbUrl = new URL(process.env.DATABASE_URL);
const dbName = dbUrl.pathname.slice(1); // Remove leading slash

// Create connection to Railway MySQL
export const connection = mysql.createConnection({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbName,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(connection, { schema, mode: 'default' });