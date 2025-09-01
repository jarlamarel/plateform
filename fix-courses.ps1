# Script de correction pour les cours
Write-Host "🔧 Correction du problème des cours" -ForegroundColor Green

# Créer le fichier .env correct pour le frontend
Write-Host "`n📝 Création du fichier .env..." -ForegroundColor Blue
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
Write-Host "✅ Fichier .env créé" -ForegroundColor Green

Write-Host "`n🔧 Service des cours déjà corrigé !" -ForegroundColor Green
Write-Host "   - API_URL pointe maintenant vers localhost:3003/api" -ForegroundColor White

Write-Host "`n📋 Configuration finale:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Content Service: http://localhost:3003/api" -ForegroundColor White

Write-Host "`n🔄 Redémarrez votre frontend avec: npm start" -ForegroundColor Green
Write-Host "Les cours devraient maintenant s'afficher !" -ForegroundColor Green

Read-Host "`nAppuyez sur Entrée pour continuer..."
