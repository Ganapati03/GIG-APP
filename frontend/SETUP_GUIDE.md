# 🚀 GigFlow - Complete Setup Guide

## Project Structure

```
Dark Mode Light Mode Support/
├── backend/                    # Node.js + Express Backend
│   ├── config/                # Database & Socket.io config
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth & error handling
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── .env                   # Environment variables (create this)
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── server.js              # Entry point
├── src/                       # React Frontend
│   ├── app/components/        # UI components
│   ├── lib/                   # API client & utilities
│   └── ...
├── .env.example               # Frontend env template
└── package.json               # Frontend dependencies
```

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or Atlas)
3. **Google Gemini API Key** - Get from: https://makersuite.google.com/app/apikey

## 🔧 Setup Instructions

### Step 1: Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Install dependencies (already done)
npm install

# Create .env file from template
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

**Required .env variables:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=gigflow_super_secret_jwt_key_change_this_in_production_2026
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_actual_gemini_api_key_here
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Step 2: MongoDB Setup

**Option A: Local MongoDB**
```powershell
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# MongoDB will run on mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Recommended for Production)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGO_URI` in backend/.env:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
   ```

### Step 3: Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to backend/.env:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key
   ```

### Step 4: Frontend Setup

```powershell
# Navigate back to root
cd ..

# Install socket.io-client
npm install

# Create frontend .env file
copy .env.example .env
```

**Frontend .env:**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Running the Application

### Terminal 1: Start Backend

```powershell
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
✅ Socket.io initialized
🚀 GigFlow Backend Server
📡 Server running on port 5000
```

### Terminal 2: Start Frontend

```powershell
# From root directory
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

## 🧪 Testing the Integration

### 1. Test Backend Health

Open browser: http://localhost:5000/api/health

Should return:
```json
{
  "success": true,
  "message": "GigFlow API is running",
  "timestamp": "2026-01-11T...",
  "environment": "development"
}
```

### 2. Test Authentication

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

### 3. Test Frontend

1. Open http://localhost:5173
2. You should see the login page
3. Register a new account
4. After login, you should see the GigFlow dashboard

### 4. Test AI Chatbot

1. Click the floating bot icon (bottom right)
2. Ask: "How do I write a winning bid?"
3. You should get an AI-powered response from Gemini

## 🔗 API Integration Points

### Authentication
- ✅ Login: `POST /api/auth/login`
- ✅ Register: `POST /api/auth/register`
- ✅ Get User: `GET /api/auth/me`
- ✅ Logout: `POST /api/auth/logout`

### Gigs
- ✅ Get All: `GET /api/gigs`
- ✅ Create: `POST /api/gigs`
- ✅ Get My Posted: `GET /api/gigs/my/posted`

### Bids
- ✅ Submit Bid: `POST /api/bids`
- ✅ Get Bids: `GET /api/bids/:gigId`
- ✅ Hire: `PATCH /api/bids/:bidId/hire`

### AI Chatbot
- ✅ Chat: `POST /api/chatbot`
- ✅ Suggest Bid: `POST /api/chatbot/suggest-bid`
- ✅ Analyze Gig: `POST /api/chatbot/analyze-gig`

## 🎯 Features Integrated

### ✅ Backend Features
- [x] JWT Authentication with HttpOnly cookies
- [x] MongoDB with Mongoose
- [x] Transaction-based hiring (prevents race conditions)
- [x] Socket.io for real-time notifications
- [x] Gemini AI chatbot integration
- [x] Clean MVC architecture
- [x] Centralized error handling
- [x] Input validation

### ✅ Frontend Features
- [x] Real authentication (no more mock data)
- [x] API client with cookie support
- [x] AI-powered chatbot
- [x] Socket.io client ready
- [x] Environment configuration

## 🔧 Troubleshooting

### Backend won't start
```powershell
# Check if MongoDB is running
mongosh

# Check if port 5000 is available
netstat -ano | findstr :5000

# Check .env file exists
dir backend\.env
```

### Frontend can't connect to backend
```powershell
# Verify backend is running
curl http://localhost:5000/api/health

# Check CORS settings in backend/.env
# CLIENT_URL should match frontend URL
```

### Chatbot not working
1. Verify `GEMINI_API_KEY` in backend/.env
2. Check backend console for API errors
3. Test API key: https://aistudio.google.com/app/apikey

### MongoDB connection failed
```
# For local MongoDB
net start MongoDB

# For Atlas, check:
# 1. Whitelist your IP address
# 2. Correct username/password
# 3. Connection string format
```

## 📚 Next Steps

### To integrate more components:

1. **Update GigFeed** to fetch from API:
```typescript
import { gigAPI } from "../../lib/api";

const { gigs } = await gigAPI.getAll({ search: "react" });
```

2. **Update ClientDashboard** to post gigs:
```typescript
import { gigAPI } from "../../lib/api";

await gigAPI.create({ title, description, budget });
```

3. **Update BidDialog** to submit bids:
```typescript
import { bidAPI } from "../../lib/api";

await bidAPI.create({ gigId, message, price, deliveryTime });
```

4. **Add Socket.io notifications**:
```typescript
import { socketService } from "../../lib/socket";

// In your component
useEffect(() => {
  socketService.connect(user.id);
  
  socketService.on('hired', (data) => {
    toast.success(data.message);
  });
}, [user]);
```

## 🚢 Deployment

### Backend (Render)
1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables
4. Deploy!

### Frontend (Vercel)
1. Push to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy!

## 📞 Support

- Backend API Docs: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB: mongodb://localhost:27017

---

**🎉 You're all set! Your GigFlow app now has:**
- ✅ Real backend API
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ AI-powered chatbot
- ✅ Real-time notifications
- ✅ Production-ready architecture
