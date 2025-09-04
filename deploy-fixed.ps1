# Script de déploiement corrigé pour Windows
Write-Host "🚀 Déploiement Vercel - Version Corrigée" -ForegroundColor Green

# Vérifier Vercel CLI
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI trouvé: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI non trouvé. Installez-le avec: npm install -g vercel" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit
}

# Demander les variables d'environnement
Write-Host "`n📝 Configuration des variables d'environnement:" -ForegroundColor Yellow
$mongodbUri = Read-Host "MongoDB URI"
$jwtSecret = Read-Host "JWT Secret"

# Créer le fichier .env pour le frontend
Write-Host "`n📝 Création du fichier .env pour le frontend..." -ForegroundColor Blue
$frontendEnvContent = @"
# Variables d'environnement pour le frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_CONTENT_API_URL=http://localhost:3002/api
REACT_APP_PAYMENT_API_URL=http://localhost:3003/api
REACT_APP_NOTIFICATION_API_URL=http://localhost:3004/api
REACT_APP_DATABASE_API_URL=http://localhost:3005/api
REACT_APP_METRICS_API_URL=http://localhost:3006/api

# Variables pour le développement local
NODE_ENV=development
PORT=3000
"@

# Sauvegarder le fichier .env
$frontendEnvContent | Out-File -FilePath "frontend-service\.env" -Encoding UTF8
Write-Host "✅ Fichier .env créé pour le frontend" -ForegroundColor Green

# Services à déployer
$services = @(
    "frontend-service",
    "auth-service", 
    "content-service",
    "payment-service",
    "notification-service",
    "database-service",
    "metrics-service"
)

# Déployer chaque service
foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "`n🚀 Déploiement de $service..." -ForegroundColor Blue
        
        # Aller dans le dossier du service
        Push-Location $service
        
        try {
            # Déployer
            vercel --prod --yes
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $service déployé avec succès!" -ForegroundColor Green
                
                # Configurer les variables d'environnement pour les services backend
                if ($service -ne "frontend-service") {
                    Write-Host "📝 Configuration des variables pour $service..." -ForegroundColor Yellow
                    
                    # Variables communes pour les services backend
                    vercel env add MONGODB_URI production $mongodbUri
                    vercel env add JWT_SECRET production $jwtSecret
                    
                    # Variables spécifiques selon le service
                    switch ($service) {
                        "auth-service" {
                            vercel env add SESSION_SECRET production $jwtSecret
                        }
                        "content-service" {
                            vercel env add UPLOAD_PATH production "/tmp/uploads"
                            vercel env add MAX_FILE_SIZE production "100000000"
                        }
                    }
                    
                    Write-Host "✅ Variables configurées pour $service" -ForegroundColor Green
                }
            } else {
                Write-Host "❌ Erreur lors du déploiement de $service" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Erreur: $_" -ForegroundColor Red
        }
        
        # Retourner au dossier parent
        Pop-Location
    } else {
        Write-Host "⚠️ Service $service non trouvé, ignoré" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Aller sur https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Mettre à jour les URLs des APIs dans les variables d'environnement" -ForegroundColor White
Write-Host "3. Tester vos applications" -ForegroundColor White

Read-Host "`nAppuyez sur Entrée pour continuer..."

