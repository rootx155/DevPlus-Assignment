# DevPulse — Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## 🚀 Live Details

- **Live URL:** [https://dev-pulse-sigma-nine.vercel.app](https://dev-pulse-sigma-nine.vercel.app)
- **Database:** NeonDB (PostgreSQL)

---

## 🛠️ Tech Stack

- **Backend:** Node.js (v24.x) & Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Native `pg` driver)
- **Query Style:** Raw SQL only (No ORMs / No JOINs)
- **Security:** bcryptjs & jsonwebtoken (JWT)

---

## ✨ Key Features

- **Auth System:** Secure Signup & Login with JWT token roles.
- **RBAC Rules:** \* `contributor`: Can view all issues, create new ones, and edit their own open issues.
  - `maintainer`: Has full CRUD permissions across all issues and status modifications.
- **No SQL JOINs:** Efficiently matches reporter details via optimized application-level lookups.

---

## 🗄️ Database Schema

### 1. `users` Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

2. `issues` Table

```SQL
CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
  type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints List

### Auth Module

- POST /api/auth/signup - Register a new account (Public)
- POST /api/auth/login - Authenticate & get JWT Token (Public)

### Issues Module

- POST /api/issues - Create a new issue (Authenticated)
- GET /api/issues?sort=newest - Get all issues with filters (Public)
- GET /api/issues/:id - Get details of a single issue (Public)
- PATCH /api/issues/:id - Update issue details (Contributor Owner / Maintainer)
- DELETE /api/issues/:id - Permanently remove an issue (Maintainer Only)

## ⚙️ Setup Steps

```bash
git clone <repo-url>
cd DevPulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_secret_key
```

### 4. Build the Project

Compile the TypeScript source code:

```bash
npm run build
```

### 5. Run the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run start
```

## 🚀 API Status

Once the server is running successfully, the API will be available at:

```text
http://localhost:5000
```
