import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { TransformationService } from '../../services/transformation.service';

export const forwardRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { api } = req;
  if (!api) return next();

  // Extract the path after /proxy/:slug
  // Example: /proxy/weather-api/forecast?city=Mumbai
  // req.params['0'] will contain the rest of the path if route is /proxy/:slug/*
  // Extract the path
  const path = req.params[0] || '';
  const baseUrl = req.apiVersion?.baseUrl || api.baseUrl;
  const targetUrl = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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

  // Apply Request Transformation
  let transformedBody = req.body;
  if (api.configuration.transformations?.enabled && api.configuration.transformations.request) {
    transformedBody = await TransformationService.transformRequest(req.body, api.configuration.transformations.request);
  }

  try {
    const response = await axios({
      method,
      url: targetUrl,
      data: transformedBody,
      params: req.query,
      headers,
      timeout: api.configuration.timeout || 30000,
      validateStatus: () => true,
    });

    let transformedResponseData = response.data;
    // Apply Response Transformation
    if (api.configuration.transformations?.enabled && api.configuration.transformations.response) {
      transformedResponseData = await TransformationService.transformResponse(response.data, api.configuration.transformations.response);
    }

    req.proxyResponse = {
      status: response.status,
      data: transformedResponseData,
      headers: response.headers,
    };

    // Forward the response to the client
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value as string | string[]);
      }
    });

    res.status(response.status).send(transformedResponseData);
    
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
