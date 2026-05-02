import { Router } from 'express';
import * as docsController from '../controllers/docs.controller';

const router = Router();

// Public routes (no auth required for basic docs, though playground might need its own auth)
router.get('/apis', docsController.getPublicAPIs);
router.get('/apis/:slug', docsController.getAPIDocs);
router.get('/guides/:id', docsController.getGuide);

// Playground proxy (usually requires an API key in headers, but the route itself can be public)
router.post('/playground/:slug/proxy', docsController.proxyPlaygroundRequest);

export default router;
