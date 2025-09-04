const http = require('http');

console.log('🧪 Test rapide de l\'endpoint de paiement...\n');

// Test simple de l'endpoint /api/intent
function testPaymentEndpoint() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/intent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Réponse: ${body.substring(0, 200)}...`);
        
        if (res.statusCode === 404) {
          console.log('❌ Endpoint /api/intent retourne 404');
          console.log('💡 Le service de paiement n\'est peut-être pas démarré');
        } else if (res.statusCode === 401) {
          console.log('✅ Endpoint accessible mais token invalide (normal)');
        } else {
          console.log(`✅ Endpoint accessible (Status: ${res.statusCode})`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log('❌ Erreur de connexion:', err.message);
      console.log('💡 Le service de paiement n\'est probablement pas démarré');
      resolve();
    });

    req.write(JSON.stringify({
      courseId: 'test',
      amount: 1000,
      currency: 'EUR'
    }));
    req.end();
  });
}

// Test de l'endpoint health
function testHealthEndpoint() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Service de paiement démarré et accessible');
        } else {
          console.log(`⚠️  Service accessible mais status: ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log('❌ Service de paiement non accessible:', err.message);
      resolve();
    });

    req.end();
  });
}

async function main() {
  console.log('1️⃣ Test de l\'endpoint health...');
  await testHealthEndpoint();
  
  console.log('\n2️⃣ Test de l\'endpoint /api/intent...');
  await testPaymentEndpoint();
  
  console.log('\n📋 Résumé :');
  console.log('- Si le service n\'est pas accessible, démarrez-le avec :');
  console.log('  cd payment-service && npm start');
  console.log('- Si l\'endpoint retourne 404, le problème est dans les routes');
  console.log('- Si l\'endpoint retourne 401, c\'est normal (token invalide)');
}

main();

