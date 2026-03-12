# RideFlow — Full-Stack Ride Booking Platform

![Architecture: Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend: Node.js + Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-43853d)
![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![Messaging: RabbitMQ](https://img.shields.io/badge/Messaging-RabbitMQ-ff6600)
![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)

Production-style **ride-booking platform** built with a **microservices backend** and a modern **Next.js frontend**.  
The system separates domain responsibilities across services, routes all client traffic through a gateway, and uses RabbitMQ events for cross-service ride updates.

---

## Table of Contents

- [What This Project Includes](#what-this-project-includes)
- [Current Implementation Status](#current-implementation-status)
- [Architecture Overview](#architecture-overview)
- [Service Responsibilities](#service-responsibilities)
- [Implemented API Endpoints](#implemented-api-endpoints)
- [Event-Driven Flows (RabbitMQ)](#event-driven-flows-rabbitmq)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Deployment Notes](#deployment-notes)
- [Known Gaps / Suggested Next Improvements](#known-gaps--suggested-next-improvements)
- [License](#license)

---

## What This Project Includes

### Backend (Microservices)
- **Gateway Service** (`backend/gateway`) as the only public backend entry point.
- **Users Service** (`backend/users`) for rider auth/profile and accepted-ride polling.
- **Captain Service** (`backend/captain`) for captain auth/profile, availability toggling, and new-ride long polling.
- **Ride Service** (`backend/ride`) for creating, accepting, and cancelling rides.
- **RabbitMQ integration** for ride lifecycle messaging between services.

### Frontend (Next.js)
- Role-based auth UI (rider/captain registration + login).
- Rider dashboard to request and cancel rides.
- Captain dashboard to receive and accept/cancel ride offers.
- Session role handling (`ride-role`) for route and dashboard flow control.

---

## Current Implementation Status

Implemented and working in codebase:

- ✅ API Gateway proxy routing for `/user`, `/captain`, and `/ride`.
- ✅ JWT + cookie-based authentication in user/captain services.
- ✅ Token blacklisting on logout (user and captain).
- ✅ Ride creation from rider side.
- ✅ Captain-side long polling for new rides (`/captain/new-ride`).
- ✅ Rider-side long polling for accepted/cancelled updates (`/user/accepted-ride`).
- ✅ Ride accept flow with queue events (`ride-accepted`, `ride-updated`).
- ✅ Rider and captain cancellation flows.
- ✅ Basic health endpoints in all services (`/healthz`).
- ✅ Frontend pages for home, register, login, rider dashboard, captain dashboard.

---

## Architecture Overview

```text
Next.js Frontend (Vercel / Local)
            |
            v
     Gateway Service (Public)
            |
  -------------------------------
  | Users | Captain | Ride Svc |
  -------------------------------
            |
            v
      RabbitMQ (CloudAMQP)
            |
            v
          MongoDB
```

### Request Flow
1. Frontend calls **Gateway**.
2. Gateway proxies request to the target domain service.
3. Services authenticate using JWT tokens from cookies/bearer headers.
4. Ride-related events are published/subscribed through RabbitMQ queues.

---

## Service Responsibilities

| Service | Port (default) | Responsibility |
|---|---:|---|
| Gateway | `4000` | Public entry point, CORS, route proxying to internal services |
| Users | `3001` | Rider registration/login/logout/profile, accepted-ride long polling |
| Captain | `3002` | Captain registration/login/logout/profile, availability, new-ride polling |
| Ride | `3003` | Ride creation, accept, cancel-by-user, cancel-by-captain |

---

## Implemented API Endpoints

> All endpoints below are consumed through the gateway base URL.

### User Routes
- `POST /user/register`
- `POST /user/login`
- `GET /user/logout`
- `GET /user/profile` *(auth required)*
- `GET /user/accepted-ride?rideId=<id>` *(auth required, long-poll style)*

### Captain Routes
- `POST /captain/register`
- `POST /captain/login`
- `GET /captain/logout`
- `GET /captain/profile` *(auth required)*
- `PATCH /captain/toggle-availability` *(auth required)*
- `GET /captain/new-ride` *(auth required, long-poll style)*

### Ride Routes
- `POST /ride/create-ride` *(rider auth required)*
- `PUT /ride/accept-ride?rideId=<id>` *(captain auth required)*
- `PUT /ride/cancel-ride/user?rideId=<id>` *(rider auth required)*
- `PUT /ride/cancel-ride/captain?rideId=<id>` *(captain auth required)*

### Health Routes
- `GET /healthz` in gateway and each internal service.

---

## Event-Driven Flows (RabbitMQ)

Current queues in use:

- `new-ride`
  - Published by Ride Service when a rider creates a ride.
  - Consumed by Captain Service to push offers to waiting captains.

- `ride-updated`
  - Published by Ride Service when a ride is accepted/cancelled.
  - Consumed by Users Service to notify rider polling endpoint.

- `ride-accepted`
  - Published on acceptance (available for additional consumers / future workflows).

---

## Tech Stack

- **Backend:** Node.js, Express, Mongoose, JWT, cookie-parser
- **Messaging:** amqplib / RabbitMQ (CloudAMQP compatible)
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Infrastructure:** Render (backend deployment), Vercel (frontend deployment)

---

## Monorepo Structure

```bash
Backend-dev/
├── backend/
│   ├── gateway/
│   ├── users/
│   ├── captain/
│   └── ride/
├── frontend/
│   └── uber-clone/
└── README.md
```

---

## Environment Variables

Create `.env` files for each backend service.

### Gateway (`backend/gateway/.env`)
```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
USERS_URL=http://localhost:3001
CAPTAIN_URL=http://localhost:3002
RIDE_URL=http://localhost:3003
```

### Users / Captain / Ride services
```env
PORT=<service_port>
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<jwt_secret>
RABBIT_URL=<amqp_connection_string>
```

### Frontend (`frontend/uber-clone/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Run Locally

### 1) Install dependencies

```bash
# backend services
cd backend/gateway && npm install
cd ../users && npm install
cd ../captain && npm install
cd ../ride && npm install

# frontend
cd ../../frontend/uber-clone && npm install
```

### 2) Start backend services (separate terminals)

```bash
cd backend/gateway && npm start
cd backend/users && npm start
cd backend/captain && npm start
cd backend/ride && npm start
```

### 3) Start frontend

```bash
cd frontend/uber-clone
npm run dev
```

Frontend will run on `http://localhost:3000`.

---

## Deployment Notes

- Deploy each backend service independently on Render.
- Expose only the Gateway publicly.
- Configure frontend to call Gateway URL via `NEXT_PUBLIC_API_URL`.
- Use a managed RabbitMQ (e.g., CloudAMQP) and MongoDB URI per environment.
- Keep `/healthz` endpoints for uptime checks and monitoring.

---

## Known Gaps / Suggested Next Improvements

To make the project even more production-ready:

1. Add API documentation (OpenAPI/Swagger).
2. Add unified error-handling middleware and request validation.
3. Add test suites (unit + integration + e2e).
4. Add Docker + docker-compose for one-command local setup.
5. Add centralized logging + observability (e.g., Winston + OpenTelemetry).
6. Add role-based authorization guards at gateway level.
7. Add rate limiting and circuit breaker policies at gateway.
8. Add idempotency + dead-letter queue strategy for message reliability.

---

## License

This project is licensed under the MIT License.
