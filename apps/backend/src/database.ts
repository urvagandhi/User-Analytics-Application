// apps/backend/src/database.ts

import { MongoClient, Db } from 'mongodb';

import dotenv from 'dotenv';
import path from 'path';

// Load env files from root or local workspace folder
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = (process.env.MONGODB_URI || process.env.MONGO_URI) as string;

if (!uri) {
  throw new Error('Missing MONGODB_URI or MONGO_URI environment variable. Please define it in .env');
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  client = new MongoClient(uri);

  await client.connect();
  return client;
}

/**
 * Retrieve the default database instance from the connection string.
 * If a specific db name is required, extract it from the URI or pass it explicitly.
 */
export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const client = await getMongoClient();
  // The database name can be extracted from the connection string; fallback to "causalfunnel".
  const dbName = client.db().databaseName || 'causalfunnel';
  db = client.db(dbName);
  return db;
}

/**
 * Gracefully close the MongoDB connection (useful for tests or server shutdown).
 */
export async function closeMongoClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
