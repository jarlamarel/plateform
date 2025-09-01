const http = require('http');

console.log('🧪 Test de vérification du problème de token résolu...\n');

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

// Test complet
async function testPaymentFlow() {
  try {
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await makeRequest(AUTH_URL, AUTH_PORT, '/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Échec de la connexion:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token récupéré');

    console.log('\n2️⃣ Test de l\'endpoint /me...');
    const meResponse = await makeRequest(AUTH_URL, AUTH_PORT, '/api/auth/me', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });

    if (meResponse.status !== 200) {
      console.log('❌ Échec de l\'endpoint /me:', meResponse.data.message);
      return;
    }
    console.log('✅ Endpoint /me fonctionne');

    console.log('\n3️⃣ Test de l\'endpoint de paiement...');
    const paymentResponse = await makeRequest(PAYMENT_URL, PAYMENT_PORT, '/api/intent', 'POST', {
      courseId: '68a7cfe5c2ed51bca84fc383',
      amount: 3499,
      currency: 'EUR'
    }, {
      'Authorization': `Bearer ${token}`
    });

    if (paymentResponse.status === 200) {
      console.log('🎉 SUCCÈS ! Le problème de token est résolu !');
      console.log('✅ Paiement créé avec succès');
      console.log('💳 Payment Intent ID:', paymentResponse.data.paymentIntentId);
    } else {
      console.log('❌ Échec de l\'endpoint de paiement:', paymentResponse.status);
      console.log('📋 Réponse:', JSON.stringify(paymentResponse.data, null, 2));
      
      if (paymentResponse.status === 401) {
        console.log('\n🔍 Le problème de token persiste. Vérifiez que :');
        console.log('   1. Le service de paiement a été redémarré');
        console.log('   2. Les deux services utilisent le même secret JWT');
        console.log('   3. Le token n\'est pas expiré');
      }
    }

  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

testPaymentFlow();
