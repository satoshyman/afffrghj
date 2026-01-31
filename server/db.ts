import { MongoClient, Db, Collection } from "mongodb";

export let mongoClient: MongoClient | null = null;
export let db: Db | null = null;

/**
 * Connect to MongoDB using MONGO_URL and optional MONGO_DB_NAME.
 * Also creates required indexes and counters for id generation.
 */
export async function connectMongo() {
  const url = process.env.MONGO_URL || process.env.DATABASE_URL;
  const dbName = process.env.MONGO_DB_NAME || process.env.MONGO_DB || 'frog';

  if (!url) {
    console.warn('⚠️ MONGO_URL (or DATABASE_URL) is not set. The app will start but database operations will fail until set in environment variables.');
    return;
  }

  console.log('🔌 Connecting to MongoDB...');
  mongoClient = new MongoClient(url);
  await mongoClient.connect();
  db = mongoClient.db(dbName);
  console.log('✅ Connected to MongoDB:', db.databaseName);

  await ensureIndexesAndCounters();
}

function getCollection<T>(name: string): Collection<T> {
  if (!db) throw new Error('MongoDB not connected');
  return db.collection<T>(name);
}

async function ensureIndexesAndCounters() {
  if (!db) return;

  console.log('⚙️ Ensuring collections and indexes...');

  // users: ensure unique telegramId and referralCode
  await getCollection('users').createIndex({ telegramId: 1 }, { unique: true, sparse: true });
  await getCollection('users').createIndex({ referralCode: 1 }, { unique: true, sparse: true });

  // botSettings: unique key
  await getCollection('botSettings').createIndex({ key: 1 }, { unique: true });

  // counters collection for numeric auto-increment ids
  const counters = getCollection('counters');
  const existing = await counters.findOne({ _id: 'users' });
  if (!existing) {
    await counters.insertOne({ _id: 'users', seq: 1 });
  }
  const existingW = await counters.findOne({ _id: 'withdrawals' });
  if (!existingW) {
    await counters.insertOne({ _id: 'withdrawals', seq: 1 });
  }
  const existingT = await counters.findOne({ _id: 'tasks' });
  if (!existingT) {
    await counters.insertOne({ _id: 'tasks', seq: 1 });
  }

  console.log('✅ Indexes and counters ensured');
}

export async function getNextSequence(name: string): Promise<number> {
  if (!db) throw new Error('MongoDB not connected');
  const counters = getCollection<{ _id: string; seq: number }>('counters');
  const res = await counters.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true });
  return res.value!.seq;
}

export { getCollection };

