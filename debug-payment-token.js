const http = require('http');

// Configuration
const AUTH_URL = 'localhost';
const AUTH_PORT = 3001;
const PAYMENT_URL = 'localhost';
const PAYMENT_PORT = 3005;

// Fonction pour faire une requête HTTP
function makeRequest(host, port, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test de connexion et récupération du token
async function getToken() {
  console.log('🔐 Test de connexion...');
  
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await makeRequest(AUTH_URL, AUTH_PORT, '/api/auth/login', 'POST', loginData);
    
    if (response.status === 200) {
      console.log('✅ Connexion réussie');
      console.log('📝 Token JWT récupéré');
      return response.data.token;
    } else {
      console.log(`❌ Erreur de connexion: ${response.status} - ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la connexion:', error.message);
    return null;
  }
}

// Test de décodage du token
function decodeToken(token) {
  console.log('\n🔍 Analyse du token JWT...');
  
  try {
    // Décoder le token sans vérification (pour voir le contenu)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('✅ Token décodé avec succès');
      console.log('📋 Contenu du token:');
      console.log('   - ID utilisateur:', payload._id);
      console.log('   - Email:', payload.email);
      console.log('   - Expiration:', new Date(payload.exp * 1000).toLocaleString());
      console.log('   - Émis le:', new Date(payload.iat * 1000).toLocaleString());
      return payload;
    } else {
      console.log('❌ Format de token invalide');
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors du décodage:', error.message);
    return null;
  }
}

// Test de l'endpoint de paiement avec le token
async function testPaymentWithToken(token) {
  console.log('\n💳 Test de l\'endpoint de paiement...');
  
  try {
    const paymentData = {
      courseId: '68a7cfe5c2ed51bca84fc383',
      amount: 3499,
      currency: 'EUR'
    };
    
    const response = await makeRequest(PAYMENT_URL, PAYMENT_PORT, '/api/intent', 'POST', paymentData, {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.status === 200) {
      console.log('✅ Paiement créé avec succès');
      console.log('💳 Payment Intent ID:', response.data.paymentIntentId);
      return true;
    } else {
      console.log(`❌ Erreur de paiement: ${response.status}`);
      console.log('📋 Réponse complète:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de paiement:', error.message);
    return false;
  }
}

// Test de l'endpoint /me avec le token
async function testMeEndpoint(token) {
  console.log('\n👤 Test de l\'endpoint /me...');
  
  try {
    const response = await makeRequest(AUTH_URL, AUTH_PORT, '/api/auth/me', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint /me fonctionne');
      console.log('👤 Utilisateur:', response.data.email);
      return true;
    } else {
      console.log(`❌ Erreur /me: ${response.status} - ${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test /me:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Diagnostic du problème de token JWT\n');
  
  // 1. Récupérer un token
  const token = await getToken();
  if (!token) {
    console.log('\n❌ Impossible de récupérer un token. Arrêt du diagnostic.');
    return;
  }
  
  // 2. Analyser le token
  const tokenPayload = decodeToken(token);
  if (!tokenPayload) {
    console.log('\n❌ Impossible de décoder le token. Arrêt du diagnostic.');
    return;
  }
  
  // 3. Tester l'endpoint /me
  const meWorks = await testMeEndpoint(token);
  
  // 4. Tester l'endpoint de paiement
  const paymentWorks = await testPaymentWithToken(token);
  
  // 5. Résumé
  console.log('\n📋 Résumé du diagnostic:');
  console.log(`   - Token récupéré: ${meWorks ? '✅' : '❌'}`);
  console.log(`   - Endpoint /me: ${meWorks ? '✅' : '❌'}`);
  console.log(`   - Endpoint paiement: ${paymentWorks ? '✅' : '❌'}`);
  
  if (meWorks && !paymentWorks) {
    console.log('\n🔍 Le problème est spécifique au service de paiement.');
    console.log('💡 Solutions possibles:');
    console.log('   1. Vérifier que le service de paiement utilise le bon secret JWT');
    console.log('   2. Redémarrer le service de paiement');
    console.log('   3. Vérifier les logs du service de paiement');
  } else if (!meWorks) {
    console.log('\n🔍 Le problème vient du service d\'authentification.');
    console.log('💡 Solutions possibles:');
    console.log('   1. Vérifier la configuration JWT du service d\'authentification');
    console.log('   2. Redémarrer le service d\'authentification');
  }
}

main();

