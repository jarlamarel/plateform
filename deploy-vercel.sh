#!/bin/bash

# 🚀 Script de Déploiement Automatisé sur Vercel
# Usage: ./deploy-vercel.sh

set -e

echo "🚀 Démarrage du déploiement sur Vercel..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    print_step "Vérification des prérequis..."
    
    # Vérifier si Vercel CLI est installé
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI n'est pas installé. Installez-le avec: npm i -g vercel"
        exit 1
    fi
    
    # Vérifier si git est installé
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        exit 1
    fi
    
    print_message "Prérequis vérifiés ✓"
}

# Configuration des variables d'environnement
setup_environment() {
    print_step "Configuration des variables d'environnement..."
    
    # Demander les variables d'environnement
    read -p "MongoDB URI: " MONGODB_URI
    read -p "JWT Secret: " JWT_SECRET
    read -p "Frontend URL: " FRONTEND_URL
    
    # Variables optionnelles
    read -p "Stripe Secret Key (optionnel): " STRIPE_SECRET_KEY
    read -p "Stripe Webhook Secret (optionnel): " STRIPE_WEBHOOK_SECRET
    
    print_message "Variables d'environnement configurées ✓"
}

# Déploiement du frontend
deploy_frontend() {
    print_step "Déploiement du frontend..."
    
    cd frontend-service
    
    # Configuration Vercel pour le frontend
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/\$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "$FRONTEND_URL"
  }
}
EOF
    
    # Déploiement
    vercel --prod --yes
    
    cd ..
    print_message "Frontend déployé ✓"
}

# Déploiement d'un service backend
deploy_backend_service() {
    local service_name=$1
    local service_path=$2
    
    print_step "Déploiement de $service_name..."
    
    cd $service_path
    
    # Déploiement
    vercel --prod --yes
    
    cd ..
    print_message "$service_name déployé ✓"
}

# Déploiement de tous les services backend
deploy_backend_services() {
    print_step "Déploiement des services backend..."
    
    # Services à déployer
    services=(
        "auth-service"
        "content-service"
        "payment-service"
        "notification-service"
        "database-service"
        "metrics-service"
    )
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            deploy_backend_service "$service" "$service"
        else
            print_warning "Service $service non trouvé, ignoré"
        fi
    done
    
    print_message "Tous les services backend déployés ✓"
}

# Configuration des variables d'environnement pour chaque service
configure_service_env() {
    local service_name=$1
    
    print_step "Configuration des variables d'environnement pour $service_name..."
    
    # Variables communes
    vercel env add MONGODB_URI production "$MONGODB_URI" --scope $service_name
    vercel env add JWT_SECRET production "$JWT_SECRET" --scope $service_name
    vercel env add FRONTEND_URL production "$FRONTEND_URL" --scope $service_name
    
    # Variables spécifiques selon le service
    case $service_name in
        "auth-service")
            vercel env add SESSION_SECRET production "$JWT_SECRET" --scope $service_name
            ;;
        "payment-service")
            if [ ! -z "$STRIPE_SECRET_KEY" ]; then
                vercel env add STRIPE_SECRET_KEY production "$STRIPE_SECRET_KEY" --scope $service_name
            fi
            if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
                vercel env add STRIPE_WEBHOOK_SECRET production "$STRIPE_WEBHOOK_SECRET" --scope $service_name
            fi
            ;;
        "content-service")
            vercel env add UPLOAD_PATH production "/tmp/uploads" --scope $service_name
            vercel env add MAX_FILE_SIZE production "100000000" --scope $service_name
            ;;
    esac
    
    print_message "Variables d'environnement configurées pour $service_name ✓"
}

# Test des endpoints
test_endpoints() {
    print_step "Test des endpoints..."
    
    # Récupérer les URLs des services déployés
    FRONTEND_URL=$(vercel ls | grep frontend-service | awk '{print $2}')
    AUTH_URL=$(vercel ls | grep auth-service | awk '{print $2}')
    CONTENT_URL=$(vercel ls | grep content-service | awk '{print $2}')
    
    # Tests de santé
    echo "Test des endpoints de santé..."
    
    if [ ! -z "$AUTH_URL" ]; then
        curl -s "$AUTH_URL/api/health" | jq . || print_warning "Auth service health check failed"
    fi
    
    if [ ! -z "$CONTENT_URL" ]; then
        curl -s "$CONTENT_URL/api/health" | jq . || print_warning "Content service health check failed"
    fi
    
    print_message "Tests terminés ✓"
}

# Affichage des URLs finales
show_final_urls() {
    print_step "URLs des services déployés:"
    
    echo ""
    echo "🌐 Frontend: $FRONTEND_URL"
    echo "🔐 Auth Service: $AUTH_URL"
    echo "📚 Content Service: $CONTENT_URL"
    echo "💳 Payment Service: $(vercel ls | grep payment-service | awk '{print $2}')"
    echo "🔔 Notification Service: $(vercel ls | grep notification-service | awk '{print $2}')"
    echo "🗄️ Database Service: $(vercel ls | grep database-service | awk '{print $2}')"
    echo "📊 Metrics Service: $(vercel ls | grep metrics-service | awk '{print $2}')"
    echo ""
    
    print_message "Déploiement terminé avec succès! 🎉"
}

# Fonction principale
main() {
    echo "🚀 Script de Déploiement Vercel - Plateforme de Cours"
    echo "=================================================="
    echo ""
    
    check_prerequisites
    setup_environment
    deploy_frontend
    deploy_backend_services
    test_endpoints
    show_final_urls
}

# Exécution du script
main "$@"
