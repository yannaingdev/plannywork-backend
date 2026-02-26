# PlannyWork API

Express + MongoDB API for managing jobsheets for field service engineers and supervisors. Provides session-based auth, job lifecycle management, file uploads (local disk or S3 presigned URLs), reporting, and key account geodata.

## Table of contents
- [Service layout](#service-layout)
- [Prereqs](#prereqs)
- [Env](#env)
- [Install](#install)
- [Local services](#local-services)
- [Database](#database)
- [Run API](#run-api)
- [Health](#health)
- [API surface](#api-surface)
- [Utility scripts](#utility-scripts)
- [UI preview](#ui-preview)

### Service layout
- `controllers`: auth, jobs, files, stats, key accounts
- `routes`: request routers under `/api/v1` (auth, jobs, files, stats, key-accounts, user)
- `model`: Mongoose models (`User`, `Job`, `File`, `KeyAccount`)
- `middleware`: session verification, JWT auth, sanitization, error handling
- `utils`: helpers for authorization, job state transitions, S3 permissions
- `documentation`: Postman collection and notes
- `scripts`: data utilities (mock seed, job-location backfill)

### Prereqs
- Node.js 18+ recommended
- npm (ships with Node)
- MongoDB 5+ or MongoDB Atlas connection string
- AWS account + S3 bucket (required for presigned upload/download flows; local disk uploads work for basic job attachments)

### Env
Copy `.env` from scratch and fill in secrets:
```
NODE_ENV=development
PORT=5100
dbconnectionString=mongodb+srv://<user>:<password>@cluster.mongodb.net/plannywork

JWT_SECRET=change_me
JWT_LIFETIME=1d

# Optional: enable S3-backed uploads
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=plannywork-uploads
```

### Install
```
npm install
```

### Local services
- Start MongoDB locally or ensure your Atlas cluster is reachable via `dbconnectionString`.
- For S3 uploads, create a bucket and set the AWS credentials above; otherwise files save to `uploads/` via Multer.

### Database
- Connection happens on boot via `server.js` using `dbconnectionString`.
- Seed sample jobs (uses `MOCK_DATA/` JSON):
```
node populatev4.js
```

### Run API
```
npm run dev   # nodemon, watches for changes
npm start     # plain node
```
Base URL: `http://localhost:5100` (or `${PORT}`).

### Health
```
GET /api/v1
# -> { status, msg, version, uptime, timeStamp, endpoints }
```

### API surface
**Auth (sessions + optional JWT for update/list routes)**  
- `POST /api/v1/auth/register` – create user  
- `POST /api/v1/auth/login` – start session (sets cookie)  
- `POST /api/v1/auth/logout` – destroy session  
- `PATCH /api/v1/auth/updateUser` – update profile (Bearer JWT)  
- `GET /api/v1/auth/listusers` – list users (Bearer JWT)  
- `GET /api/v1/auth/getCurrentUser` – session check

**Jobs (requires session)**  
- `POST /api/v1/jobs/draft` – create draft jobsheet  
- `POST /api/v1/jobs/:jobId/submit` – move draft to ready (verifies file uploads)  
- `GET /api/v1/jobs` – list with filters: `status`, `jobType`, `search`, `sort`, `page`  
- `GET /api/v1/jobs/:id` – job detail  
- `PATCH /api/v1/jobs/:id` – update (supports single file upload)  
- `DELETE /api/v1/jobs/:id` – delete  
- `POST /api/v1/jobs/:jobId/intents` – generate S3 upload intents for job files

**Files (requires session)**  
- `POST /api/v1/files/:jobId` – generate presigned upload URLs + create file records  
- `PATCH /api/v1/files/:fileId/status` – mark file status (e.g., `UPLOADED`)

**Stats (requires session)**  
- `GET /api/v1/stats` – job counts by status + monthly/weekly/daily aggregates

**Key Accounts (requires session)**  
- `POST /api/v1/key-accounts` – create key account with geo coordinates  
- `GET /api/v1/key-accounts` – list  
- `GET /api/v1/key-accounts/:id` – detail

**User jobs (requires session)**  
- `GET /api/v1/user/user` – jobs created by current user

### Utility scripts
- `node populatev4.js` – seed mock jobs into `plannywork` database.
- `node scripts/assign-job-locations-from-keyaccounts.js [--commit] [--user <id>]`  
  Dry-run by default; when `--commit` is passed, assigns `jobLocation` from matching key accounts (same creator) or round-robin fallback.

### UI preview
Legacy UI screenshots for the paired frontend (for context only):
![Landing Page](https://raw.githubusercontent.com/thonenyastack/PlannyWorkFullStackApp/develop/UI_Demo_Images/landingpage.png)
![Overview](https://raw.githubusercontent.com/thonenyastack/PlannyWorkFullStackApp/develop/UI_Demo_Images/overviewnew.png)
![All Jobs](https://raw.githubusercontent.com/thonenyastack/PlannyWorkFullStackApp/develop/UI_Demo_Images/alljobsheetsnew.png)
