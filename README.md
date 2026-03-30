# EduCloud — Cloud-Native Learning Platform

A full-stack, AI-powered Learning Management System built with React, Node.js, MongoDB and HuggingFace AI. Supports three roles — Student, Teacher, and Admin — with real-time updates, assignment management, AI quiz generation, live classes, and email notifications.

---

## Team

| Name | Registration No. |
|------|-----------------|
| Saniya Mazumder | 23BCE2079 |
| Anshu Khan | 23BCE0115 |
| Aaditya Gupta | 23BCE0553 |

**Project Title:** A Scalable Cloud-Native Learning Platform  
**Institution:** VIT Vellore

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running the Project](#running-the-project)
8. [Demo Accounts](#demo-accounts)
9. [API Reference](#api-reference)
10. [AI Features — HuggingFace Setup](#ai-features--huggingface-setup)
11. [Email Notifications Setup](#email-notifications-setup)
12. [Role-Based Features](#role-based-features)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Features

### Core
- JWT-based authentication with Role-Based Access Control (RBAC)
- Three separate dashboards — Student, Teacher, Admin
- Real-time notifications via Socket.IO (new assignments, quizzes, live class alerts)
- Email notifications on account creation, course enrollment, and assignment grading

### Student
- View enrolled courses with teacher name and teacher ID
- Click and read full lesson content (text, PDF viewer, video player)
- Submit assignments with text answers
- View grades and teacher feedback
- Take quizzes with per-question review and explanations
- Track progress percentage and daily streaks
- AI chatbot (EduBot) for academic help

### Teacher
- Create and manage courses
- Add lessons (text, PDF, video)
- Create assignments — students notified instantly via Socket.IO and email
- Build quizzes manually or generate with HuggingFace AI
- Grade student submissions with feedback — students notified via email
- Enroll/remove students from courses
- Start live classes (Jitsi Meet — no API key required)
- Post announcements
- AI content summarizer

### Admin
- Full platform overview with live analytics charts
- Create users (students and teachers) — auto-generated IDs (STU0001, TCH0001)
- Welcome email with credentials sent automatically on account creation
- Enroll students in courses, assign teachers to courses
- View all users with Name, Email, Employee ID, and enrollment details
- Monitor login activity and platform statistics
- Post global announcements
- Manage all courses and users

### AI (HuggingFace — Free)
- **EduBot Chatbot** — Zephyr-7B answers academic questions
- **Quiz Generator** — generates MCQs from pasted content
- **Content Summarizer** — summarizes lecture notes (BART + Zephyr)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Pure CSS with CSS variables (no framework) |
| Charts | Recharts |
| Real-time | Socket.IO |
| Backend | Node.js 18+, Express 4 |
| Database | MongoDB + Mongoose (Atlas recommended) |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| AI | HuggingFace Inference API — Zephyr-7B + BART |
| Email | Nodemailer (Gmail) |
| File Upload | Multer (local dev) + multer-s3 (production) |
| Live Classes | Jitsi Meet (free, no API key needed) |
| Cloud Storage | AWS S3 (optional) |

---

## Project Structure

```
learning-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile
│   │   ├── courseController.js     # Course CRUD, enroll, progress
│   │   └── aiController.js         # HuggingFace chat, quiz, summary
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect + RBAC authorize()
│   │   └── upload.js               # Multer local + S3
│   ├── models/
│   │   ├── User.js                 # Student/Teacher/Admin schema + employeeId
│   │   ├── Course.js               # Course + lessons schema
│   │   └── index.js                # Quiz, Assignment, Announcement schemas
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/register|login
│   │   ├── users.js                # User CRUD, enroll, assign-teacher
│   │   ├── courses.js              # Course CRUD, lessons, progress
│   │   ├── assignments.js          # Assignment CRUD, submit, grade
│   │   ├── quizzes.js              # Quiz CRUD, submit, results
│   │   ├── announcements.js        # Announcement CRUD
│   │   ├── ai.js                   # AI chat, quiz-gen, summarize
│   │   ├── analytics.js            # Role-based analytics
│   │   ├── liveClasses.js          # Jitsi live class management
│   │   └── resources.js            # File upload
│   ├── utils/
│   │   ├── email.js                # Nodemailer + HTML email templates
│   │   └── seed.js                 # Demo data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express + Socket.IO entry point
│
└── frontend/
    └── src/
        ├── components/
        │   └── common/
        │       ├── Sidebar.jsx         # Role-aware collapsible sidebar
        │       ├── AIChatbot.jsx       # Floating EduBot widget
        │       └── UIComponents.jsx    # StatCard, Modal, EmptyState, etc.
        ├── contexts/
        │   ├── AuthContext.js          # Global auth state + JWT storage
        │   └── SocketContext.js        # Real-time event listeners
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── StudentDashboard.jsx    # Dashboard, My Courses, Announcements
        │   ├── TeacherDashboard.jsx    # Courses, Quizzes, Assignments, Students
        │   ├── AdminDashboard.jsx      # Analytics, Users, Courses, Roles
        │   ├── CoursePage.jsx          # Lesson viewer, Assignments, Quizzes
        │   └── CourseCatalog.jsx       # Browse and filter all courses
        └── services/
            └── api.js                  # All Axios API calls with interceptors
```

---

## Prerequisites

Install before starting:

- **Node.js v18 or higher** — https://nodejs.org (required for built-in `fetch()`)
- **npm v9+** — comes with Node.js
- **Git** — https://git-scm.com
- **VS Code** — https://code.visualstudio.com (recommended)

Verify your Node version:
```bash
node --version
# Must show v18.x.x or higher
```

---

## Installation

### Step 1 — Clone or Extract the Project

```bash
# If using git
git clone https://github.com/yourname/learning-platform.git
cd learning-platform

# If using the zip file
# Extract learning-platform-v4.zip → open the folder
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3 — Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in these values:

```env
# ─── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB Atlas ─────────────────────────────────────────
# Get from: cloud.mongodb.com → Cluster → Connect → Drivers
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/learning_platform?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_character_random_string_here
JWT_EXPIRE=7d

# ─── HuggingFace AI (FREE) ──────────────────────────────────
# Get from: huggingface.co → Settings → Access Tokens → New token (Read)
HUGGINGFACE_API_KEY=hf_your_token_here

# ─── Email (Gmail) ─────────────────────────────────────────
# For EMAIL_PASS: Google Account → Security → 2-Step Verification → App Passwords
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# ─── Frontend URL ──────────────────────────────────────────
CLIENT_URL=http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
```

The default `.env` works for local development:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## MongoDB Atlas Setup

1. Go to **https://cloud.mongodb.com** and sign up (free)
2. Create a new project → **Build a Cluster** → choose **M0 Free Tier**
3. Select region closest to you (e.g., Mumbai `ap-south-1`)
4. Under **Database Access** → Add database user:
   - Username: `educloud_user`
   - Password: generate a strong one
   - Role: **Atlas Admin**
5. Under **Network Access** → Add IP Address → **Allow from Anywhere** (`0.0.0.0/0`)
6. Go to **Clusters** → **Connect** → **Drivers** → copy the URI
7. Replace `<password>` with your password and paste into `MONGODB_URI`

---

## Running the Project

You need **two terminals** running at the same time.

### Terminal 1 — Backend

```bash
cd learning-platform/backend
npm run dev
```

Expected output:
```
MongoDB connected
Server running on port 5000
```

### Terminal 2 — Frontend

```bash
cd learning-platform/frontend
npm start
```

The app opens automatically at **http://localhost:3000**

### Seed Demo Data (Run Once)

```bash
cd backend
node utils/seed.js
```

This creates demo accounts and sample courses in your database.

---

## Demo Accounts

| Role | Email | Password | ID |
|------|-------|----------|----|
| Student | student@demo.com | demo123 | STU0001 |
| Student 2 | student2@demo.com | demo123 | STU0002 |
| Teacher | teacher@demo.com | demo123 | TCH0001 |
| Admin | admin@demo.com | demo123 | ADM0001 |

The login page has demo buttons — click Student, Teacher, or Admin to auto-fill credentials.

---

## API Reference

All endpoints require `Authorization: Bearer <token>` header except auth routes.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new account | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user with enrolled courses | All |
| PUT | `/api/auth/profile` | Update name/avatar | All |

### Users (Admin + Teacher)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users (filter by role, search) | Admin/Teacher |
| POST | `/api/users` | Create user + send welcome email | Admin |
| PUT | `/api/users/:id` | Update role or status | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| POST | `/api/users/enroll` | Enroll student in course + email | Admin/Teacher |
| POST | `/api/users/unenroll` | Remove student from course | Admin/Teacher |
| POST | `/api/users/assign-teacher` | Assign teacher to course | Admin |

### Courses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses` | List courses (filterable) | All |
| POST | `/api/courses` | Create course | Teacher/Admin |
| GET | `/api/courses/:id` | Get course details | All |
| PUT | `/api/courses/:id` | Update course | Teacher/Admin |
| DELETE | `/api/courses/:id` | Delete course | Teacher/Admin |
| POST | `/api/courses/:id/lessons` | Add lesson (with file upload) | Teacher/Admin |
| DELETE | `/api/courses/:id/lessons/:lid` | Remove lesson | Teacher/Admin |
| POST | `/api/courses/:id/enroll` | Self-enroll | Student |
| PUT | `/api/courses/:id/progress` | Update lesson progress | Student |

### Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assignments/course/:courseId` | Get course assignments | Enrolled |
| POST | `/api/assignments` | Create assignment | Teacher/Admin |
| PUT | `/api/assignments/:id` | Update assignment | Teacher/Admin |
| DELETE | `/api/assignments/:id` | Delete assignment | Teacher/Admin |
| POST | `/api/assignments/:id/submit` | Submit answer | Student |
| PUT | `/api/assignments/:id/grade/:studentId` | Grade + email student | Teacher/Admin |

### Quizzes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/quizzes/course/:courseId` | Get quizzes (answers hidden from students) | Enrolled |
| POST | `/api/quizzes` | Create quiz | Teacher/Admin |
| DELETE | `/api/quizzes/:id` | Delete quiz | Teacher/Admin |
| POST | `/api/quizzes/:id/submit` | Submit answers + get results | Student |
| GET | `/api/quizzes/:id/my-result` | Get my submission history | Student |
| GET | `/api/quizzes/:id/submissions` | All submissions | Teacher/Admin |

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ai/status` | Check if AI is configured | All |
| POST | `/api/ai/chat` | Chat with EduBot | All |
| POST | `/api/ai/generate-quiz-text` | Generate MCQs from text | All |
| POST | `/api/ai/summarize` | Summarize content | All |

### Announcements

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/announcements` | Get announcements (role-filtered) | All |
| POST | `/api/announcements` | Create announcement | Teacher/Admin |
| DELETE | `/api/announcements/:id` | Delete announcement | Teacher/Admin |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/overview` | Platform stats + charts data | Admin |
| GET | `/api/analytics/teacher` | Teacher's course stats | Teacher |
| GET | `/api/analytics/student` | Student's progress stats | Student |

### Live Classes (Jitsi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/live/:courseId/start` | Start live class | Teacher/Admin |
| POST | `/api/live/:courseId/end` | End live class | Teacher/Admin |
| GET | `/api/live/:courseId/status` | Get live status | All |

---

## AI Features — HuggingFace Setup

### Step 1 — Create Account

1. Go to **https://huggingface.co** → Sign Up (free)
2. Verify your email

### Step 2 — Get API Token

1. Click your profile → **Settings** → **Access Tokens**
2. Click **New token** → Name it `educloud` → Role: **Read**
3. Click **Generate** → **Copy the token immediately** (shown only once)

Token format: `hf_abcDEFghiJKLmnoPQRstuvWXYZ123456`

### Step 3 — Add to .env

```env
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

### Step 4 — Restart Backend

```bash
# Press Ctrl+C to stop, then:
npm run dev
```

### Step 5 — Verify

Open: `http://localhost:5000/api/ai/status`

```json
{ "success": true, "aiAvailable": true, "model": "HuggingFaceH4/zephyr-7b-beta" }
```

### Models Used

| Task | Model | Notes |
|------|-------|-------|
| Chat + Quiz | `HuggingFaceH4/zephyr-7b-beta` | Free, no gating, works immediately |
| Summarization | `facebook/bart-large-cnn` | Purpose-built, always available |
| Fallback | `tiiuae/falcon-7b-instruct` | Open access backup |

> **Why not Mistral?** Mistral-7B requires accepting a gating agreement on HuggingFace even with a valid token. Zephyr-7B is fully open, performs similarly, and works immediately with just a token.

### First-Time Cold Start

HuggingFace loads models on demand. The **first request after a long idle period** may take 20–40 seconds while the model loads. This is normal — subsequent requests respond in 2–8 seconds. The app automatically waits and retries.

### Demo Mode (No API Key)

Without an API key, all AI features still work in **demo mode** — the chatbot returns helpful pre-written answers, and the quiz generator returns sample questions. The UI shows "Demo Mode" status.

---

## Email Notifications Setup

Emails are sent for:
- **Account created** — login credentials (email + password + employee ID) sent to new user
- **Course enrolled** — student notified when admin/teacher enrolls them
- **Assignment graded** — student gets their grade and feedback by email

### Gmail Setup (Recommended)

1. Use a Gmail account as your sender
2. Enable 2-Step Verification: **Google Account → Security → 2-Step Verification**
3. Generate App Password: **Security → App Passwords → Select app: Mail → Generate**
4. Copy the 16-character code (e.g., `abcd efgh ijkl mnop`)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

> If `EMAIL_USER` or `EMAIL_PASS` are not set, the system logs emails to the console instead of sending them — this allows development without email setup.

---

## Role-Based Features

### Student Dashboard
| Section | Features |
|---------|---------|
| Dashboard | Progress overview, streak, avg completion, recent announcements |
| My Courses | All enrolled courses with teacher name, teacher ID, progress bar |
| Course Page → Course | Lesson list — click to open full content (text/PDF/video) |
| Course Page → Assignments | View assignments, submit text answers, see grades and feedback |
| Course Page → Quizzes | Take quizzes, per-question review with correct answers |
| Discover | Browse all available courses |
| Announcements | All global and course-specific announcements |

### Teacher Dashboard
| Section | Features |
|---------|---------|
| Dashboard | Stats overview + AI tools (quiz gen + summarizer) |
| Courses | Course list with enroll/live/students management |
| Quizzes | AI quiz generator (HuggingFace) + manual quiz builder |
| Assignments | Links to course assignment management |
| Announcements | Create/delete announcements per course or global |
| Students | Per-course student list with progress + remove button |

### Admin Dashboard
| Section | Features |
|---------|---------|
| Overview | Platform stats, pie charts, line charts, top courses, recent signups |
| Users | Full table with ID, role, status, enrollments; edit/delete/enroll/create |
| Courses | All courses table with assign-teacher, delete, view |
| Announcements | Create/delete platform-wide announcements |
| Analytics | Monthly signups chart, enrollment bar chart, role breakdown |

---

## Socket.IO Real-Time Events

| Event | Trigger | Receivers |
|-------|---------|-----------|
| `new_assignment` | Teacher creates assignment | All enrolled students |
| `new_quiz` | Teacher creates quiz | All enrolled students |
| `class_notification` | Teacher starts live class | All enrolled students |
| `enrolled_in_course` | Admin/Teacher enrolls student | That student |
| `announcement_notification` | New announcement posted | Course members or all |

---

## Deployment

### Backend — Railway (Easiest Free Option)

1. Push to GitHub
2. Go to **railway.app** → New Project → Deploy from GitHub
3. Select the `backend` folder as root
4. Add all environment variables from `.env`
5. Railway provides a URL like `https://your-app.railway.app`

### Backend — Render (Alternative Free)

1. Go to **render.com** → New Web Service
2. Connect your GitHub repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables in dashboard

### Frontend — Vercel (Recommended)

1. Go to **vercel.com** → New Project → Import GitHub repo
2. Set Root Directory to `frontend`
3. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_SOCKET_URL=https://your-backend.railway.app
   ```
4. Deploy — Vercel gives a free `.vercel.app` domain

### Database — MongoDB Atlas (Already Free)

Your Atlas cluster is already in the cloud. Just update `MONGODB_URI` in production environment variables.

### AWS S3 — File Storage (Optional)

For production file uploads instead of local storage:

1. Create an S3 bucket in AWS Console
2. Set bucket policy to allow public reads
3. Create IAM user with S3 access, copy keys
4. Add to production environment:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET=your-bucket-name
   ```

The app automatically uses S3 when these are set, local disk otherwise.

---

## Troubleshooting

### Backend won't start

```
Error: Cannot find module 'xyz'
```
Run `npm install` inside the `backend` folder.

---

### MongoDB connection error

```
MongoServerError: bad auth
```
- Check username and password in `MONGODB_URI`
- Make sure your IP is whitelisted in Atlas Network Access (`0.0.0.0/0` for dev)
- The database name in the URI should be `learning_platform`

---

### AI showing "Demo Mode" even after adding key

1. Token must start with `hf_`
2. No quotes around the value in `.env`:
   ```env
   # Correct
   HUGGINGFACE_API_KEY=hf_abc123
   
   # Wrong
   HUGGINGFACE_API_KEY="hf_abc123"
   ```
3. Restart the backend server after editing `.env`
4. Test: `http://localhost:5000/api/ai/status` should return `"aiAvailable": true`

---

### Admin analytics shows 0s or 500 error

This happens if old course documents have `enrolledStudents` as null. The analytics route uses `$ifNull` to handle this. If you still see 0s:

```bash
# Reseed the database
cd backend
node utils/seed.js
```

---

### Assignments returning 404

Make sure `server.js` has this line:
```js
app.use('/api/assignments', require('./routes/assignments'));
```

---

### Emails not sending

If `EMAIL_USER` and `EMAIL_PASS` are not set, emails are logged to console — this is not an error. To enable:
1. Use Gmail with 2-Step Verification enabled
2. Create an App Password (not your regular Gmail password)
3. Use the 16-character App Password as `EMAIL_PASS`

---

### Port 5000 or 3000 already in use

```bash
# Kill the process on port 5000
npx kill-port 5000

# Kill the process on port 3000
npx kill-port 3000
```

---

### React app shows blank white screen

Open browser DevTools (F12) → Console tab and check for errors. Common causes:
- Backend is not running — start it with `npm run dev` in the `backend` folder
- Wrong `REACT_APP_API_URL` in frontend `.env`
- Missing `npm install` in the `frontend` folder

---

## Security Notes (Production)

- Change `JWT_SECRET` to a 64-character random string
- Set `NODE_ENV=production`
- Use HTTPS (SSL certificate via Let's Encrypt or AWS ACM)
- Remove `0.0.0.0/0` from MongoDB Atlas, whitelist only your server IPs
- Never commit `.env` files to version control (already in `.gitignore`)
- Rotate `HUGGINGFACE_API_KEY` every 3–6 months

---

## License

This project is developed for academic purposes at VIT Vellore.  
Project IDs: 23BCE2079, 23BCE0115, 23BCE0553