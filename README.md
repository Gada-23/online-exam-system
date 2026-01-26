# Online Exam System

A full-stack MERN application for Computer Science students to prepare for exit exams.

## Features

### Backend (Node.js + Express + MongoDB)
- User authentication with JWT (Student/Admin roles)
- Question management (CRUD operations for admins)
- Exam creation and management
- Result tracking and review
- Role-based access control

### Frontend (React)
- Student dashboard to view and take exams
- Exam interface with countdown timer
- Result review with correct/incorrect answers
- Admin dashboard for managing questions and exams
- Responsive design with Bootstrap

## Project Structure

```
online-exam-system/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── server.js          # Express server
│   └── .env               # Environment variables
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/    # React components
    │   ├── context/       # Auth context
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── App.js         # Main app component
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Make sure your `.env` file has:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Questions (Admin only)
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get single exam
- `POST /api/exams` - Create exam (Admin only)
- `PUT /api/exams/:id` - Update exam (Admin only)
- `DELETE /api/exams/:id` - Delete exam (Admin only)

### Results
- `POST /api/results` - Submit exam answers (Student only)
- `GET /api/results` - Get results (Students see only their own)
- `GET /api/results/:id` - Get single result with details

## Usage

1. **Register/Login**: Create an account or login
2. **Admin Flow**:
   - Create questions in "Manage Questions"
   - Create exams by selecting questions
   - View all student results
3. **Student Flow**:
   - View available exams in dashboard
   - Take exam (timer counts down)
   - View results with correct/incorrect answers

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React, React Router, Axios, Bootstrap
- **Database**: MongoDB Atlas

## Notes

- JWT tokens are stored in localStorage
- Passwords are hashed using bcryptjs
- Exam timer automatically submits when time runs out
- Students can only take each exam once
- Admin can view all results, students see only their own
