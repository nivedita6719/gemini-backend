README.md
# Gemini Backend 💫

A scalable, modular backend clone of Gemini with Redis-based queue processing and secure API integration.

---

## 🚀 Live Demo

- **Backend Web URL:** [https://gemini-backend-axj4.onrender.com](https://gemini-backend-axj4.onrender.com)
- **Worker Service:** [https://gemini-backend-1-fvta.onrender.com](https://gemini-backend-1-fvta.onrender.com)

---

## 📦 Tech Stack

- **Node.js** + **Express**
- **PostgreSQL** (Appwrite or local DB)
- **Redis (Upstash)** via BullMQ
- **Stripe** for subscription billing
- **Gemini API** integration (Google PaLM)
- **Render** for deployment

---

## 📁 Project Structure



gemini-backend/
├── src/
│ ├── config/
│ │ ├── db.js
│ │ ├── redis.js
│ │ └── queue.js
│ ├── controllers/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ │ └── gemini.js
│ ├── index.js
│ └── worker.js
├── .env
├── package.json
└── README.md


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/nivedita6719/gemini-backend.git
cd gemini-backend
npm install

 
 
 Environment Setup
Create a .env file at the root:

PORT=3000

# PostgreSQL
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=gemini_db

# Security
JWT_SECRET=SuperStrongSecretKey123!
OTP_EXPIRY_MINUTES=5

# Redis (Upstash)
REDIS_URL=rediss://<your-upstash-url>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Gemini
GEMINI_API_KEY=AIza...

Start Web Server
npm run dev


Start Worker
npm run worker


Queue System (BullMQ + Redis)
BullMQ is used for background job processing via a Redis-based queue:

src/worker.js: Pulls jobs from gemini-message-queue

src/utils/gemini.js: Calls Gemini API with user prompt

src/config/queue.js: Sets up the queue and connection

Jobs are created on message post and processed in the worker



API Endpoints Overview
Auth
POST /auth/signup

POST /auth/login

POST /auth/verify-otp

Chatroom
POST /chatroom

GET /chatroom

POST /chatroom/:id/message

Subscription
POST /api/subscribe/pro

GET /subscription/status

POST /api/webhook/stripe


Use:

Authorization: Bearer <JWT Token> for protected routes.




🌐 Deployment (Render)
Web Server
src/index.js deployed on Render

Exposes REST APIs

Worker Service
src/worker.js runs as background service

Handles Gemini API queue jobs




📄 Design Decisions / Assumptions
Used Upstash Redis for secure, cloud-ready BullMQ support

Split logic into services for modularity

JWT + OTP system for authentication

Stripe subscription webhook supported for premium users

Author
Nivedita Singh
GitHub: nivedita6719

