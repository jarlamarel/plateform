# Script de correction pour le problème de paiement
Write-Host "🔧 Correction du problème de paiement" -ForegroundColor Green

# Créer le fichier .env correct pour le frontend
Write-Host "`n📝 Création du fichier .env..." -ForegroundColor Blue
$frontendEnvContent = @"
# Variables d'environnement pour le frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_CONTENT_API_URL=http://localhost:3003/api
REACT_APP_PAYMENT_API_URL=http://localhost:3005/api
REACT_APP_NOTIFICATION_API_URL=http://localhost:3006/api
REACT_APP_DATABASE_API_URL=http://localhost:3007/api
REACT_APP_METRICS_API_URL=http://localhost:3008/api

# Variables pour le développement local
NODE_ENV=development
PORT=3000
"@

# Sauvegarder le fichier .env
$frontendEnvContent | Out-File -FilePath "frontend-service\.env" -Encoding UTF8
Write-Host "✅ Fichier .env créé" -ForegroundColor Green

Write-Host "`n🔧 Service de paiement corrigé !" -ForegroundColor Green
Write-Host "   - Routes corrigées pour utiliser /payments/intent" -ForegroundColor White
Write-Host "   - Payment API pointe vers localhost:3005/api" -ForegroundColor White

Write-Host "`n📋 Configuration finale:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Payment Service: http://localhost:3005/api" -ForegroundColor White

Write-Host "`n🚀 Instructions:" -ForegroundColor Green
Write-Host "1. Démarrer le payment-service: cd payment-service && npm start" -ForegroundColor White
Write-Host "2. Redémarrer le frontend: cd frontend-service && npm start" -ForegroundColor White
Write-Host "3. Les paiements devraient maintenant fonctionner !" -ForegroundColor White

Read-Host "`nAppuyez sur Entrée pour continuer..."
