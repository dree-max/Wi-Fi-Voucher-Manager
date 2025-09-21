import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import { config } from "dotenv";

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection to Supabase PostgreSQL
export const connection = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

export const db = drizzle(connection, { schema, mode: 'default' });