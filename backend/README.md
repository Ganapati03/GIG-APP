# GigFlow Backend

Production-ready backend for **GigFlow** - A mini freelance marketplace platform.

## 🎯 Features

### Core Functionality
- ✅ **Fluid User Roles** - Any user can post gigs (Client) or bid on gigs (Freelancer)
- ✅ **JWT Authentication** - Secure HttpOnly cookie-based authentication
- ✅ **MongoDB Transactions** - Atomic hiring operations to prevent race conditions
- ✅ **Real-time Notifications** - Socket.io powered instant notifications
- ✅ **AI Chatbot** - Gemini-powered assistant for freelancers

### Security
- 🔒 Password hashing with bcrypt
- 🔒 JWT tokens in HttpOnly cookies (not exposed to JavaScript)
- 🔒 Authorization checks at backend level
- 🔒 Input validation and sanitization
- 🔒 CORS protection

### Architecture
- 📁 Clean MVC structure
- 📁 Centralized error handling
- 📁 Modular route organization
- 📁 Reusable middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas with replica set)
- Google Gemini API key

### Installation

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
SOCKET_CORS_ORIGIN=http://localhost:5173
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Cookie: token=<jwt_token>
```

#### Logout
```http
POST /api/auth/logout
Cookie: token=<jwt_token>
```

### Gig Endpoints

#### Get All Open Gigs
```http
GET /api/gigs?search=web&category=Development&minBudget=100&maxBudget=500&sort=budget_desc
```

#### Get Single Gig
```http
GET /api/gigs/:id
```

#### Create Gig (Protected)
```http
POST /api/gigs
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "title": "Build a React Website",
  "description": "Need a modern React website with responsive design",
  "budget": 500,
  "category": "Web Development",
  "deadline": "2026-02-01"
}
```

#### Get My Posted Gigs (Protected)
```http
GET /api/gigs/my/posted
Cookie: token=<jwt_token>
```

#### Delete Gig (Protected)
```http
DELETE /api/gigs/:id
Cookie: token=<jwt_token>
```

### Bid Endpoints

#### Submit Bid (Protected)
```http
POST /api/bids
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "gigId": "507f1f77bcf86cd799439011",
  "message": "I can build this website with React and Tailwind CSS",
  "price": 450,
  "deliveryTime": 7
}
```

#### Get Bids for Gig (Protected - Owner Only)
```http
GET /api/bids/:gigId
Cookie: token=<jwt_token>
```

#### Get My Submitted Bids (Protected)
```http
GET /api/bids/my/submitted
Cookie: token=<jwt_token>
```

#### Hire Freelancer (Protected - Atomic Transaction)
```http
PATCH /api/bids/:bidId/hire
Cookie: token=<jwt_token>
```

### Chatbot Endpoints (AI-Powered)

#### Chat with AI Assistant (Protected)
```http
POST /api/chatbot
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "message": "How do I write a good bid proposal?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help you today?" }
  ]
}
```

#### Get Bid Proposal Suggestion (Protected)
```http
POST /api/chatbot/suggest-bid
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "gigTitle": "Build a React Website",
  "gigDescription": "Need a modern website...",
  "gigBudget": 500,
  "userSkills": ["React", "Node.js", "MongoDB"]
}
```

#### Analyze Gig Opportunity (Protected)
```http
POST /api/chatbot/analyze-gig
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "gigTitle": "Build a React Website",
  "gigDescription": "Need a modern website...",
  "gigBudget": 500,
  "userSkills": ["React", "Node.js"]
}
```

## 🔌 Socket.io Events

### Client → Server

#### Join User Room
```javascript
socket.emit('join', userId);
```

### Server → Client

#### Hire Notification
```javascript
socket.on('hired', (data) => {
  // data = { message, gigId, timestamp }
  console.log(data.message); // "You have been hired for [Gig Title]!"
});
```

## 🗄️ Database Models

### User
- name (String, required)
- email (String, unique, required)
- password (String, hashed, required)
- bio (String)
- skills (Array of Strings)
- rating (Number, 0-5)
- completedGigs (Number)

### Gig
- title (String, required)
- description (String, required)
- budget (Number, required)
- ownerId (ObjectId → User)
- status (enum: 'open', 'assigned')
- category (String)
- deadline (Date)
- hiredFreelancerId (ObjectId → User)

### Bid
- gigId (ObjectId → Gig)
- freelancerId (ObjectId → User)
- message (String, required)
- price (Number, required)
- status (enum: 'pending', 'hired', 'rejected')
- deliveryTime (Number, in days)

## 🔐 Authorization Rules

1. Users can only manage gigs they own
2. Users cannot bid on their own gigs
3. Only gig owners can view bids for their gigs
4. Only gig owners can hire freelancers
5. A gig can only be hired once (enforced via transactions)

## 🚢 Deployment

### MongoDB Atlas Setup (Required for Transactions)

1. Create a MongoDB Atlas account
2. Create a new cluster (M0 free tier works)
3. Get your connection string
4. Update `MONGO_URI` in `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
```

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy!

**Build Command:** `npm install`  
**Start Command:** `npm start`

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Validation:** express-validator

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `SOCKET_CORS_ORIGIN` | Socket.io CORS origin | Yes |

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for GigFlow
