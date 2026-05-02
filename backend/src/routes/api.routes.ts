import { Router } from 'express';
import * as apiController from '../controllers/api.controller';
import * as apiKeyController from '../controllers/apiKey.controller';
import { protect } from '../middleware/auth';

const router = Router();

// API routes
router.post('/apis', protect, apiController.createAPI);
router.get('/apis', protect, apiController.getAPIs);
router.get('/apis/:id', protect, apiController.getAPIDetails);
router.patch('/apis/:id', protect, apiController.updateAPI);
router.delete('/apis/:id', protect, apiController.deleteAPI);
router.post('/apis/test', protect, apiController.testAPIConnection);
router.get('/apis/:id/logs', protect, apiController.getAPILogs);
router.get('/apis/:id/analytics', protect, apiController.getAPIAnalytics);

// API Key routes
router.post('/apis/:apiId/keys', protect, apiKeyController.createAPIKey);
router.get('/apis/:apiId/keys', protect, apiKeyController.getAPIKeys);
router.patch('/apis/:apiId/keys/:keyId', protect, apiKeyController.updateAPIKey);
router.post('/apis/:apiId/keys/:keyId/rotate', protect, apiKeyController.rotateAPIKey);
router.delete('/apis/:apiId/keys/:keyId', protect, apiKeyController.revokeAPIKey);

export default router;
