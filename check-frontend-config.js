const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration du frontend...\n');

const frontendPath = path.join(__dirname, 'frontend-service');

// Vérifier si le fichier .env existe
const envPath = path.join(frontendPath, '.env');
const envExamplePath = path.join(frontendPath, 'env.example');

console.log('1️⃣ Vérification des fichiers de configuration...');

if (fs.existsSync(envPath)) {
  console.log('✅ Fichier .env trouvé');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Vérifier la configuration du service de paiement
  if (envContent.includes('REACT_APP_PAYMENT_API_URL')) {
    const paymentUrlMatch = envContent.match(/REACT_APP_PAYMENT_API_URL=(.+)/);
    if (paymentUrlMatch) {
      const paymentUrl = paymentUrlMatch[1].trim();
      console.log(`📋 URL du service de paiement: ${paymentUrl}`);
      
      if (paymentUrl.includes('3005')) {
        console.log('✅ Configuration correcte - Port 3005');
      } else if (paymentUrl.includes('3003')) {
        console.log('❌ Configuration incorrecte - Port 3003 (devrait être 3005)');
        console.log('💡 Corrigez REACT_APP_PAYMENT_API_URL dans le fichier .env');
      } else {
        console.log('⚠️  Port non standard détecté');
      }
    }
  } else {
    console.log('⚠️  REACT_APP_PAYMENT_API_URL non trouvé dans .env');
  }
} else {
  console.log('❌ Fichier .env non trouvé');
  console.log('💡 Créez un fichier .env basé sur env.example');
}

// Vérifier env.example
if (fs.existsSync(envExamplePath)) {
  console.log('\n2️⃣ Vérification du fichier env.example...');
  const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
  
  if (exampleContent.includes('REACT_APP_PAYMENT_API_URL')) {
    const paymentUrlMatch = exampleContent.match(/REACT_APP_PAYMENT_API_URL=(.+)/);
    if (paymentUrlMatch) {
      const paymentUrl = paymentUrlMatch[1].trim();
      console.log(`📋 URL du service de paiement dans env.example: ${paymentUrl}`);
      
      if (paymentUrl.includes('3005')) {
        console.log('✅ env.example correct - Port 3005');
      } else {
        console.log('❌ env.example incorrect - Port 3003');
      }
    }
  }
}

// Vérifier le service de paiement dans le code
console.log('\n3️⃣ Vérification du code du service de paiement...');
const paymentServicePath = path.join(frontendPath, 'src', 'services', 'payment.service.ts');

if (fs.existsSync(paymentServicePath)) {
  const serviceContent = fs.readFileSync(paymentServicePath, 'utf8');
  
  if (serviceContent.includes('process.env.REACT_APP_PAYMENT_API_URL')) {
    console.log('✅ Le service utilise la variable d\'environnement');
  } else if (serviceContent.includes('localhost:3005')) {
    console.log('✅ Le service utilise directement le port 3005');
  } else if (serviceContent.includes('localhost:3003')) {
    console.log('❌ Le service utilise directement le port 3003 (incorrect)');
  } else {
    console.log('⚠️  Configuration du service non détectée');
  }
} else {
  console.log('❌ Fichier payment.service.ts non trouvé');
}

console.log('\n📋 Solutions possibles :');
console.log('1. Créez un fichier .env dans frontend-service/ avec :');
console.log('   REACT_APP_PAYMENT_API_URL=http://localhost:3005/api');
console.log('2. Redémarrez le frontend après modification');
console.log('3. Vérifiez que le service de paiement est démarré sur le port 3005');

