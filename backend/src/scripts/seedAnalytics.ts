import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { APILog } from '../models/APILog';
import { API } from '../models/API';
import { User } from '../models/User';
import { connectDB } from '../config/database';

dotenv.config();

const seedAnalytics = async () => {
  await connectDB();

  const user = await User.findOne();
  if (!user) {
    console.log('No user found. Please run auth seed first.');
    process.exit(1);
  }

  const apis = await API.find({ userId: user._id });
  if (apis.length === 0) {
    console.log('No APIs found for user.');
    process.exit(1);
  }

  console.log(`Seeding logs for ${apis.length} APIs...`);

  const logs = [];
  const now = new Date();

  // Generate logs for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (const api of apis) {
      // 50-200 logs per day per API
      const count = Math.floor(Math.random() * 150) + 50;

      for (let j = 0; j < count; j++) {
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        const status = Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 401 : 500);
        const paths = ['/users', '/products', '/orders', '/auth/login', '/search'];
        const path = paths[Math.floor(Math.random() * paths.length)];

        logs.push({
          apiId: api._id,
          userId: user._id,
          method: 'GET',
          path,
          status,
          latency: Math.floor(Math.random() * 500) + 50,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0',
          request: { headers: {}, body: {} },
          response: { headers: {}, body: {} },
          timestamp,
        });
      }
    }
  }

  await APILog.deleteMany({ userId: user._id });
  await APILog.insertMany(logs);

  console.log(`Inserted ${logs.length} logs successfully.`);
  process.exit(0);
};

seedAnalytics();
