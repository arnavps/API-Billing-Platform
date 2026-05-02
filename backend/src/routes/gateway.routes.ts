import { Router } from 'express';
import { extractAPIKey } from '../middleware/gateway/extractAPIKey';
import { validateAPIKey } from '../middleware/gateway/validateAPIKey';
import { checkRateLimit } from '../middleware/gateway/checkRateLimit';
import { checkQuota } from '../middleware/gateway/checkQuota';
import { forwardRequest } from '../middleware/gateway/forwardRequest';
import { logUsage } from '../middleware/gateway/logUsage';

const router = Router();

// The heart of MeterFlow: The Proxy Route
// Versioned Route: /proxy/:slug/:version/*
router.all(
  '/:slug/:version/*',
  extractAPIKey,
  validateAPIKey,
  checkRateLimit,
  checkQuota,
  forwardRequest,
  logUsage
);

// Default Version Route: /proxy/:slug/*
router.all(
  '/:slug/*',
  extractAPIKey,
  validateAPIKey,
  checkRateLimit,
  checkQuota,
  forwardRequest,
  logUsage
);

export default router;
