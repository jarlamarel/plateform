# Script de correction des ports pour Windows
Write-Host "🔧 Correction des ports des services" -ForegroundColor Green

# Créer le fichier .env correct pour le frontend
Write-Host "`n📝 Création du fichier .env correct..." -ForegroundColor Blue
$frontendEnvContent = @"
# Variables d'environnement pour le frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_CONTENT_API_URL=http://localhost:3003/api
REACT_APP_PAYMENT_API_URL=http://localhost:3004/api
REACT_APP_NOTIFICATION_API_URL=http://localhost:3005/api
REACT_APP_DATABASE_API_URL=http://localhost:3006/api
REACT_APP_METRICS_API_URL=http://localhost:3007/api

# Variables pour le développement local
NODE_ENV=development
PORT=3000
"@

# Sauvegarder le fichier .env
$frontendEnvContent | Out-File -FilePath "frontend-service\.env" -Encoding UTF8
Write-Host "✅ Fichier .env créé avec les bons ports" -ForegroundColor Green

Write-Host "`n📋 Configuration des ports:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Auth Service: http://localhost:3001" -ForegroundColor White
Write-Host "Content Service: http://localhost:3003" -ForegroundColor White
Write-Host "Payment Service: http://localhost:3004" -ForegroundColor White
Write-Host "Notification Service: http://localhost:3005" -ForegroundColor White
Write-Host "Database Service: http://localhost:3006" -ForegroundColor White
Write-Host "Metrics Service: http://localhost:3007" -ForegroundColor White

Write-Host "`n🔄 Redémarrez votre frontend avec: npm start" -ForegroundColor Green
Write-Host "Les cours devraient maintenant apparaître !" -ForegroundColor Green

Read-Host "`nAppuyez sur Entrée pour continuer..."

