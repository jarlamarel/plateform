const http = require('http');

console.log('🔍 Diagnostic complet du problème de paiement...\n');

// Configuration
const SERVICES = [
  { name: 'Auth Service', host: 'localhost', port: 3001, path: '/health' },
  { name: 'Content Service', host: 'localhost', port: 3003, path: '/health' },
  { name: 'Payment Service', host: 'localhost', port: 3005, path: '/health' }
];

// Fonction pour tester un service
function testService(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: service.host,
      port: service.port,
      path: service.path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          service: service.name,
          status: res.statusCode,
          running: true,
          port: service.port
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        service: service.name,
        status: 'ERROR',
        running: false,
        port: service.port,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: service.name,
        status: 'TIMEOUT',
        running: false,
        port: service.port,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

// Test de l'endpoint de paiement spécifique
async function testPaymentEndpoint() {
  console.log('💳 Test de l\'endpoint de paiement...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3005,
        path: '/api/intent',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(JSON.stringify({
        courseId: 'test',
        amount: 1000,
        currency: 'EUR'
      }));
      req.end();
    });

    console.log(`✅ Endpoint /api/intent accessible (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ Endpoint /api/intent non accessible: ${error.message}`);
    return false;
  }
}

// Test de l'endpoint de paiement avec la route complète
async function testPaymentRoutes() {
  const routes = [
    '/api/intent',
    '/api/payments/intent',
    '/api/payments',
    '/health'
  ];

  console.log('\n🔍 Test des différentes routes de paiement...');
  
  for (const route of routes) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3005,
          path: route,
          method: 'GET'
        }, (res) => {
          resolve({ status: res.statusCode, route });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.end();
      });

      console.log(`✅ ${route} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route} - Erreur: ${error.message}`);
    }
  }
}

// Fonction principale
async function main() {
  console.log('1️⃣ Vérification des services...\n');
  
  // Tester tous les services
  const results = await Promise.all(SERVICES.map(testService));
  
  for (const result of results) {
    if (result.running) {
      console.log(`✅ ${result.service} (Port ${result.port}) - En cours d'exécution`);
    } else {
      console.log(`❌ ${result.service} (Port ${result.port}) - Non démarré`);
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
    }
  }

  // Test spécifique du service de paiement
  const paymentService = results.find(r => r.service === 'Payment Service');
  
  if (paymentService && paymentService.running) {
    console.log('\n2️⃣ Le service de paiement est démarré, test des endpoints...');
    await testPaymentRoutes();
    await testPaymentEndpoint();
  } else {
    console.log('\n❌ Le service de paiement n\'est pas démarré !');
    console.log('💡 Pour démarrer le service de paiement :');
    console.log('   cd payment-service');
    console.log('   npm start');
  }

  console.log('\n📋 Résumé :');
  console.log('- Si le service de paiement n\'est pas démarré, démarrez-le');
  console.log('- Si le service est démarré mais l\'endpoint ne répond pas, vérifiez les routes');
  console.log('- Si l\'erreur 404 persiste, le problème vient du frontend qui utilise le mauvais port');
}

main();

