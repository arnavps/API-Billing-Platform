import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const forwardRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { api } = req;
  if (!api) return next();

  // Extract the path after /proxy/:slug
  // Example: /proxy/weather-api/forecast?city=Mumbai
  // req.params['0'] will contain the rest of the path if route is /proxy/:slug/*
  const path = req.params[0] || '';
  const targetUrl = `${api.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  req.targetUrl = targetUrl;

  const method = req.method;
  const headers = { ...req.headers };
  
  // Remove host and other problematic headers
  delete headers.host;
  delete headers['x-mf-api-key']; // Don't leak our key to the target
  delete headers.connection;
  delete headers['content-length'];

  // Add target API custom headers if configured
  if (api.configuration.authentication?.headers) {
    const customHeaders = api.configuration.authentication.headers;
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers[key.toLowerCase()] = value as string;
    });
  }

  try {
    const response = await axios({
      method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers,
      timeout: api.configuration.timeout || 30000,
      validateStatus: () => true, // Don't throw on 4xx/5xx, we want to log them
    });

    req.proxyResponse = {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };

    // Forward the response to the client
    // Set headers from target
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value as string | string[]);
      }
    });

    res.status(response.status).send(response.data);
    
    // Continue to logUsage middleware (even after response is sent)
    next();
  } catch (error: any) {
    console.error('Forwarding Error:', error.message);
    
    const status = error.response?.status || 502;
    const errorData = error.response?.data || {
      error: {
        code: 'BAD_GATEWAY',
        message: 'Could not reach the target API',
        details: error.message
      }
    };

    req.proxyResponse = {
      status,
      data: errorData,
      headers: error.response?.headers || {},
    };

    if (!res.headersSent) {
      res.status(status).json(errorData);
    }
    
    next();
  }
};
