# Cinelix API — High-Concurrency Booking Engine

Cinelix is a high-performance REST API designed to manage the complex logistics of movie bookings. It handles distributed seat locking, real-time balance reconciliation, and multi-user concurrency with a focus on data integrity and security.

## Core Features
- **Redis Concurrency Control**: Distributed locking mechanism that prevents double-booking and ensures data consistency under heavy load.
- **Real-Time WebSockets**: Integrated **Socket.io** broadcaster for instantaneous seat state synchronization across all connected clients.
- **Cinelix Wallet & Ledger**: Robust financial logic for managing user balances, including support for partial wallet payments and automated deductions.
- **Razorpay Integration**: End-to-end payment processing with signature verification and webhook support for secure transactions.
- **Admin Intelligence Dashboard**: Specialized endpoints for tracking real-time revenue, theatre occupancy, and booking metrics.
- **Advanced Authentication**: JWT-protected endpoints with Role-Based Access Control (RBAC) for Admins, Theatre Owners, and Users.

## Technology Architecture
| Component | Technology |
| :--- | :--- |
| **Server** | Node.js with Express.js (TypeScript) |
| **Data Layer** | PostgreSQL with **Prisma ORM** |
| **Caching/Locks** | **Redis** |
| **Real-Time** | **Socket.io** |
| **Security** | JSON Web Tokens & Bcrypt hashing |

## Development Setup
### 1. Requirements
Ensure you have Node.js 20+, a PostgreSQL instance, and a Redis server running.

### 2. Installation
```bash
git clone https://github.com/ayushkumarsinghh/cinelix-backend.git
cd cinelix-backend
npm install
```

### 3. Environment Configuration
Define your credentials in a `.env` file:
```text
PORT=5000
DATABASE_URL="your_postgresql_url"
REDIS_URL="your_redis_url"
JWT_SECRET="your_jwt_secret"
RAZORPAY_KEY_ID="your_key"
RAZORPAY_KEY_SECRET="your_secret"
```

### 4. Boot the Server
```bash
# Generate Prisma Client
npm run prisma:generate

# Start production server
npm start
```

## API Ecosystem
### Authentication
- `POST /api/auth/register` - Onboard a new user
- `POST /api/auth/login` - Secure login & token generation

### Movie & Booking Operations
- `GET /api/movies` - Fetch all active screenings
- `POST /api/seats/lock` - Initiate a Redis-backed seat lock (5-minute expiry)
- `POST /api/payments/create-order` - Generate a Razorpay order with wallet deduction logic
- `POST /api/payments/verify` - Confirm payment and finalize seat booking

### User & Wallet Management
- `GET /api/users/profile` - Retrieve account details and Cinelix Wallet balance
- `POST /api/users/membership` - Upgrade to Cinelix+ Premium membership

## Data Logic Summary
The system utilizes four primary data entities to ensure consistency:
1. **Users**: Identities with wallet balances and membership tiers.
2. **Shows**: Logical mappings between Movies, Theatres, and Schedules.
3. **Seats**: State-managed entities tracking availability and locks.
4. **Bookings**: Immutable transaction records linked to payments.

## Conclusion
Cinelix Backend is designed to be a lightweight yet powerful solution for modern entertainment booking. By combining a distributed Redis locking strategy with a secure JWT-based architecture, it provides a reliable foundation for scaling to thousands of concurrent users without the friction of data collisions.
