# StoreRate Pro - Enterprise Full-Stack Store Rating Web Application

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render_Active-22c55e?style=for-the-badge&logo=render&logoColor=white)](https://store-rating-platform-2e6k.onrender.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 🌐 **Live Production URL:** [**https://store-rating-platform-2e6k.onrender.com**](https://store-rating-platform-2e6k.onrender.com)  
> 📡 **API Health Endpoint:** [https://store-rating-platform-2e6k.onrender.com/api/health](https://store-rating-platform-2e6k.onrender.com/api/health)

A production-grade, industry-standard full-stack web application for discovering and rating retail stores with **Role-Based Access Control (RBAC)** for **System Administrators**, **Store Owners**, and **Normal Users**.

---

## 🚀 Live Demo Test Accounts

Visit [**https://store-rating-platform-2e6k.onrender.com**](https://store-rating-platform-2e6k.onrender.com) to access the live application. The platform includes a **1-Click Test Credentials Selector** on the login page for instant reviewer testing:

| Role | Email Address | Password | Functionalities & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **System Administrator** | `admin@storerating.com` | `Admin@2026!` | Full dashboard KPIs, add/edit/delete users & stores, sortable & filterable user/store management tables, user details modal with store ratings, CSV report export. |
| 🏪 **Store Owner** | `alexander.hamilton@stores.com` | `Owner@2026!` | Store analytics dashboard, overall store average rating, star rating distribution chart, customer review feedback comments, interactive Owner Reply system, CSV reviews export. |
| 👤 **Normal User** | `user@storerating.com` | `User@2026!` | Search stores by name & address, submit 1-5 star ratings with optional review comments, modify existing ratings, update password. |

---

## 🛠 Tech Stack

- **Backend**: Express.js with TypeScript, Clean Architecture, RESTful API design.
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM, migrations, and realistic seed data.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router v6, Axios with token interceptors.
- **Security & Reliability**: `express-rate-limit` brute-force protection, JWT authentication, bcrypt password hashing, Zod schema validation, Helmet headers, React Error Boundary.
- **DevOps & CI/CD**: GitHub Actions automated pipeline for linting, type-checking, building, and automated end-to-end integration tests.

---

## 🔒 Form Validations & Business Rules

All validation rules are strictly enforced on both **Frontend** and **Backend**:

- **Name**: Minimum 20 characters, maximum 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8–16 characters, must include at least **1 uppercase letter** and **1 special character** (`!@#$%^&*()_+-=[]{};':"|,.<>/?`).
- **Email**: Standard RFC email format.
- **Ratings**: Integer values from 1 to 5.
- **Review Comments**: Optional text feedback up to 500 characters.
- **Store Owner Replies**: Store owners can post public replies to customer reviews.
- **Password Eye Button**: Universal toggle button on all password fields across login, register, forgot/reset password, profile, and admin modals.
- **Admin Delete Controls**: Admin can safely delete users and stores with relational integrity and self-deletion prevention.
- **CSV Data Export**: 1-click export for Admin User/Store reports and Store Owner customer review logs.

---

## 🏗 Architecture & Database Schema

```mermaid
erDiagram
    USER ||--o{ STORE : "manages (StoreOwner)"
    USER ||--o{ RATING : "submits"
    STORE ||--o{ RATING : "receives"

    USER {
        string id PK
        string name "20-60 chars"
        string email UK
        string password "bcrypt hash"
        string address "max 400 chars"
        string role "ADMIN | USER | STORE_OWNER"
        string resetPasswordToken
        datetime resetPasswordExpires
        datetime createdAt
        datetime updatedAt
    }

    STORE {
        string id PK
        string name "3-60 chars"
        string email UK
        string address "max 400 chars"
        string ownerId FK "Nullable"
        datetime createdAt
        datetime updatedAt
    }

    RATING {
        string id PK
        int rating "1 to 5"
        string comment "max 500 chars"
        string ownerReply "max 500 chars"
        datetime ownerRepliedAt
        string userId FK
        string storeId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 📡 REST API Documentation

### 🔐 Authentication & Profile (`/api/auth` - Rate limited)
- `POST /api/auth/register`: Register new Normal User (name 20-60 chars, address max 400 chars, password rules).
- `POST /api/auth/login`: Single login endpoint for all roles.
- `GET /api/auth/me`: Get current authenticated profile.
- `PUT /api/auth/change-password`: Update password (validating old password & new password criteria).
- `POST /api/auth/forgot-password`: Generates secure crypto 1-hour reset token.
- `POST /api/auth/reset-password`: Resets password using valid token.

### 👑 System Administrator (`/api/admin` - Protected: `ADMIN`)
- `GET /api/admin/dashboard`: Total users, stores, ratings counts, average platform score, recent activity.
- `GET /api/admin/users`: List users with name/email/address search, role filter (`ADMIN`, `USER`, `STORE_OWNER`), sorting (`name`, `email`, `address`, `role`, `createdAt`), and store owner rating.
- `GET /api/admin/users/:id`: Detailed user profile with store ownership metrics & submitted ratings history.
- `POST /api/admin/users`: Create Admin, Normal User, or Store Owner (with optional store assignment).
- `PUT /api/admin/users/:id`: Edit user details, role, password, and store assignment.
- `DELETE /api/admin/users/:id`: Delete user account (with cascade cleanup & self-deletion guard).
- `GET /api/admin/stores`: List stores with search, sorting (`name`, `email`, `address`, `rating`), and owner information.
- `POST /api/admin/stores`: Create store entity.
- `PUT /api/admin/stores/:id`: Update store details & owner assignment.
- `DELETE /api/admin/stores/:id`: Delete store and cascade associated ratings.

### 🏪 Store Owner (`/api/owner` - Protected: `STORE_OWNER`, `ADMIN`)
- `GET /api/owner/dashboard`: Store information, overall average score, 1-5 star ratings distribution breakdown, customer review feedback comments, and reviewer list.
- `POST /api/owner/ratings/:ratingId/reply`: Reply directly to a customer review.

### 👤 Stores & Ratings (`/api/stores` & `/api/ratings`)
- `GET /api/stores`: Browse stores with search by name/address, sorting, overall rating, and current user's submitted rating.
- `GET /api/stores/:id`: Single store detail view with ratings breakdown.
- `POST /api/ratings`: Submit or modify rating (1–5) and optional comment for a store.
- `GET /api/ratings/my`: Get all ratings submitted by the logged-in user.

---

## 💻 Local Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/aryansheth18/Full-Stack-Final-Project.git
cd Full-Stack-Final-Project

# 2. Install dependencies & seed demo database
npm run install:all
npm run seed

# 3. Start development servers
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Automated Testing

Run the end-to-end integration test suite verifying authentication, RBAC, validations, CRUD operations, rating submission, and password reset:

```bash
cd server
node test-api.js
```

---

## ☁️ Deployment Guide (Render)

This repository is optimized for deployment on [Render](https://render.com/) with single-service frontend + backend hosting.

### Method 1: Blueprint Deployment (1-Click)
1. Sign in to the **[Render Dashboard](https://dashboard.render.com/)** with your GitHub account.
2. Click **"New +"** (top right) $\rightarrow$ **"Blueprint"**.
3. Select your repository: **`aryansheth18/Full-Stack-Final-Project`**.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/gulav/OneDrive/Desktop/Full%20Stack%20Final%20Project/render.yaml) and configure the build commands and environment variables.
5. Click **"Apply"** and wait for deployment to complete.

### Method 2: Manual Web Service Setup
1. Go to **[Render Dashboard](https://dashboard.render.com/)** $\rightarrow$ **"New +"** $\rightarrow$ **"Web Service"**.
2. Connect your GitHub repository: **`aryansheth18/Full-Stack-Final-Project`**.
3. Configure the following service settings:
   - **Environment / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npm install --prefix server && npm install --prefix client && npm run build --prefix client && cd server && npx prisma generate && npx prisma db push && npm run seed && npx tsc
     ```
   - **Start Command**:
     ```bash
     cd server && npm start
     ```
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `DATABASE_URL` = `file:./dev.db`
   - `JWT_SECRET` = `store_rating_platform_jwt_secret_production_2026`
   - `JWT_EXPIRES_IN` = `7d`
5. Click **"Deploy Web Service"**.

---

## 👨‍💻 Author

**Aryan Sheth**  
- GitHub: [@aryansheth18](https://github.com/aryansheth18)
- Repository: [https://github.com/aryansheth18/Full-Stack-Final-Project](https://github.com/aryansheth18/Full-Stack-Final-Project)

