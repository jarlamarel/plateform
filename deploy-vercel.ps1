# 🚀 Script de Déploiement Automatisé sur Vercel pour Windows (PowerShell)
# Usage: .\deploy-vercel.ps1

param(
    [string]$MongoDBUri = "",
    [string]$JwtSecret = "",
    [string]$FrontendUrl = "",
    [string]$StripeSecretKey = "",
    [string]$StripeWebhookSecret = ""
)

# Configuration des couleurs
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Blue"
$White = "White"

# Fonctions pour afficher les messages
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor $Blue
}

# Vérification des prérequis
function Test-Prerequisites {
    Write-Step "Vérification des prérequis..."
    
    # Vérifier si Vercel CLI est installé
    try {
        $vercelVersion = vercel --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Vercel CLI not found"
        }
        Write-Info "Vercel CLI trouvé: $vercelVersion"
    }
    catch {
        Write-Error "Vercel CLI n'est pas installé. Installez-le avec: npm i -g vercel"
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
    
    # Vérifier si git est installé
    try {
        $gitVersion = git --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Git not found"
        }
        Write-Info "Git trouvé: $gitVersion"
    }
    catch {
        Write-Error "Git n'est pas installé"
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
    
    Write-Info "Prérequis vérifiés ✓"
}

# Configuration des variables d'environnement
function Set-EnvironmentVariables {
    Write-Step "Configuration des variables d'environnement..."
    
    # Demander les variables si elles ne sont pas fournies en paramètres
    if ([string]::IsNullOrEmpty($MongoDBUri)) {
        $script:MongoDBUri = Read-Host "MongoDB URI"
    }
    
    if ([string]::IsNullOrEmpty($JwtSecret)) {
        $script:JwtSecret = Read-Host "JWT Secret"
    }
    
    if ([string]::IsNullOrEmpty($FrontendUrl)) {
        $script:FrontendUrl = Read-Host "Frontend URL"
    }
    
    if ([string]::IsNullOrEmpty($StripeSecretKey)) {
        $script:StripeSecretKey = Read-Host "Stripe Secret Key (optionnel)"
    }
    
    if ([string]::IsNullOrEmpty($StripeWebhookSecret)) {
        $script:StripeWebhookSecret = Read-Host "Stripe Webhook Secret (optionnel)"
    }
    
    Write-Info "Variables d'environnement configurées ✓"
}

# Déploiement du frontend
function Deploy-Frontend {
    Write-Step "Déploiement du frontend..."
    
    Push-Location "frontend-service"
    
    try {
        # Configuration Vercel pour le frontend
        $vercelConfig = @{
            version = 2
            builds = @(
                @{
                    src = "package.json"
                    use = "@vercel/static-build"
                    config = @{
                        distDir = "build"
                    }
                }
            )
            routes = @(
                @{
                    src = "/static/(.*)"
                    dest = "/static/`$1"
                }
                @{
                    src = "/(.*)"
                    dest = "/index.html"
                }
            )
            env = @{
                REACT_APP_API_URL = $FrontendUrl
            }
        }
        
        $vercelConfig | ConvertTo-Json -Depth 10 | Set-Content "vercel.json"
        
        # Déploiement
        vercel --prod --yes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Frontend déployé ✓"
        } else {
            Write-Error "Erreur lors du déploiement du frontend"
        }
    }
    catch {
        Write-Error "Erreur lors du déploiement du frontend: $_"
    }
    finally {
        Pop-Location
    }
}

# Déploiement d'un service backend
function Deploy-BackendService {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Step "Déploiement de $ServiceName..."
    
    Push-Location $ServicePath
    
    try {
        # Déploiement
        vercel --prod --yes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "$ServiceName déployé ✓"
        } else {
            Write-Error "Erreur lors du déploiement de $ServiceName"
        }
    }
    catch {
        Write-Error "Erreur lors du déploiement de $ServiceName: $_"
    }
    finally {
        Pop-Location
    }
}

# Déploiement de tous les services backend
function Deploy-BackendServices {
    Write-Step "Déploiement des services backend..."
    
    $services = @(
        @{ Name = "auth-service"; Path = "auth-service" },
        @{ Name = "content-service"; Path = "content-service" },
        @{ Name = "payment-service"; Path = "payment-service" },
        @{ Name = "notification-service"; Path = "notification-service" },
        @{ Name = "database-service"; Path = "database-service" },
        @{ Name = "metrics-service"; Path = "metrics-service" }
    )
    
    foreach ($service in $services) {
        if (Test-Path $service.Path) {
            Deploy-BackendService -ServiceName $service.Name -ServicePath $service.Path
        } else {
            Write-Warning "Service $($service.Name) non trouvé, ignoré"
        }
    }
    
    Write-Info "Tous les services backend déployés ✓"
}

# Configuration des variables d'environnement pour chaque service
function Set-ServiceEnvironmentVariables {
    param([string]$ServiceName)
    
    Write-Step "Configuration des variables d'environnement pour $ServiceName..."
    
    try {
        # Variables communes
        vercel env add MONGODB_URI production $MongoDBUri --scope $ServiceName
        vercel env add JWT_SECRET production $JwtSecret --scope $ServiceName
        vercel env add FRONTEND_URL production $FrontendUrl --scope $ServiceName
        
        # Variables spécifiques selon le service
        switch ($ServiceName) {
            "auth-service" {
                vercel env add SESSION_SECRET production $JwtSecret --scope $ServiceName
            }
            "payment-service" {
                if (-not [string]::IsNullOrEmpty($StripeSecretKey)) {
                    vercel env add STRIPE_SECRET_KEY production $StripeSecretKey --scope $ServiceName
                }
                if (-not [string]::IsNullOrEmpty($StripeWebhookSecret)) {
                    vercel env add STRIPE_WEBHOOK_SECRET production $StripeWebhookSecret --scope $ServiceName
                }
            }
            "content-service" {
                vercel env add UPLOAD_PATH production "/tmp/uploads" --scope $ServiceName
                vercel env add MAX_FILE_SIZE production "100000000" --scope $ServiceName
            }
        }
        
        Write-Info "Variables d'environnement configurées pour $ServiceName ✓"
    }
    catch {
        Write-Error "Erreur lors de la configuration des variables pour $ServiceName: $_"
    }
}

# Test des endpoints
function Test-Endpoints {
    Write-Step "Test des endpoints..."
    
    try {
        # Récupérer les URLs des services déployés
        $vercelList = vercel ls 2>$null | Out-String
        
        $frontendUrl = ($vercelList -split "`n" | Where-Object { $_ -match "frontend-service" } | ForEach-Object { ($_ -split "\s+")[1] })[0]
        $authUrl = ($vercelList -split "`n" | Where-Object { $_ -match "auth-service" } | ForEach-Object { ($_ -split "\s+")[1] })[0]
        $contentUrl = ($vercelList -split "`n" | Where-Object { $_ -match "content-service" } | ForEach-Object { ($_ -split "\s+")[1] })[0]
        
        # Tests de santé
        Write-Host "Test des endpoints de santé..." -ForegroundColor $White
        
        if (-not [string]::IsNullOrEmpty($authUrl)) {
            try {
                $response = Invoke-RestMethod -Uri "$authUrl/api/health" -Method Get -TimeoutSec 10
                Write-Info "Auth service health check passed ✓"
            }
            catch {
                Write-Warning "Auth service health check failed"
            }
        }
        
        if (-not [string]::IsNullOrEmpty($contentUrl)) {
            try {
                $response = Invoke-RestMethod -Uri "$contentUrl/api/health" -Method Get -TimeoutSec 10
                Write-Info "Content service health check passed ✓"
            }
            catch {
                Write-Warning "Content service health check failed"
            }
        }
        
        Write-Info "Tests terminés ✓"
    }
    catch {
        Write-Warning "Erreur lors des tests: $_"
    }
}

# Affichage des URLs finales
function Show-FinalUrls {
    Write-Step "URLs des services déployés:"
    
    try {
        $vercelList = vercel ls 2>$null | Out-String
        
        Write-Host ""
        Write-Host "🌐 Frontend: $($vercelList -split "`n" | Where-Object { $_ -match "frontend-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "🔐 Auth Service: $($vercelList -split "`n" | Where-Object { $_ -match "auth-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "📚 Content Service: $($vercelList -split "`n" | Where-Object { $_ -match "content-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "💳 Payment Service: $($vercelList -split "`n" | Where-Object { $_ -match "payment-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "🔔 Notification Service: $($vercelList -split "`n" | Where-Object { $_ -match "notification-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "🗄️ Database Service: $($vercelList -split "`n" | Where-Object { $_ -match "database-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host "📊 Metrics Service: $($vercelList -split "`n" | Where-Object { $_ -match "metrics-service" } | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)" -ForegroundColor $White
        Write-Host ""
        
        Write-Info "Déploiement terminé avec succès! 🎉"
    }
    catch {
        Write-Warning "Erreur lors de la récupération des URLs: $_"
    }
}

# Fonction principale
function Main {
    Write-Host "🚀 Script de Déploiement Vercel - Plateforme de Cours" -ForegroundColor $Blue
    Write-Host "=================================================" -ForegroundColor $Blue
    Write-Host ""
    
    Test-Prerequisites
    Set-EnvironmentVariables
    Deploy-Frontend
    Deploy-BackendServices
    Test-Endpoints
    Show-FinalUrls
    
    Read-Host "Appuyez sur Entrée pour continuer..."
}

# Exécution du script
Main

