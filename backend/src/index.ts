import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { createServer } from 'http';
import { SocketService } from './services/socket.service';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api.routes';
import analyticsRoutes from './routes/analytics.routes';
import billingRoutes from './routes/billing.routes';
import gatewayRoutes from './routes/gateway.routes';
import docsRoutes from './routes/docs.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import domainRoutes from './routes/domain.routes';
import webhookRoutes from './routes/webhook.routes';
import notificationRoutes from './routes/notification.routes';
import teamRoutes from './routes/team.routes';
import referralRoutes from './routes/referral.routes';
import activityLogRoutes from './routes/activityLog.routes';
import BillingController from './controllers/billing.controller';
import cookieParser from 'cookie-parser';
import './workers/usage.worker';
import './workers/aggregation.worker';
import './workers/billing.worker';
import './workers/webhook.worker';
import './workers/health.worker';
import { scheduleHealthChecks } from './workers/health.worker';
import { BillingScheduler } from './services/billing.scheduler';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook needs raw body for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), BillingController.handleWebhook);
app.post('/api/billing/razorpay-webhook', express.json(), BillingController.handleRazorpayWebhook);

app.use(express.json());
app.use(cookieParser());
app.use('/api', apiLimiter);

// Routes
app.use('/proxy', gatewayRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'MeterFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api', apiRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Initialize Socket.io
SocketService.init(httpServer);

// Initialize Billing Scheduler
BillingScheduler.init().catch(err => console.error('Failed to init scheduler:', err));

// Initialize Health Checks
scheduleHealthChecks().catch(err => console.error('Failed to schedule health checks:', err));

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
