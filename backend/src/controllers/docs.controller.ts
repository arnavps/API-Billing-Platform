import { Request, Response } from 'express';
import { API } from '../models/API';
import { AppError } from '../middleware/error.middleware';
import axios from 'axios';

export const getPublicAPIs = async (req: Request, res: Response) => {
  try {
    const apis = await API.find({ visibility: 'public', status: 'active' })
      .select('name description slug category icon metadata.version tags')
      .sort({ name: 1 });

    res.json({
      status: 'success',
      data: apis,
    });
  } catch (error) {
    throw new AppError('Error fetching public APIs', 500);
  }
};

export const getAPIDocs = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const api = await API.findOne({ slug, visibility: 'public' });

    if (!api) {
      throw new AppError('API not found', 404);
    }

    res.json({
      status: 'success',
      data: api,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Error fetching API documentation', 500);
  }
};

export const proxyPlaygroundRequest = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { method, path, headers, body, query } = req.body;

    const api = await API.findOne({ slug });
    if (!api) {
      throw new AppError('API not found', 404);
    }

    // In a real scenario, we would proxy this through the actual gateway
    // for usage tracking. For now, we'll simulate the call.
    // We expect the user to provide their MF-API-Key in the headers
    
    const gatewayUrl = process.env.GATEWAY_URL || `http://localhost:${process.env.PORT || 5000}/proxy`;
    const targetUrl = `${gatewayUrl}/${slug}${path}`;

    const startTime = Date.now();
    
    try {
      const response = await axios({
        method,
        url: targetUrl,
        headers: {
          ...headers,
          'X-MF-API-Key': req.headers['x-mf-api-key'], // Pass through the user's API key
        },
        params: query,
        data: body,
        validateStatus: () => true, // Don't throw on error status codes
      });

      const responseTime = Date.now() - startTime;

      res.json({
        status: 'success',
        data: {
          statusCode: response.status,
          headers: response.headers,
          body: response.data,
          responseTime,
        },
      });
    } catch (proxyError: any) {
      res.status(500).json({
        status: 'error',
        message: 'Proxy request failed',
        error: proxyError.message,
      });
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Error processing playground request', 500);
  }
};

export const getGuide = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // This could be replaced with a Markdown service reading from files
  const guides: Record<string, any> = {
    'getting-started': {
      title: 'Getting Started',
      content: `# Getting Started with MeterFlow\n\nMeterFlow is a high-performance API billing and management platform...`,
    },
    'authentication': {
      title: 'Authentication',
      content: `# Authentication\n\nAll requests to APIs managed by MeterFlow require an API Key...`,
    },
    // Add more guides as needed
  };

  const guide = guides[id];
  if (!guide) {
    throw new AppError('Guide not found', 404);
  }

  res.json({
    status: 'success',
    data: guide,
  });
};
