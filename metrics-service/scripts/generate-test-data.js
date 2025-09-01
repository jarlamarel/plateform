const axios = require('axios');
const moment = require('moment');

const BASE_URL = process.env.METRICS_SERVICE_URL || 'http://localhost:3006';

// Configuration des données de test
const TEST_CONFIG = {
  services: ['auth-service', 'content-service', 'database-service', 'notification-service', 'payment-service'],
  metricTypes: ['performance', 'usage', 'error', 'business'],
  days: 7, // Générer des données pour les 7 derniers jours
  interval: 15 // Intervalle en minutes
};

// Métriques de test par service
const SERVICE_METRICS = {
  'auth-service': [
    { name: 'login_attempts', type: 'business', unit: 'count', min: 10, max: 100 },
    { name: 'registration_count', type: 'business', unit: 'count', min: 5, max: 50 },
    { name: 'response_time', type: 'performance', unit: 'ms', min: 50, max: 300 },
    { name: 'active_sessions', type: 'usage', unit: 'count', min: 100, max: 1000 },
    { name: 'authentication_errors', type: 'error', unit: 'count', min: 0, max: 20 }
  ],
  'content-service': [
    { name: 'course_views', type: 'business', unit: 'count', min: 50, max: 500 },
    { name: 'video_streams', type: 'business', unit: 'count', min: 20, max: 200 },
    { name: 'upload_size', type: 'usage', unit: 'bytes', min: 1024, max: 10485760 },
    { name: 'processing_time', type: 'performance', unit: 'ms', min: 100, max: 5000 },
    { name: 'upload_errors', type: 'error', unit: 'count', min: 0, max: 10 }
  ],
  'database-service': [
    { name: 'query_count', type: 'usage', unit: 'count', min: 1000, max: 10000 },
    { name: 'connection_pool_usage', type: 'usage', unit: 'percent', min: 20, max: 80 },
    { name: 'query_time', type: 'performance', unit: 'ms', min: 10, max: 200 },
    { name: 'cache_hit_rate', type: 'performance', unit: 'percent', min: 60, max: 95 },
    { name: 'database_errors', type: 'error', unit: 'count', min: 0, max: 15 }
  ],
  'notification-service': [
    { name: 'emails_sent', type: 'business', unit: 'count', min: 100, max: 1000 },
    { name: 'push_notifications', type: 'business', unit: 'count', min: 50, max: 500 },
    { name: 'sms_sent', type: 'business', unit: 'count', min: 10, max: 100 },
    { name: 'delivery_rate', type: 'performance', unit: 'percent', min: 85, max: 99 },
    { name: 'notification_errors', type: 'error', unit: 'count', min: 0, max: 25 }
  ],
  'payment-service': [
    { name: 'transactions_count', type: 'business', unit: 'count', min: 20, max: 200 },
    { name: 'revenue_total', type: 'business', unit: 'currency', min: 1000, max: 50000 },
    { name: 'payment_processing_time', type: 'performance', unit: 'ms', min: 200, max: 2000 },
    { name: 'success_rate', type: 'performance', unit: 'percent', min: 90, max: 99 },
    { name: 'payment_errors', type: 'error', unit: 'count', min: 0, max: 30 }
  ]
};

// Fonction pour générer une valeur aléatoire avec tendance
function generateValue(min, max, trend = 0) {
  const baseValue = Math.random() * (max - min) + min;
  const trendFactor = 1 + (trend * 0.1); // 10% de variation max
  return Math.round(baseValue * trendFactor);
}

// Fonction pour générer des métriques pour un service
async function generateServiceMetrics(serviceName, startDate, endDate) {
  console.log(`📊 Génération des métriques pour ${serviceName}...`);
  
  const metrics = SERVICE_METRICS[serviceName];
  const metricsData = [];
  
  let currentDate = moment(startDate);
  
  while (currentDate.isBefore(endDate)) {
    for (const metric of metrics) {
      // Ajouter une tendance aléatoire pour rendre les données plus réalistes
      const trend = Math.sin(currentDate.diff(startDate, 'hours') / 24) * 0.5;
      
      const metricData = {
        serviceName,
        metricType: metric.type,
        metricName: metric.name,
        value: generateValue(metric.min, metric.max, trend),
        unit: metric.unit,
        tags: {
          environment: 'test',
          generated: 'true'
        },
        timestamp: currentDate.toDate()
      };
      
      metricsData.push(metricData);
    }
    
    currentDate.add(TEST_CONFIG.interval, 'minutes');
  }
  
  // Envoyer les métriques par lots
  const batchSize = 100;
  for (let i = 0; i < metricsData.length; i += batchSize) {
    const batch = metricsData.slice(i, i + batchSize);
    
    try {
      await axios.post(`${BASE_URL}/api/metrics/batch`, {
        metrics: batch
      });
      
      console.log(`   ✅ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(metricsData.length / batchSize)} envoyé`);
    } catch (error) {
      console.error(`   ❌ Erreur lors de l'envoi du lot ${Math.floor(i / batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`   📈 ${metricsData.length} métriques générées pour ${serviceName}\n`);
}

// Fonction pour générer des métriques système
async function generateSystemMetrics(startDate, endDate) {
  console.log('🖥️  Génération des métriques système...');
  
  const systemMetrics = [
    { name: 'cpu_load_1min', unit: 'load', min: 0.1, max: 2.0 },
    { name: 'cpu_load_5min', unit: 'load', min: 0.1, max: 2.0 },
    { name: 'cpu_load_15min', unit: 'load', min: 0.1, max: 2.0 },
    { name: 'memory_usage_percent', unit: 'percent', min: 30, max: 85 },
    { name: 'memory_used_bytes', unit: 'bytes', min: 1073741824, max: 8589934592 }, // 1GB à 8GB
    { name: 'memory_free_bytes', unit: 'bytes', min: 1073741824, max: 8589934592 },
    { name: 'network_traffic_bytes', unit: 'bytes', min: 1024, max: 1048576 }
  ];
  
  const metricsData = [];
  let currentDate = moment(startDate);
  
  while (currentDate.isBefore(endDate)) {
    for (const metric of systemMetrics) {
      const metricData = {
        serviceName: 'system',
        metricType: 'system',
        metricName: metric.name,
        value: generateValue(metric.min, metric.max),
        unit: metric.unit,
        tags: {
          environment: 'test',
          generated: 'true'
        },
        timestamp: currentDate.toDate()
      };
      
      metricsData.push(metricData);
    }
    
    currentDate.add(TEST_CONFIG.interval, 'minutes');
  }
  
  // Envoyer les métriques système
  try {
    await axios.post(`${BASE_URL}/api/metrics/batch`, {
      metrics: metricsData
    });
    
    console.log(`   ✅ ${metricsData.length} métriques système générées\n`);
  } catch (error) {
    console.error('   ❌ Erreur lors de l\'envoi des métriques système:', error.message);
  }
}

// Fonction pour générer des métriques d'erreur occasionnelles
async function generateErrorMetrics(startDate, endDate) {
  console.log('🚨 Génération des métriques d\'erreur...');
  
  const errorMetrics = [
    { name: 'service_unavailable', service: 'auth-service' },
    { name: 'database_connection_error', service: 'database-service' },
    { name: 'payment_gateway_error', service: 'payment-service' },
    { name: 'email_delivery_failed', service: 'notification-service' },
    { name: 'file_upload_error', service: 'content-service' }
  ];
  
  const metricsData = [];
  let currentDate = moment(startDate);
  
  while (currentDate.isBefore(endDate)) {
    // Générer des erreurs aléatoirement (5% de chance)
    if (Math.random() < 0.05) {
      const randomError = errorMetrics[Math.floor(Math.random() * errorMetrics.length)];
      
      const metricData = {
        serviceName: randomError.service,
        metricType: 'error',
        metricName: randomError.name,
        value: 1,
        unit: 'count',
        tags: {
          environment: 'test',
          generated: 'true',
          severity: Math.random() < 0.3 ? 'high' : 'medium'
        },
        timestamp: currentDate.toDate()
      };
      
      metricsData.push(metricData);
    }
    
    currentDate.add(TEST_CONFIG.interval, 'minutes');
  }
  
  if (metricsData.length > 0) {
    try {
      await axios.post(`${BASE_URL}/api/metrics/batch`, {
        metrics: metricsData
      });
      
      console.log(`   ✅ ${metricsData.length} métriques d'erreur générées\n`);
    } catch (error) {
      console.error('   ❌ Erreur lors de l\'envoi des métriques d\'erreur:', error.message);
    }
  } else {
    console.log('   ✅ Aucune erreur générée (système stable)\n');
  }
}

// Fonction principale
async function generateTestData() {
  console.log('🚀 Génération de données de test pour le service de métriques...\n');
  
  // Vérifier que le service est disponible
  try {
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Service de métriques disponible\n');
  } catch (error) {
    console.error('❌ Service de métriques non disponible:', error.message);
    process.exit(1);
  }
  
  // Calculer les dates
  const endDate = moment();
  const startDate = moment().subtract(TEST_CONFIG.days, 'days');
  
  console.log(`📅 Période: ${startDate.format('YYYY-MM-DD HH:mm')} à ${endDate.format('YYYY-MM-DD HH:mm')}`);
  console.log(`⏱️  Intervalle: ${TEST_CONFIG.interval} minutes\n`);
  
  // Générer les métriques pour chaque service
  for (const service of TEST_CONFIG.services) {
    await generateServiceMetrics(service, startDate, endDate);
  }
  
  // Générer les métriques système
  await generateSystemMetrics(startDate, endDate);
  
  // Générer les métriques d'erreur
  await generateErrorMetrics(startDate, endDate);
  
  console.log('🎉 Génération des données de test terminée!');
  console.log('\n📊 Résumé:');
  console.log(`   - ${TEST_CONFIG.services.length} services`);
  console.log(`   - ${TEST_CONFIG.days} jours de données`);
  console.log(`   - Intervalle de ${TEST_CONFIG.interval} minutes`);
  console.log('   - Métriques système et d\'erreur incluses');
  console.log('\n🔍 Vous pouvez maintenant tester les tableaux de bord et les analytics!');
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...\n');
  
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
    
    const response = await axios.delete(`${BASE_URL}/api/metrics`, {
      params: {
        startTime: cutoffDate.toISOString(),
        endTime: new Date().toISOString()
      }
    });
    
    console.log('✅ Données de test nettoyées');
    console.log('   Métriques supprimées:', response.data.deletedCount);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await cleanupTestData();
  } else {
    await generateTestData();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateTestData,
  cleanupTestData
};


