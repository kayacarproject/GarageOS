# GarageOS 🔧

A production-ready, multi-tenant garage management system built with React Native (Expo), React Admin Panel, and Node.js backend.

---

## 📁 Project Structure

```
GarageOS/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
├── mobile/           # React Native + Expo + TypeScript
└── admin/            # React + Vite + Tailwind CSS
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)

---

## 🔧 Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env .env.local
# Edit .env with your PostgreSQL credentials

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
# API running at http://localhost:3000/api/v1
```

### Seed a test company & user
```bash
# Run this in psql or via a seed script
# Or use the POST /api/v1/companies endpoint to create a company
# Then POST /api/v1/users to create users
```

---

## 📱 Mobile App Setup

```bash
cd mobile
npm install

# Start Expo
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Demo Login (USE_DUMMY_DATA = true by default)
| Role         | Email                    | Password     | Company ID |
|--------------|--------------------------|--------------|------------|
| Owner        | owner@garage.com         | password123  | c1         |
| Manager      | manager@garage.com       | password123  | c1         |
| Mechanic     | mechanic@garage.com      | password123  | c1         |
| Receptionist | reception@garage.com     | password123  | c1         |

> Toggle `USE_DUMMY_DATA` in `mobile/src/config/env.ts` to switch between dummy data and real API.

---

## 🖥️ Admin Panel Setup

```bash
cd admin
npm install
npm run dev
# Admin panel at http://localhost:5173
```

---

## 🔐 Multi-Tenancy

- Every table has `company_id` (UUID)
- JWT contains `companyId` + `role`
- All API queries are filtered by `company_id` from JWT
- Cross-company data leakage is prevented at the query level

---

## 🏗️ Architecture

```
Mobile App (Expo)          Admin Panel (React/Vite)
       │                           │
       └──────────┬────────────────┘
                  │ HTTPS
            Node.js API (Express)
                  │
         ┌────────┴────────┐
    PostgreSQL          Cloudflare R2
    (Prisma ORM)        (Media Storage)
```

---

## 📦 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Mobile   | React Native, Expo, TypeScript, Zustand |
| Admin    | React, Vite, TypeScript, Tailwind CSS   |
| Backend  | Node.js, Express, TypeScript            |
| Database | PostgreSQL, Prisma ORM                  |
| Storage  | Cloudflare R2                           |
| Auth     | JWT (RS256)                             |

---

## 🌐 API Endpoints

| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| POST   | /api/v1/auth/login              | Login                 |
| POST   | /api/v1/auth/forgot-password    | Forgot password       |
| GET    | /api/v1/customers               | List customers        |
| POST   | /api/v1/customers               | Create customer       |
| GET    | /api/v1/vehicles                | List vehicles         |
| GET    | /api/v1/job-cards               | List job cards        |
| POST   | /api/v1/job-cards               | Create job card       |
| PATCH  | /api/v1/job-cards/:id/assign    | Assign mechanic       |
| GET    | /api/v1/bookings                | List bookings         |
| POST   | /api/v1/estimates               | Create estimate       |
| PATCH  | /api/v1/estimates/:id/approve   | Approve estimate      |
| POST   | /api/v1/invoices                | Create invoice        |
| POST   | /api/v1/payments                | Record payment        |

---

## ☁️ Cloudflare R2 Setup

1. Create a Cloudflare account
2. Create an R2 bucket named `garageos-media`
3. Create API tokens with R2 read/write permissions
4. Update `.env` with your credentials

---

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm run build
node dist/main.js
```

### Admin Panel
```bash
cd admin
npm run build
# Deploy dist/ to Vercel, Netlify, or S3
```

### Mobile
```bash
cd mobile
npx expo build:ios
npx expo build:android
```

---

## 📋 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/garageos
JWT_SECRET=your-secret-key
PORT=3000
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=garageos-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## 📄 License

MIT © GarageOS 2024
