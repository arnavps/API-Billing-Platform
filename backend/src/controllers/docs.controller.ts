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

export const searchDocs = async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Query parameter q is required' });
      }

      const query = q.toLowerCase();
      const results: any[] = [];

      // Search Guides
      const guides = [
        { id: 'getting-started', title: 'Getting Started with MeterFlow', category: 'Guide' },
        { id: 'authentication', title: 'Authentication Guide', category: 'Guide' },
        { id: 'rate-limiting', title: 'Rate Limiting', category: 'Guide' },
        { id: 'errors', title: 'Error Codes Reference', category: 'Guide' },
        { id: 'webhooks', title: 'Webhooks Reference', category: 'Guide' },
        { id: 'sdks', title: 'SDKs & Libraries', category: 'Guide' },
      ];

      guides.forEach(g => {
        if (g.title.toLowerCase().includes(query)) {
          results.push({
            title: g.title,
            type: 'guide',
            path: `/docs/${g.id}`,
            category: g.category
          });
        }
      });

      // Search APIs
      const apis = await API.find({ visibility: 'public' }).limit(10);
      apis.forEach(api => {
        if (api.name.toLowerCase().includes(query) || api.description.toLowerCase().includes(query)) {
          results.push({
            title: api.name,
            type: 'api',
            path: `/docs/apis/${api.slug}`,
            category: 'API Reference'
          });
        }
      });

      res.status(200).json({ status: 'success', data: results });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
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
      content: `# Getting Started with MeterFlow

## Overview
MeterFlow is a high-performance usage-based API billing platform designed for modern engineering teams. It allows you to transform any API into a monetizable product with less than 5 minutes of setup.

## Quick Start
1. **Sign up for an account**: Create your developer account at [meterflow.com/register](https://meterflow.com/register).
2. **Create your first API**: Navigate to the dashboard and add your backend service URL.
3. **Generate an API key**: Create a new key in the API settings to authenticate your requests.
4. **Start making requests**: Route your traffic through our high-speed gateway.
5. **Monitor usage**: Track every request and byte in real-time on your analytics dashboard.

## Basic Concepts
- **APIs**: Your backend services registered in MeterFlow.
- **API Keys**: Secure tokens used to authenticate consumers.
- **Gateway**: Our edge-optimized proxy that tracks usage and enforces limits.
- **Usage**: Detailed tracking of request counts, latency, and data transfer.
- **Billing**: Automatic invoice generation based on your defined pricing plans.`,
    },
    'authentication': {
      title: 'Authentication',
      content: `# Authentication

All requests to your APIs through the MeterFlow gateway must include a valid API key for identification and tracking.

## API Key Format
We use a prefixed format to help you identify your keys at a glance:
- **Live keys**: \`mf_live_xxxxxxxxxxxxxxxx\` (Used for production traffic)
- **Test keys**: \`mf_test_xxxxxxxxxxxxxxxx\` (Used for sandbox/development)

## Making Requests
Include your API key in the \`X-MF-API-Key\` header of every request.

\`\`\`bash
curl https://gateway.meterflow.com/proxy/your-api/endpoint \\
  -H "X-MF-API-Key: mf_live_xxxxxxxxxxxxxxxx"
\`\`\`

## Security Best Practices
- **Server-side only**: Never expose your API keys in client-side code (browsers, mobile apps).
- **Environment Variables**: Store keys in secure environment variables, never in source control.
- **Key Rotation**: Rotate your keys periodically to minimize the impact of a potential leak.
- **Least Privilege**: Only provide keys to services that absolutely require them.`,
    },
    'rate-limiting': {
      title: 'Rate Limiting',
      content: `# Rate Limiting

## Overview
MeterFlow enforces rate limits to ensure system stability and fair usage across all consumers. Limits are applied based on the plan assigned to the API Key.

## Rate Limit Headers
Every response from our gateway includes standard headers to help you track your current usage:
- \`X-RateLimit-Limit\`: The maximum number of requests allowed in the current window.
- \`X-RateLimit-Remaining\`: The number of requests left in the current window.
- \`X-RateLimit-Reset\`: The Unix timestamp when the current rate limit window resets.

## Handling Rate Limits
When a consumer exceeds their limit, the gateway returns a \`429 Too Many Requests\` status code.

\`\`\`json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds",
    "retryAfter": 45
  }
}
\`\`\`

## Best Practices
- **Retry Logic**: Implement exponential backoff when you receive a 429 response.
- **Header Monitoring**: Monitor the \`X-RateLimit-Remaining\` header to proactively slow down requests.
- **Caching**: Use a local cache for frequently requested data to reduce API calls.`,
    },
    'errors': {
      title: 'Error Codes',
      content: `# Error Codes Reference

MeterFlow uses standard HTTP status codes and detailed error objects to help you debug integration issues.

| Code | Status | Description |
|------|--------|-------------|
| \`MISSING_API_KEY\` | 401 | The \`X-MF-API-Key\` header is missing from the request. |
| \`INVALID_API_KEY\` | 401 | The provided API key is invalid or has been revoked. |
| \`RATE_LIMIT_EXCEEDED\` | 429 | The consumer has exceeded their allowed requests per second/minute. |
| \`QUOTA_EXCEEDED\` | 403 | The consumer has reached their total monthly request quota. |
| \`IP_NOT_ALLOWED\` | 403 | The request originated from an IP not in the allowed list. |
| \`TARGET_API_ERROR\` | 502 | Your backend service returned an error. |
| \`GATEWAY_TIMEOUT\` | 504 | Your backend service took too long to respond (>30s). |

## Error Object Structure
\`\`\`json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is not active.",
    "request_id": "req_8472910"
  }
}
\`\`\` `,
    },
    'webhooks': {
      title: 'Webhooks',
      content: `# Webhooks

## Overview
Webhooks allow your application to receive real-time notifications when specific events occur in your MeterFlow account.

## Event Types
- \`usage.warning\`: Triggered when a consumer reaches 80% of their monthly quota.
- \`usage.exceeded\`: Triggered when a consumer reaches 100% of their quota.
- \`payment.succeeded\`: Triggered when an invoice is successfully paid.
- \`payment.failed\`: Triggered when a payment attempt fails.

## Webhook Payload
\`\`\`json
{
  "id": "evt_928173",
  "event": "usage.warning",
  "created": "2024-01-01T12:00:00Z",
  "data": {
    "api_id": "api_prod_827",
    "consumer_id": "user_123",
    "current_usage": 8000,
    "limit": 10000
  }
}
\`\`\`

## Verifying Signatures
We sign every webhook request with an HMAC-SHA256 signature in the \`X-MF-Signature\` header. You should verify this signature using your webhook secret to ensure the request originated from MeterFlow.`,
    },
    'sdks': {
      title: 'SDKs & Libraries',
      content: `# SDKs & Libraries

Accelerate your integration with our official client libraries.

## Node.js
\`\`\`bash
npm install @meterflow/sdk
\`\`\`

\`\`\`javascript
const MeterFlow = require('@meterflow/sdk');
const client = new MeterFlow('mf_live_xxx');

const data = await client.request('my-api', '/users');
\`\`\`

## Python
\`\`\`bash
pip install meterflow
\`\`\`

\`\`\`python
from meterflow import MeterFlow
client = MeterFlow(api_key='mf_live_xxx')

response = client.request('my-api', '/users')
\`\`\`

## Go
\`\`\`bash
go get github.com/meterflow/meterflow-go
\`\`\`

\`\`\`go
import "github.com/meterflow/meterflow-go"
client := meterflow.NewClient("mf_live_xxx")

resp, err := client.Request("my-api", "/users")
\`\`\` `,
    },
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
