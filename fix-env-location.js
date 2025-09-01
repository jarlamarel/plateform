const fs = require('fs');
const path = require('path');

console.log('🔧 Correction de l\'emplacement du fichier .env...\n');

const frontendPath = path.join(__dirname, 'frontend-service');
const srcEnvPath = path.join(frontendPath, 'src', '.env');
const correctEnvPath = path.join(frontendPath, '.env');

try {
  // Vérifier si le fichier .env existe dans src/
  if (fs.existsSync(srcEnvPath)) {
    console.log('✅ Fichier .env trouvé dans src/');
    
    // Lire le contenu
    const envContent = fs.readFileSync(srcEnvPath, 'utf8');
    console.log('📋 Contenu du fichier .env :');
    console.log(envContent);
    
    // Créer le fichier .env au bon endroit
    fs.writeFileSync(correctEnvPath, envContent, 'utf8');
    console.log('✅ Fichier .env créé au bon endroit (frontend-service/.env)');
    
    // Supprimer l'ancien fichier
    fs.unlinkSync(srcEnvPath);
    console.log('✅ Ancien fichier .env supprimé de src/');
    
  } else if (fs.existsSync(correctEnvPath)) {
    console.log('✅ Fichier .env déjà au bon endroit');
  } else {
    console.log('❌ Aucun fichier .env trouvé');
    console.log('💡 Création d\'un nouveau fichier .env...');
    
    const newEnvContent = `# Variables d'environnement pour le frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_CONTENT_API_URL=http://localhost:3003/api
REACT_APP_PAYMENT_API_URL=http://localhost:3005/api
REACT_APP_NOTIFICATION_API_URL=http://localhost:3004/api
REACT_APP_DATABASE_API_URL=http://localhost:3005/api
REACT_APP_METRICS_API_URL=http://localhost:3006/api

# Variables pour le développement local
NODE_ENV=development
PORT=3000`;
    
    fs.writeFileSync(correctEnvPath, newEnvContent, 'utf8');
    console.log('✅ Nouveau fichier .env créé avec la configuration correcte');
  }
  
  console.log('\n🔄 Redémarrage du frontend nécessaire...');
  console.log('💡 Arrêtez le frontend (Ctrl+C) et redémarrez-le avec : npm start');
  
} catch (error) {
  console.error('❌ Erreur lors de la correction :', error.message);
}
