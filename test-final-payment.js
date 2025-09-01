const http = require('http');

console.log('🧪 Test final du système de paiement...\n');

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
async function testCompletePaymentFlow() {
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

    console.log('\n3️⃣ Test de l\'endpoint de paiement (route principale)...');
    const paymentResponse1 = await makeRequest(PAYMENT_URL, PAYMENT_PORT, '/api/payments/intent', 'POST', {
      courseId: '68a7cfe5c2ed51bca84fc383',
      amount: 3499,
      currency: 'EUR'
    }, {
      'Authorization': `Bearer ${token}`
    });

    if (paymentResponse1.status === 200) {
      console.log('✅ Route principale /api/payments/intent fonctionne');
      console.log('💳 Payment Intent ID:', paymentResponse1.data.paymentIntentId);
    } else {
      console.log(`❌ Route principale échoue: ${paymentResponse1.status}`);
      console.log('📋 Réponse:', JSON.stringify(paymentResponse1.data, null, 2));
    }

    console.log('\n4️⃣ Test de l\'endpoint de paiement (route de compatibilité)...');
    const paymentResponse2 = await makeRequest(PAYMENT_URL, PAYMENT_PORT, '/api/intent', 'POST', {
      courseId: '68a7cfe5c2ed51bca84fc383',
      amount: 3499,
      currency: 'EUR'
    }, {
      'Authorization': `Bearer ${token}`
    });

    if (paymentResponse2.status === 200) {
      console.log('✅ Route de compatibilité /api/intent fonctionne');
      console.log('💳 Payment Intent ID:', paymentResponse2.data.paymentIntentId);
    } else {
      console.log(`❌ Route de compatibilité échoue: ${paymentResponse2.status}`);
      console.log('📋 Réponse:', JSON.stringify(paymentResponse2.data, null, 2));
    }

    console.log('\n📋 Résumé du test :');
    console.log(`   - Connexion: ✅`);
    console.log(`   - Endpoint /me: ✅`);
    console.log(`   - Route principale: ${paymentResponse1.status === 200 ? '✅' : '❌'}`);
    console.log(`   - Route de compatibilité: ${paymentResponse2.status === 200 ? '✅' : '❌'}`);

    if (paymentResponse1.status === 200 || paymentResponse2.status === 200) {
      console.log('\n🎉 SUCCÈS ! Le système de paiement fonctionne !');
    } else {
      console.log('\n❌ Le système de paiement ne fonctionne pas encore.');
      console.log('💡 Vérifiez que :');
      console.log('   1. Le service de paiement est démarré sur le port 3005');
      console.log('   2. Le fichier .env du frontend est au bon endroit');
      console.log('   3. Le frontend a été redémarré');
    }

  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

testCompletePaymentFlow();
