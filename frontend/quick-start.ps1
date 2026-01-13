# GigFlow Quick Start Script

Write-Host "🚀 GigFlow Quick Start" -ForegroundColor Cyan
Write-Host "=" * 60

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional)
Write-Host "`n🗄️  Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB not detected. You can use MongoDB Atlas instead." -ForegroundColor Yellow
}

# Check backend .env
Write-Host "`n🔧 Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend\.env - Please edit with your API keys!" -ForegroundColor Green
}

# Check frontend .env
Write-Host "`n🔧 Checking frontend configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env" -ForegroundColor Green
}

# Install frontend dependencies if needed
Write-Host "`n📦 Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules\socket.io-client") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing socket.io-client..." -ForegroundColor Yellow
    npm install socket.io-client
}

Write-Host "`n" + "=" * 60
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your GEMINI_API_KEY" -ForegroundColor White
Write-Host "2. Start backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "3. Start frontend: npm run dev (in new terminal)" -ForegroundColor White
Write-Host "`n🌐 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`n📚 See SETUP_GUIDE.md for detailed instructions" -ForegroundColor Yellow
Write-Host "=" * 60
