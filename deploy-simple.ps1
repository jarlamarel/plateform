# Script de déploiement simple pour Windows
Write-Host "🚀 Déploiement Vercel - Mode Simple" -ForegroundColor Green

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
Write-Host "2. Configurer les variables d'environnement pour chaque projet" -ForegroundColor White
Write-Host "3. Tester vos applications" -ForegroundColor White

Read-Host "`nAppuyez sur Entrée pour continuer..."
