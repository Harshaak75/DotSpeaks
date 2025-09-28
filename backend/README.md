# Project Management System Backend

## Overview
This is the backend API for the Role-Based Project Management System. It provides REST endpoints for different user roles including COO, CEO, CTO, etc.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### COO Endpoints
- `GET /api/coo/profile` - Get COO profile information
- `PUT /api/coo/profile` - Update COO profile
- `GET /api/coo/attendance` - Get attendance records and leave summary
- `GET /api/coo/goals/company` - Get company-wide goals
- `GET /api/coo/goals/department?department=Operations` - Get department-specific goals
- `POST /api/coo/goals/department` - Create new department goal
- `GET /api/coo/reports` - Get reports list
- `POST /api/coo/reports` - Upload new report
- `GET /api/coo/calendar` - Get meeting calendar
- `POST /api/coo/calendar` - Schedule new meeting
- `GET /api/coo/documents` - Get legal documents list
- `GET /api/coo/tutorials` - Get training tutorials
- `GET /api/coo/team-members` - Get team members reporting to COO

## Project Structure
```
backend/
├── server.js          # Main server file
├── routes/
│   └── coo.js         # COO-specific routes
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
└── README.md         # This file
```

## Future Enhancements
- Add authentication middleware
- Implement database integration
- Add validation for request bodies
- Implement file upload for reports
- Add logging and error handling
- Create routes for other roles (CEO, CTO, etc.)

## Technologies Used
- Node.js
- Express.js
- CORS for cross-origin requests
- dotenv for environment variables