# GigFlow Backend Setup Script

Write-Host "🚀 GigFlow Backend Setup" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled" -ForegroundColor Yellow
        exit
    }
}

# Copy .env.example to .env
Copy-Item ".env.example" ".env"
Write-Host "✅ Created .env file from template" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Please configure the following in your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. MONGO_URI - Your MongoDB connection string"
Write-Host "   Local: mongodb://localhost:27017/gigflow"
Write-Host "   Atlas: mongodb+srv://username:password@cluster.mongodb.net/gigflow"
Write-Host ""
Write-Host "2. JWT_SECRET - A secure random string (min 32 characters)"
Write-Host "   Current: gigflow_super_secret_jwt_key_change_this_in_production_2026"
Write-Host ""
Write-Host "3. GEMINI_API_KEY - Your Google Gemini API key"
Write-Host "   Get it from: https://makersuite.google.com/app/apikey"
Write-Host ""
Write-Host "4. CLIENT_URL - Your frontend URL (default: http://localhost:5173)"
Write-Host ""
Write-Host "=" * 50
Write-Host "✅ Setup complete! Edit backend/.env to configure your environment" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your configuration"
Write-Host "2. Run 'npm run dev' to start the development server"
Write-Host "3. The server will run on http://localhost:5000"
