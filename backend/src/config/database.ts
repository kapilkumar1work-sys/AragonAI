import mongoose from 'mongoose';
import { env } from './env';

async function getPublicIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=text', {
      signal: AbortSignal.timeout(3000),
    });
    return (await res.text()).trim();
  } catch {
    return null;
  }
}

export async function connectDatabase(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);

  const options = {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  };

  try {
    await mongoose.connect(env.mongodbUri, options);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    const publicIp = await getPublicIp();

    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);

      if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.error('→ Invalid username or password. Verify credentials in Atlas → Database Access.');
      } else {
        console.error('→ Whitelist this IP in Atlas → Network Access:', publicIp ?? 'unknown');
        console.error('→ Corporate networks often block port 27017. Try mobile hotspot or VPN off.');
      }
    }
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
