Ride Booking Backend System

Project Overview

This project is a backend-centric ride booking system built using a
microservices architecture. The primary objective was to design and
deploy a scalable backend system using Node.js, RabbitMQ, and cloud
deployment platforms while focusing on clean service separation,
event-driven communication, authentication, and production-grade
deployment practices.

------------------------------------------------------------------------

Architecture Overview

Architectural Patterns Used

-   API Gateway Pattern
-   Microservices Architecture
-   Event-Driven Communication (RabbitMQ)
-   Stateless Services
-   Environment-based Configuration

High-Level Architecture

Client → API Gateway → Microservices → RabbitMQ

    Client (Frontend - Vercel)
            ↓
    Gateway Service (Render - Public)
            ↓
    ---------------------------------
    | Users | Captain | Ride Service |
    ---------------------------------
            ↓
    RabbitMQ (CloudAMQP)

Only the Gateway Service is publicly accessible. All other services are
isolated and communicate via controlled routing and message queues.

------------------------------------------------------------------------

Microservices Design

1. Gateway Service

Responsibilities: - Public API entry point - Route forwarding to
internal services - CORS handling - Timeout and retry management -
Centralized error handling - Security header enforcement

Purpose: - Prevent direct exposure of internal services - Handle
cross-cutting concerns - Provide controlled service communication

------------------------------------------------------------------------

2. Users Service

Responsibilities: - User registration - User login - JWT generation -
Authentication middleware - Ride creation initiation

Authentication Strategy: - JWT-based authentication - Token stored as
HTTP-only cookie - Middleware-based protected routes

------------------------------------------------------------------------

3. Captain Service

Responsibilities: - Captain registration and login - Availability
toggling - Ride acceptance - Ride state transitions

Captains consume ride events from RabbitMQ and act on available ride
requests.

------------------------------------------------------------------------

4. Ride Service

Responsibilities: - Ride creation - Ride lifecycle management - Status
transitions - Event publishing to RabbitMQ

Ride Lifecycle:

    pending → accepted → ongoing → completed

------------------------------------------------------------------------

Detailed Backend Flow

User Authentication Flow

1.  User submits credentials.
2.  Users Service validates credentials.
3.  JWT token generated.
4.  Token stored in HTTP-only cookie.
5.  Middleware validates subsequent protected requests.

------------------------------------------------------------------------

Ride Creation Flow

1.  Authenticated user sends POST /ride/create.
2.  Ride Service validates input.
3.  Ride stored with status “pending”.
4.  Ride event published to RabbitMQ.

------------------------------------------------------------------------

Captain Acceptance Flow

1.  Captain Service consumes ride event.
2.  Available captains notified.
3.  Captain accepts ride.
4.  Ride Service updates status to “accepted”.
5.  Event published for further updates.

------------------------------------------------------------------------

RabbitMQ Integration (CloudAMQP)

Purpose

-   Service decoupling
-   Asynchronous communication
-   Scalability improvement
-   Reduced tight coupling between services

Environment Variable:

    RABBITMQ_URL=amqps://...

Communication Pattern: - Ride Service publishes ride events. - Captain
Service consumes ride events.

------------------------------------------------------------------------

Authentication & Session Management

-   JWT signed with secret
-   HTTP-only cookie storage
-   Middleware validation per request
-   Logout clears authentication cookie

------------------------------------------------------------------------

Deployment Strategy

Backend Deployment (Render)

Each microservice deployed independently:

-   Gateway (public)
-   Users Service
-   Captain Service
-   Ride Service

Environment Variables Managed on Render: - PORT (auto-injected) -
JWT_SECRET - RABBITMQ_URL - DATABASE_URL - SERVICE_URLS

Production Considerations: - Use process.env.PORT - No hardcoded
secrets - Node version pinned - Proxy timeout configuration - Error
handling for cold starts

------------------------------------------------------------------------

Frontend Deployment (Vercel)

Frontend communicates only with Gateway.

Environment Variable:

    NEXT_PUBLIC_API_URL=https://gateway.onrender.com

------------------------------------------------------------------------

GitHub Actions – Service Keep Alive

Render free tier spins down services after inactivity. To prevent cold
starts:

-   GitHub Actions scheduled workflow
-   Runs every 10 minutes
-   Calls /health endpoints
-   Keeps services active

Example Cron:

    "*/10 * * * *"

------------------------------------------------------------------------

API Documentation

User APIs

POST /user/register
Create new user.

POST /user/login
Authenticate user and issue JWT.

GET /user/profile
Protected route.

------------------------------------------------------------------------

Captain APIs

POST /captain/register
Register captain.

POST /captain/login
Authenticate captain.

PATCH /captain/status
Toggle captain availability.

------------------------------------------------------------------------

Ride APIs

POST /ride/create
Create ride (User).

GET /ride/:id
Fetch ride details.

PATCH /ride/accept
Captain accepts ride.

PATCH /ride/complete
Mark ride as completed.

------------------------------------------------------------------------

Engineering Challenges Solved

-   CORS misconfiguration debugging
-   Render port binding issues
-   502 errors from cold starts
-   Proxy timeout handling
-   Microservice communication debugging
-   Scheduled service keep-alive automation

------------------------------------------------------------------------

Engineering Highlights

-   Clear service separation
-   Event-driven communication model
-   Secure JWT authentication flow
-   Production deployment understanding
-   Infrastructure-level debugging
-   Environment-driven configuration
-   Gateway-based request orchestration

------------------------------------------------------------------------

Future Improvements

-   Redis caching layer
-   WebSocket-based real-time notifications
-   Circuit breaker implementation
-   Centralized logging system
-   Monitoring and observability stack
-   Container orchestration (Kubernetes)

------------------------------------------------------------------------

Summary

This backend system demonstrates distributed system design principles,
microservices architecture implementation, event-driven communication
using RabbitMQ, secure authentication strategies, and real-world
production deployment handling using modern cloud platforms.
