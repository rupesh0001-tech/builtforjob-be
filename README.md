# Backend Authentication API

## Setup Instructions

### 1. Run Setup Script
```bash
# This will create folders and install dependencies
setup.bat
```

### 2. Environment Setup
```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, RESEND_API_KEY, etc.
```

### 3. Database Setup
```bash
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
```

### 4. Start Development Server
```bash
bun run dev
```

## API Endpoints

- `POST /user/register` - Register new user (sends OTP)
- `POST /verify/otp` - Verify OTP and complete registration
- `POST /user/login` - Login user
- `POST /user/forget/password` - Request password reset
- `GET /profile` - Get user profile (protected)

See `../docs/backend/auth/` for detailed API documentation.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, JWT, Email configs
│   ├── interfaces/      # TypeScript interfaces
│   ├── middlewares/     # Auth & validation middlewares
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic (hash, JWT, OTP, email)
│   └── app.ts          # Main application
├── prisma/
│   └── schema.prisma   # Database schema
└── .env.example        # Environment template
```
