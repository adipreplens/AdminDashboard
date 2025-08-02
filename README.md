# PrepLens Admin Dashboard

Educational platform admin panel for managing questions, exams, and student data.

## 🚀 Quick Start

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Node.js)
```bash
cd backend
npm install
npm start
```

## 📁 Project Structure
```
AdminDashboard/
├── frontend/          # Next.js 14 + React + TypeScript
├── backend/           # Node.js + Express + MongoDB
└── README.md
```

## 🔐 Login Credentials
- `admin@preplens.com` / `admin123`
- `admin` / `admin`
- `test@test.com` / `test`
- `user` / `user`

## 🌐 API Endpoints
- `GET /health` - Health check
- `GET /statistics` - Dashboard stats
- `GET /questions` - List questions
- `POST /questions` - Create question
- `DELETE /questions/:id` - Delete question
- `POST /bulk-upload` - Upload CSV
- `POST /upload-image` - Upload images

## 🚀 Deployment
- **Backend:** Render (Node.js)
- **Frontend:** Netlify (Next.js)

## 📊 Features
- Dashboard with statistics
- Question management (CRUD)
- Bulk CSV upload
- Search and filtering
- Image upload support
