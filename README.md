# Ride Booking Backend System

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Architecture: Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![Messaging: RabbitMQ](https://img.shields.io/badge/Messaging-RabbitMQ-ff6600)

A backend-centric ride booking platform built with a **microservices architecture**. The system is designed to be scalable, secure, and production-ready using **Node.js services**, **RabbitMQ (CloudAMQP)** for event-driven communication, and cloud deployment across **Render** and **Vercel**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
  - [Architectural Patterns](#architectural-patterns)
  - [High-Level Flow](#high-level-flow)
  - [Service Boundaries](#service-boundaries)
- [Detailed Flows](#detailed-flows)
  - [User Authentication Flow](#user-authentication-flow)
  - [Ride Creation Flow](#ride-creation-flow)
  - [Captain Acceptance Flow](#captain-acceptance-flow)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [User APIs](#user-apis)
  - [Captain APIs](#captain-apis)
  - [Ride APIs](#ride-apis)
- [Deployment](#deployment)
  - [Backend on Render](#backend-on-render)
  - [Frontend on Vercel](#frontend-on-vercel)
  - [Service Keep-Alive via GitHub Actions](#service-keep-alive-via-github-actions)
- [Engineering Challenges Solved](#engineering-challenges-solved)
- [Engineering Highlights](#engineering-highlights)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

This project demonstrates distributed system design principles in a ride booking domain:

- Clean separation of services through an API Gateway pattern.
- Event-driven service communication through RabbitMQ.
- JWT-based authentication and session handling.
- Cloud deployment with production-focused operational practices.

Only the **Gateway Service** is publicly exposed; internal services are isolated and accessed through controlled routing and queues.

## Features

- API Gateway as a single public entry point.
- Dedicated services for **Users**, **Captain**, and **Ride** domains.
- Event-driven ride updates using RabbitMQ (CloudAMQP).
- Stateless service design with environment-based configuration.
- JWT auth with HTTP-only cookies.
- Service health monitoring and keep-alive automation.

## Architecture

### Architectural Patterns

- API Gateway Pattern
- Microservices Architecture
- Event-Driven Communication (RabbitMQ)
- Stateless Services
- Environment-based Configuration

### High-Level Flow

```text
Client (Frontend - Vercel)
        ↓
Gateway Service (Render - Public)
        ↓
---------------------------------
| Users | Captain | Ride Service |
---------------------------------
        ↓
RabbitMQ (CloudAMQP)
```

### Service Boundaries

| Service | Responsibilities |
|---|---|
| Gateway Service | Public API entry point, route forwarding, CORS handling, timeout/retry strategy, centralized error handling, security headers |
| Users Service | User registration/login, JWT generation, authentication middleware, ride creation initiation |
| Captain Service | Captain registration/login, availability toggling, ride acceptance, ride state transitions |
| Ride Service | Ride creation, lifecycle management, state transitions, event publishing to RabbitMQ |

**Ride lifecycle:** `pending → accepted → ongoing → completed`

## Detailed Flows

### User Authentication Flow

1. User submits credentials.
2. Users Service validates credentials.
3. JWT token is generated.
4. Token is stored in an HTTP-only cookie.
5. Middleware validates protected requests.

### Ride Creation Flow

1. Authenticated user sends `POST /ride/create`.
2. Ride Service validates input.
3. Ride is stored with `pending` status.
4. Ride event is published to RabbitMQ.

### Captain Acceptance Flow

1. Captain Service consumes ride event.
2. Available captains are notified.
3. A captain accepts the ride.
4. Ride Service updates status to `accepted`.
5. Follow-up events are published for downstream updates.

## Tech Stack

- **Runtime:** Node.js
- **Architecture:** Microservices with API Gateway
- **Messaging:** RabbitMQ (CloudAMQP)
- **Auth:** JWT + HTTP-only cookies
- **Deployment:** Render (backend), Vercel (frontend)
- **Automation:** GitHub Actions (scheduled keep-alive)

## Requirements

- Node.js 18+ (recommended)
- npm 9+ (or equivalent package manager)
- RabbitMQ instance (CloudAMQP or self-hosted)
- Database connection URL for each service
- Render account (for backend deployment)
- Vercel account (for frontend deployment)

## Installation

> Clone and install dependencies for each service and frontend.

```bash
git clone <your-repo-url>
cd Backend-dev

# Backend services
cd backend/gateway && npm install
cd ../users && npm install
cd ../captain && npm install
cd ../ride && npm install

# Frontend (optional, if running full stack)
cd ../../frontend/uber-clone && npm install
```

## Configuration

Set environment variables per service.

```bash
# Shared backend variables (example)
JWT_SECRET=<your_jwt_secret>
RABBITMQ_URL=amqps://...
DATABASE_URL=<your_database_url>

# Service/routing variables
SERVICE_URLS=<internal_service_routes>
PORT=<auto-injected-on-render-or-local-port>

# Frontend variable
NEXT_PUBLIC_API_URL=https://gateway.onrender.com
```

## Usage

Start each backend service in separate terminals/sessions.

```bash
# Gateway
cd backend/gateway
node index.js

# Users service
cd backend/users
node server.js

# Captain service
cd backend/captain
node server.js

# Ride service
cd backend/ride
node server.js

# Frontend (optional)
cd frontend/uber-clone
npm run dev
```

## API Reference

### User APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/register` | Create a new user |
| POST | `/user/login` | Authenticate user and issue JWT |
| GET | `/user/profile` | Get profile (protected) |

### Captain APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/captain/register` | Register captain |
| POST | `/captain/login` | Authenticate captain |
| PATCH | `/captain/status` | Toggle captain availability |

### Ride APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ride/create` | Create ride (user) |
| GET | `/ride/:id` | Fetch ride details |
| PATCH | `/ride/accept` | Captain accepts ride |
| PATCH | `/ride/complete` | Mark ride as completed |

## Deployment

### Backend on Render

Each microservice is deployed independently:

- Gateway (public)
- Users Service
- Captain Service
- Ride Service

Production considerations:

- Use `process.env.PORT`.
- Avoid hardcoded secrets.
- Pin Node.js version.
- Configure proxy timeout/retry handling.
- Handle cold-start scenarios gracefully.

### Frontend on Vercel

Frontend communicates only with the Gateway service.

```bash
NEXT_PUBLIC_API_URL=https://gateway.onrender.com
```

### Service Keep-Alive via GitHub Actions

Render free-tier services can spin down during inactivity. A scheduled GitHub Actions workflow can call `/health` endpoints every 10 minutes.

```cron
*/10 * * * *
```

## Engineering Challenges Solved

- CORS misconfiguration debugging
- Render port binding issues
- 502 errors from cold starts
- Proxy timeout handling
- Microservice communication debugging
- Scheduled service keep-alive automation

## Engineering Highlights

- Clear service separation
- Event-driven communication model
- Secure JWT authentication flow
- Production deployment best practices
- Infrastructure-level debugging
- Environment-driven configuration
- Gateway-based request orchestration

## Future Improvements

- Redis caching layer
- WebSocket-based real-time notifications
- Circuit breaker implementation
- Centralized logging
- Monitoring and observability stack
- Container orchestration (Kubernetes)


