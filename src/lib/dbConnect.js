import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.NEXT_PUBLIC_MONGO_URI;

if (!MONGO_URI) {
  // don't throw here; allow functions to be used in non-db contexts, but log
  console.warn('MONGO_URI not set. Database operations will fail.');
}

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { dbName: 'legal-risk-radar', }).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
