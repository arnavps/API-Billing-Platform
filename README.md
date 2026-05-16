<div align="center">

# MeterFlow

### Monetize Your APIs Like Stripe. Track Usage Like AWS.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://meterflow.demo) · [Documentation](https://docs.meterflow.dev) · [Report Bug](https://github.com/yourusername/meterflow/issues) · [Request Feature](https://github.com/yourusername/meterflow/issues)

</div>

---

## What is MeterFlow??

**MeterFlow** is a production-grade, usage-based API billing platform that helps developers monetize their APIs with enterprise-grade metering, real-time analytics, and seamless billing — all wrapped in a stunning, premium interface.

Built for scale and designed for developers who demand excellence.

---

## Features

### Core Platform

- **API Gateway Layer** — High-performance reverse proxy that validates, meters, and forwards API requests with <50ms overhead
- **Usage-Based Billing** — Flexible pricing models: free tier, pay-per-request, tiered pricing, and custom plans
- **Real-Time Analytics** — Live dashboard with request metrics, latency tracking, and error monitoring
- **Advanced Rate Limiting** — Token bucket, sliding window, and fixed window strategies with Redis-backed distributed limiting
- **Multi-Gateway Payments** — Stripe (International) + Razorpay (India) with webhook support

### Developer Experience

- **API Key Management** — Create, rotate, and revoke API keys with IP/domain restrictions
- **Developer Portal** — Interactive documentation with API playground and SDKs
- **Webhooks** — Real-time event notifications for billing, usage, and system events
- **Request Logging** — Comprehensive request/response logging with search and export

### Premium UI/UX

- **Glass Morphism Design** — Modern, polished interface with blur effects and transparency
- **Dark Mode First** — Deep navy color palette (#0A1628) with cyan accents
- **Real-Time Updates** — WebSocket-powered live dashboards with <1s latency
- **Responsive Design** — Optimized for desktop, tablet, and mobile

---

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓ X-MF-API-Key: mf_live_xxx
┌─────────────────────────────────────┐
│     MeterFlow API Gateway           │
│  ┌─────────────────────────────┐   │
│  │ 1. Validate API Key         │   │
│  │ 2. Check Rate Limit (Redis) │   │
│  │ 3. Check Quota              │   │
│  │ 4. Log Request (Async)      │   │
│  │ 5. Forward to Target API    │   │
│  │ 6. Log Response             │   │
│  │ 7. Return to Client         │   │
│  └─────────────────────────────┘   │
└───────────┬─────────────────────────┘
            │
            ↓
    ┌───────────────┐
    │  Target API   │
    │ (User's API)  │
    └───────────────┘

Data Flow:
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Gateway │───▶│  Redis  │───▶│ MongoDB  │
│         │    │ (Cache) │    │ (Logs)   │
└─────────┘    └─────────┘    └──────────┘
                                     │
                                     ↓
                            ┌─────────────────┐
                            │ Background Jobs │
                            │ - Aggregation   │
                            │ - Billing       │
                            │ - Invoicing     │
                            └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| **State Management** | Zustand (global) + React Query (server) |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB (Mongoose) + Redis (ioredis) |
| **Queue System** | BullMQ (background jobs) |
| **Authentication** | JWT (access + refresh tokens) + bcryptjs |
| **Payments** | Stripe + Razorpay |
| **Real-Time** | Socket.io |
| **Charts** | Recharts |
| **Animations** | Framer Motion |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meterflow.git
   cd meterflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

   Update the `.env` files with your credentials:
   - MongoDB URI
   - Redis URL
   - JWT secrets
   - Stripe/Razorpay API keys

4. **Start development servers**
   ```bash
   npm run dev
   ```

   Or run individually:
   ```bash
   # Backend only
   npm run dev --workspace=backend
   
   # Frontend only
   npm run dev --workspace=frontend
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## API Documentation

### Authentication

All API requests (except authentication endpoints) require a valid JWT token in the header:

```
Authorization: Bearer <access_token>
```

### Gateway Requests

Proxy requests through the MeterFlow gateway:

```
GET https://gateway.meterflow.com/proxy/{api_slug}/{endpoint}
Headers:
  X-MF-API-Key: mf_live_xxxxxxxxxxxxxxxx
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/apis` | GET | List user's APIs |
| `/api/apis` | POST | Create new API |
| `/api/apis/:id/keys` | GET | List API keys |
| `/api/apis/:id/keys` | POST | Generate new API key |
| `/api/usage` | GET | Get usage analytics |
| `/api/billing/invoices` | GET | List invoices |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

For complete API documentation, visit [docs.meterflow.dev](https://docs.meterflow.dev)

---

## Project Structure

```
meterflow/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration
│   │   ├── types/           # TypeScript types
│   │   ├── validators/      # Input validation
│   │   └── jobs/            # Background jobs
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand store
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   └── public/
└── package.json
```

---

## Screenshots

<div align="center">

| Dashboard | API Management | Analytics |
|-----------|---------------|-----------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![APIs](docs/screenshots/apis.png) | ![Analytics](docs/screenshots/analytics.png) |

| Billing | Developer Portal | Real-Time Logs |
|---------|-------------------|----------------|
| ![Billing](docs/screenshots/billing.png) | ![Docs](docs/screenshots/docs.png) | ![Logs](docs/screenshots/logs.png) |

</div>

---

## Roadmap

- [x] Project foundation & architecture
- [x] Authentication & user management
- [x] API management system
- [x] API gateway layer
- [x] Usage tracking & analytics
- [x] Billing engine & pricing logic
- [x] Real-time dashboard with WebSocket
- [x] Advanced rate limiting
- [x] Payment integration (Stripe & Razorpay)
- [x] Advanced dashboard & data visualization
- [x] API documentation & developer portal
- [x] Webhooks & notifications
- [x] Security, testing & QA
- [x] Deployment & DevOps
- [x] Premium features & final polish

### Coming Soon

- [ ] GraphQL gateway support
- [ ] AI-powered usage predictions
- [ ] Multi-region gateway deployment
- [ ] Custom analytics dashboards
- [ ] Team/organization support

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Acknowledgments

- Design inspired by [Stripe](https://stripe.com), [Vercel](https://vercel.com), and [Linear](https://linear.app)
- Icons by [Lucide](https://lucide.dev)
- UI components built with [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

**[⬆ Back to Top](#meterflow)**

Built with ❤️ by the MeterFlow team

</div>
