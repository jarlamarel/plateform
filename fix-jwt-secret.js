const fs = require('fs');
const path = require('path');

console.log('🔧 Correction du secret JWT dans le service de paiement...');

const envPath = path.join(__dirname, 'payment-service', '.env');

try {
  // Lire le fichier .env
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📋 Contenu actuel du fichier .env:');
  console.log(envContent);
  
  // Remplacer le secret JWT
  const oldSecret = 'JWT_SECRET=votre_secret_jwt';
  const newSecret = 'JWT_SECRET=votre_secret_jwt_super_securise_pour_payment_service';
  
  if (envContent.includes(oldSecret)) {
    envContent = envContent.replace(oldSecret, newSecret);
    
    // Écrire le fichier modifié
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    console.log('✅ Secret JWT corrigé avec succès !');
    console.log('📋 Nouveau contenu:');
    console.log(envContent);
    
    console.log('\n🔄 Redémarrage du service de paiement...');
    console.log('💡 Le service de paiement doit être redémarré pour prendre en compte les changements.');
    
  } else if (envContent.includes(newSecret)) {
    console.log('✅ Le secret JWT est déjà correct !');
  } else {
    console.log('⚠️  Secret JWT non trouvé dans le fichier .env');
    console.log('📝 Ajout du secret JWT...');
    
    envContent += `\nJWT_SECRET=votre_secret_jwt_super_securise_pour_payment_service\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    console.log('✅ Secret JWT ajouté avec succès !');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la modification du fichier .env:', error.message);
  console.log('\n💡 Solution manuelle:');
  console.log('1. Ouvrez le fichier payment-service/.env');
  console.log('2. Remplacez JWT_SECRET=votre_secret_jwt par JWT_SECRET=votre_secret_jwt_super_securise_pour_payment_service');
  console.log('3. Sauvegardez le fichier');
  console.log('4. Redémarrez le service de paiement');
}
