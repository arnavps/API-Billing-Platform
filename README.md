# MeterFlow

A premium API billing platform built with a MERN stack.

## Architecture

- **Backend**: Express.js + TypeScript + MongoDB + Redis + BullMQ
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Query

## Prerequisites

- Node.js >= 18
- MongoDB instance
- Redis instance

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `backend/.env.example` to `backend/.env` and update values.
   - Copy `frontend/.env.example` to `frontend/.env` and update values.

3. **Start Development Servers**
   To start both frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   
   Alternatively, you can run them individually:
   - Backend: `npm run dev --workspace=backend`
   - Frontend: `npm run dev --workspace=frontend`

## Features & Design

- Glass morphism UI with a deep navy/royal blue color palette.
- Dark-mode first approach.
- Ready for Stripe and Razorpay integrations.
- Absolute import paths configured for both backend (`@/*`) and frontend (`@/*`).
