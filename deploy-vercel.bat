@echo off
REM 🚀 Script de Déploiement Automatisé sur Vercel pour Windows
REM Usage: deploy-vercel.bat

echo 🚀 Démarrage du déploiement sur Vercel...

REM Couleurs pour les messages (Windows 10+)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

REM Fonction pour afficher les messages
:print_message
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_step
echo %BLUE%[STEP]%NC% %~1
goto :eof

REM Vérification des prérequis
:check_prerequisites
call :print_step "Vérification des prérequis..."

REM Vérifier si Vercel CLI est installé
vercel --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Vercel CLI n'est pas installé. Installez-le avec: npm i -g vercel"
    pause
    exit /b 1
)

REM Vérifier si git est installé
git --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Git n'est pas installé"
    pause
    exit /b 1
)

call :print_message "Prérequis vérifiés ✓"
goto :eof

REM Configuration des variables d'environnement
:setup_environment
call :print_step "Configuration des variables d'environnement..."

set /p MONGODB_URI="MongoDB URI: "
set /p JWT_SECRET="JWT Secret: "
set /p FRONTEND_URL="Frontend URL: "

REM Variables optionnelles
set /p STRIPE_SECRET_KEY="Stripe Secret Key (optionnel): "
set /p STRIPE_WEBHOOK_SECRET="Stripe Webhook Secret (optionnel): "

call :print_message "Variables d'environnement configurées ✓"
goto :eof

REM Déploiement du frontend
:deploy_frontend
call :print_step "Déploiement du frontend..."

cd frontend-service

REM Configuration Vercel pour le frontend
echo {> vercel.json
echo   "version": 2,>> vercel.json
echo   "builds": [>> vercel.json
echo     {>> vercel.json
echo       "src": "package.json",>> vercel.json
echo       "use": "@vercel/static-build",>> vercel.json
echo       "config": {>> vercel.json
echo         "distDir": "build">> vercel.json
echo       }>> vercel.json
echo     }>> vercel.json
echo   ],>> vercel.json
echo   "routes": [>> vercel.json
echo     {>> vercel.json
echo       "src": "/static/(.*)",>> vercel.json
echo       "dest": "/static/$1">> vercel.json
echo     },>> vercel.json
echo     {>> vercel.json
echo       "src": "/(.*)",>> vercel.json
echo       "dest": "/index.html">> vercel.json
echo     }>> vercel.json
echo   ],>> vercel.json
echo   "env": {>> vercel.json
echo     "REACT_APP_API_URL": "%FRONTEND_URL%">> vercel.json
echo   }>> vercel.json
echo }>> vercel.json

REM Déploiement
vercel --prod --yes

cd ..
call :print_message "Frontend déployé ✓"
goto :eof

REM Déploiement d'un service backend
:deploy_backend_service
set service_name=%~1
set service_path=%~2

call :print_step "Déploiement de %service_name%..."

cd %service_path%

REM Déploiement
vercel --prod --yes

cd ..
call :print_message "%service_name% déployé ✓"
goto :eof

REM Déploiement de tous les services backend
:deploy_backend_services
call :print_step "Déploiement des services backend..."

REM Services à déployer
if exist "auth-service" (
    call :deploy_backend_service "auth-service" "auth-service"
) else (
    call :print_warning "Service auth-service non trouvé, ignoré"
)

if exist "content-service" (
    call :deploy_backend_service "content-service" "content-service"
) else (
    call :print_warning "Service content-service non trouvé, ignoré"
)

if exist "payment-service" (
    call :deploy_backend_service "payment-service" "payment-service"
) else (
    call :print_warning "Service payment-service non trouvé, ignoré"
)

if exist "notification-service" (
    call :deploy_backend_service "notification-service" "notification-service"
) else (
    call :print_warning "Service notification-service non trouvé, ignoré"
)

if exist "database-service" (
    call :deploy_backend_service "database-service" "database-service"
) else (
    call :print_warning "Service database-service non trouvé, ignoré"
)

if exist "metrics-service" (
    call :deploy_backend_service "metrics-service" "metrics-service"
) else (
    call :print_warning "Service metrics-service non trouvé, ignoré"
)

call :print_message "Tous les services backend déployés ✓"
goto :eof

REM Configuration des variables d'environnement pour chaque service
:configure_service_env
set service_name=%~1

call :print_step "Configuration des variables d'environnement pour %service_name%..."

REM Variables communes
vercel env add MONGODB_URI production "%MONGODB_URI%" --scope %service_name%
vercel env add JWT_SECRET production "%JWT_SECRET%" --scope %service_name%
vercel env add FRONTEND_URL production "%FRONTEND_URL%" --scope %service_name%

REM Variables spécifiques selon le service
if "%service_name%"=="auth-service" (
    vercel env add SESSION_SECRET production "%JWT_SECRET%" --scope %service_name%
)

if "%service_name%"=="payment-service" (
    if not "%STRIPE_SECRET_KEY%"=="" (
        vercel env add STRIPE_SECRET_KEY production "%STRIPE_SECRET_KEY%" --scope %service_name%
    )
    if not "%STRIPE_WEBHOOK_SECRET%"=="" (
        vercel env add STRIPE_WEBHOOK_SECRET production "%STRIPE_WEBHOOK_SECRET%" --scope %service_name%
    )
)

if "%service_name%"=="content-service" (
    vercel env add UPLOAD_PATH production "/tmp/uploads" --scope %service_name%
    vercel env add MAX_FILE_SIZE production "100000000" --scope %service_name%
)

call :print_message "Variables d'environnement configurées pour %service_name% ✓"
goto :eof

REM Test des endpoints
:test_endpoints
call :print_step "Test des endpoints..."

REM Récupérer les URLs des services déployés
for /f "tokens=2" %%i in ('vercel ls ^| findstr frontend-service') do set FRONTEND_URL=%%i
for /f "tokens=2" %%i in ('vercel ls ^| findstr auth-service') do set AUTH_URL=%%i
for /f "tokens=2" %%i in ('vercel ls ^| findstr content-service') do set CONTENT_URL=%%i

REM Tests de santé
echo Test des endpoints de santé...

if not "%AUTH_URL%"=="" (
    curl -s "%AUTH_URL%/api/health" >nul 2>&1
    if errorlevel 1 (
        call :print_warning "Auth service health check failed"
    ) else (
        call :print_message "Auth service health check passed ✓"
    )
)

if not "%CONTENT_URL%"=="" (
    curl -s "%CONTENT_URL%/api/health" >nul 2>&1
    if errorlevel 1 (
        call :print_warning "Content service health check failed"
    ) else (
        call :print_message "Content service health check passed ✓"
    )
)

call :print_message "Tests terminés ✓"
goto :eof

REM Affichage des URLs finales
:show_final_urls
call :print_step "URLs des services déployés:"

echo.
echo 🌐 Frontend: %FRONTEND_URL%
echo 🔐 Auth Service: %AUTH_URL%
echo 📚 Content Service: %CONTENT_URL%

for /f "tokens=2" %%i in ('vercel ls ^| findstr payment-service') do echo 💳 Payment Service: %%i
for /f "tokens=2" %%i in ('vercel ls ^| findstr notification-service') do echo 🔔 Notification Service: %%i
for /f "tokens=2" %%i in ('vercel ls ^| findstr database-service') do echo 🗄️ Database Service: %%i
for /f "tokens=2" %%i in ('vercel ls ^| findstr metrics-service') do echo 📊 Metrics Service: %%i

echo.
call :print_message "Déploiement terminé avec succès! 🎉"
goto :eof

REM Fonction principale
:main
echo 🚀 Script de Déploiement Vercel - Plateforme de Cours
echo ==================================================
echo.

call :check_prerequisites
call :setup_environment
call :deploy_frontend
call :deploy_backend_services
call :test_endpoints
call :show_final_urls

pause
goto :eof

REM Exécution du script
call :main

