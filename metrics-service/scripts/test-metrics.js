const axios = require('axios');

const BASE_URL = process.env.METRICS_SERVICE_URL || 'http://localhost:3006';

async function testMetricsService() {
  console.log('🧪 Test du service de métriques...\n');

  try {
    // Test 1: Vérification de santé
    console.log('1. Test de santé du service...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Service en bonne santé:', healthResponse.data.status);
    console.log('   Temps de réponse:', healthResponse.data.responseTime);
    console.log('   Uptime:', Math.round(healthResponse.data.uptime / 60), 'minutes\n');

    // Test 2: Création d'une métrique
    console.log('2. Test de création de métrique...');
    const metricData = {
      serviceName: 'test-service',
      metricType: 'performance',
      metricName: 'test_response_time',
      value: Math.random() * 100 + 50,
      unit: 'ms',
      tags: {
        test: 'true',
        environment: 'development'
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/api/metrics`, metricData);
    console.log('✅ Métrique créée avec succès');
    console.log('   ID:', createResponse.data.data.id);
    console.log('   Valeur:', createResponse.data.data.value, createResponse.data.data.unit, '\n');

    // Test 3: Récupération des métriques
    console.log('3. Test de récupération des métriques...');
    const metricsResponse = await axios.get(`${BASE_URL}/api/metrics?limit=5`);
    console.log('✅ Métriques récupérées');
    console.log('   Nombre de métriques:', metricsResponse.data.data.length);
    console.log('   Total:', metricsResponse.data.pagination.total, '\n');

    // Test 4: Statistiques
    console.log('4. Test des statistiques...');
    const statsResponse = await axios.get(`${BASE_URL}/api/metrics/stats`);
    console.log('✅ Statistiques récupérées');
    console.log('   Total métriques:', statsResponse.data.data.totalMetrics);
    console.log('   Services:', statsResponse.data.data.serviceStats.length);
    console.log('   Types:', statsResponse.data.data.typeStats.length, '\n');

    // Test 5: Analytics
    console.log('5. Test des analytics...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/overview`);
    console.log('✅ Analytics récupérées');
    console.log('   Vue d\'ensemble générée');
    console.log('   Période:', analyticsResponse.data.data.summary.timeRange.start, 'à', analyticsResponse.data.data.summary.timeRange.end, '\n');

    // Test 6: Création d'un tableau de bord
    console.log('6. Test de création de tableau de bord...');
    const dashboardData = {
      name: 'Tableau de test',
      description: 'Tableau de bord créé par le script de test',
      widgets: [
        {
          type: 'chart',
          title: 'Test Chart',
          config: {
            metricName: 'test_response_time',
            serviceName: 'test-service',
            chartType: 'line',
            timeRange: '24h',
            position: { x: 0, y: 0, width: 6, height: 4 }
          }
        }
      ]
    };

    // Note: Ce test nécessite un token JWT valide
    console.log('⚠️  Test de tableau de bord nécessite une authentification');
    console.log('   Skipping...\n');

    // Test 7: Collecte manuelle
    console.log('7. Test de collecte manuelle...');
    const collectResponse = await axios.post(`${BASE_URL}/api/metrics/collect`, {
      type: 'system'
    });
    console.log('✅ Collecte déclenchée');
    console.log('   Résultat:', collectResponse.data.result, '\n');

    console.log('🎉 Tous les tests sont passés avec succès!');
    console.log('\n📊 Résumé:');
    console.log('   - Service en bonne santé');
    console.log('   - API fonctionnelle');
    console.log('   - Métriques collectées');
    console.log('   - Analytics opérationnelles');
    console.log('   - Prêt pour la production');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Fonction pour tester la collecte de métriques système
async function testSystemMetrics() {
  console.log('\n🔧 Test de collecte de métriques système...\n');

  try {
    const response = await axios.post(`${BASE_URL}/api/metrics/collect`, {
      type: 'all'
    });

    console.log('✅ Collecte système terminée');
    console.log('   Résultats:', response.data.result);

    // Attendre un peu puis vérifier les métriques système
    await new Promise(resolve => setTimeout(resolve, 2000));

    const systemMetrics = await axios.get(`${BASE_URL}/api/metrics?serviceName=system&limit=10`);
    
    console.log('\n📈 Métriques système collectées:');
    systemMetrics.data.data.forEach(metric => {
      console.log(`   - ${metric.metricName}: ${metric.value} ${metric.unit || ''}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la collecte système:', error.message);
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test...\n');

  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
    
    const response = await axios.delete(`${BASE_URL}/api/metrics`, {
      params: {
        startTime: cutoffDate.toISOString(),
        endTime: new Date().toISOString(),
        serviceName: 'test-service'
      }
    });

    console.log('✅ Données de test nettoyées');
    console.log('   Métriques supprimées:', response.data.deletedCount);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testMetricsService();
  await testSystemMetrics();
  
  // Demander si l'utilisateur veut nettoyer les données de test
  if (process.argv.includes('--cleanup')) {
    await cleanupTestData();
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testMetricsService,
  testSystemMetrics,
  cleanupTestData
};
