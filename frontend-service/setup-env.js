const fs = require('fs');
const path = require('path');

// Configuration des variables d'environnement pour le développement local
const envContent = `# Variables d'environnement pour le frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_CONTENT_API_URL=http://localhost:3003/api
REACT_APP_PAYMENT_API_URL=http://localhost:3005/api
REACT_APP_NOTIFICATION_API_URL=http://localhost:3004/api
REACT_APP_DATABASE_API_URL=http://localhost:3005/api
REACT_APP_METRICS_API_URL=http://localhost:3006/api

# Variables pour le développement local
NODE_ENV=development
PORT=3000
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé avec succès dans frontend-service/');
  console.log('📝 Variables d\'environnement configurées :');
  console.log('   - Auth Service: http://localhost:3001/api');
  console.log('   - Content Service: http://localhost:3003/api');
  console.log('   - Payment Service: http://localhost:3005/api');
  console.log('   - Notification Service: http://localhost:3004/api');
  console.log('\n🔄 Redémarrez le frontend pour que les changements prennent effet');
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
}
