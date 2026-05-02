import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { User } from '../models/User';
import { API } from '../models/API';
import { APIKey } from '../models/APIKey';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meterflow');
    console.log('Connected to MongoDB');

    // 1. Create Test User
    let user = await User.findOne({ email: 'gateway-test@example.com' });
    if (!user) {
      user = await User.create({
        email: 'gateway-test@example.com',
        password: 'password123',
        firstName: 'Gateway',
        lastName: 'Tester',
        role: 'api_owner',
      });
      console.log('Test user created');
    }

    // 2. Create Test API
    let api = await API.findOne({ slug: 'httpbin' });
    if (!api) {
      api = await API.create({
        userId: user._id,
        name: 'HttpBin Test API',
        description: 'A test API for gateway verification',
        slug: 'httpbin',
        baseUrl: 'https://httpbin.org',
        category: 'other',
        configuration: {
          timeout: 5000,
          retries: 1,
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
          authentication: {
            type: 'none',
            headers: {},
          },
        },
        pricing: {
          model: 'free',
          freeQuota: 100,
        },
      });
      console.log('Test API created');
    }

    // 3. Create API Key
    const rawKey = `mf_live_${crypto.randomBytes(24).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    
    const apiKey = await APIKey.create({
      apiId: api._id,
      userId: user._id,
      name: 'Test Key',
      key: hashedKey,
      prefix: 'mf_live_',
      lastFour: rawKey.slice(-4),
      type: 'live',
      status: 'active',
    });

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('API Slug:', api.slug);
    console.log('API Key:', rawKey);
    console.log('Proxy URL Example: http://localhost:5000/proxy/httpbin/get');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
