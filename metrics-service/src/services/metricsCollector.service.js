const axios = require('axios');
const os = require('os');
const Metric = require('../models/Metric');
const logger = require('../utils/logger');

class MetricsCollectorService {
  constructor() {
    this.services = {
      'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      'content-service': process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
      'database-service': process.env.DATABASE_SERVICE_URL || 'http://localhost:3003',
      'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      'payment-service': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005'
    };
  }

  async collectSystemMetrics() {
    try {
      const metrics = [];
      const now = new Date();

      // Métriques CPU
      const cpuUsage = os.loadavg();
      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'cpu_load_1min',
        value: cpuUsage[0],
        unit: 'load',
        tags: new Map([['type', 'cpu']]),
        timestamp: now
      });

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'cpu_load_5min',
        value: cpuUsage[1],
        unit: 'load',
        tags: new Map([['type', 'cpu']]),
        timestamp: now
      });

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'cpu_load_15min',
        value: cpuUsage[2],
        unit: 'load',
        tags: new Map([['type', 'cpu']]),
        timestamp: now
      });

      // Métriques mémoire
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsagePercent = (usedMem / totalMem) * 100;

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'memory_usage_percent',
        value: memoryUsagePercent,
        unit: 'percent',
        tags: new Map([['type', 'memory']]),
        timestamp: now
      });

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'memory_used_bytes',
        value: usedMem,
        unit: 'bytes',
        tags: new Map([['type', 'memory']]),
        timestamp: now
      });

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'memory_free_bytes',
        value: freeMem,
        unit: 'bytes',
        tags: new Map([['type', 'memory']]),
        timestamp: now
      });

      // Métriques réseau
      const networkInterfaces = os.networkInterfaces();
      let totalNetworkTraffic = 0;

      Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach(interface => {
          if (interface.family === 'IPv4' && !interface.internal) {
            // Simuler le trafic réseau (dans un vrai environnement, on utiliserait des outils comme netstat)
            totalNetworkTraffic += Math.random() * 1000;
          }
        });
      });

      metrics.push({
        serviceName: 'system',
        metricType: 'system',
        metricName: 'network_traffic_bytes',
        value: totalNetworkTraffic,
        unit: 'bytes',
        tags: new Map([['type', 'network']]),
        timestamp: now
      });

      // Sauvegarder les métriques
      await Metric.insertMany(metrics);
      logger.info(`Collecté ${metrics.length} métriques système`);

    } catch (error) {
      logger.error('Erreur lors de la collecte des métriques système:', error);
    }
  }

  async collectServiceMetrics() {
    try {
      const metrics = [];
      const now = new Date();

      for (const [serviceName, serviceUrl] of Object.entries(this.services)) {
        try {
          // Collecter les métriques de santé du service
          const healthResponse = await axios.get(`${serviceUrl}/api/health`, {
            timeout: 5000
          });

          metrics.push({
            serviceName,
            metricType: 'performance',
            metricName: 'service_health',
            value: healthResponse.status === 200 ? 1 : 0,
            unit: 'status',
            tags: new Map([['endpoint', '/api/health']]),
            timestamp: now,
            metadata: {
              responseTime: healthResponse.headers['x-response-time'] || 0,
              statusCode: healthResponse.status
            }
          });

          // Collecter les métriques de performance si disponibles
          if (healthResponse.data && healthResponse.data.metrics) {
            Object.entries(healthResponse.data.metrics).forEach(([metricName, value]) => {
              metrics.push({
                serviceName,
                metricType: 'performance',
                metricName,
                value,
                unit: 'count',
                tags: new Map([['source', 'health_endpoint']]),
                timestamp: now
              });
            });
          }

        } catch (error) {
          // Service indisponible
          metrics.push({
            serviceName,
            metricType: 'error',
            metricName: 'service_unavailable',
            value: 1,
            unit: 'status',
            tags: new Map([['error', error.code || 'unknown']]),
            timestamp: now,
            metadata: {
              error: error.message
            }
          });

          logger.warn(`Service ${serviceName} indisponible: ${error.message}`);
        }
      }

      // Sauvegarder les métriques
      if (metrics.length > 0) {
        await Metric.insertMany(metrics);
        logger.info(`Collecté ${metrics.length} métriques de services`);
      }

    } catch (error) {
      logger.error('Erreur lors de la collecte des métriques de services:', error);
    }
  }

  async collectCustomMetrics(serviceName, metricsData) {
    try {
      const metrics = [];
      const now = new Date();

      for (const metricData of metricsData) {
        metrics.push({
          serviceName,
          metricType: metricData.type || 'business',
          metricName: metricData.name,
          value: metricData.value,
          unit: metricData.unit,
          tags: new Map(Object.entries(metricData.tags || {})),
          timestamp: now,
          metadata: metricData.metadata || {}
        });
      }

      await Metric.insertMany(metrics);
      logger.info(`Collecté ${metrics.length} métriques personnalisées pour ${serviceName}`);

      return metrics;
    } catch (error) {
      logger.error(`Erreur lors de la collecte des métriques personnalisées pour ${serviceName}:`, error);
      throw error;
    }
  }

  async collectBusinessMetrics() {
    try {
      const metrics = [];
      const now = new Date();

      // Simuler des métriques métier (dans un vrai environnement, on récupérerait ces données depuis les bases de données)
      
      // Métriques utilisateurs
      metrics.push({
        serviceName: 'auth-service',
        metricType: 'business',
        metricName: 'active_users',
        value: Math.floor(Math.random() * 1000) + 100,
        unit: 'users',
        tags: new Map([['period', 'current']]),
        timestamp: now
      });

      // Métriques de cours
      metrics.push({
        serviceName: 'content-service',
        metricType: 'business',
        metricName: 'total_courses',
        value: Math.floor(Math.random() * 500) + 50,
        unit: 'courses',
        tags: new Map([['status', 'published']]),
        timestamp: now
      });

      // Métriques de paiements
      metrics.push({
        serviceName: 'payment-service',
        metricType: 'business',
        metricName: 'daily_revenue',
        value: Math.floor(Math.random() * 10000) + 1000,
        unit: 'currency',
        tags: new Map([['currency', 'USD']]),
        timestamp: now
      });

      await Metric.insertMany(metrics);
      logger.info(`Collecté ${metrics.length} métriques métier`);

    } catch (error) {
      logger.error('Erreur lors de la collecte des métriques métier:', error);
    }
  }

  async collectErrorMetrics() {
    try {
      const metrics = [];
      const now = new Date();

      // Simuler des métriques d'erreur (dans un vrai environnement, on récupérerait ces données depuis les logs)
      
      for (const serviceName of Object.keys(this.services)) {
        const errorCount = Math.floor(Math.random() * 10);
        
        if (errorCount > 0) {
          metrics.push({
            serviceName,
            metricType: 'error',
            metricName: 'error_count',
            value: errorCount,
            unit: 'count',
            tags: new Map([['severity', 'error']]),
            timestamp: now
          });
        }
      }

      if (metrics.length > 0) {
        await Metric.insertMany(metrics);
        logger.info(`Collecté ${metrics.length} métriques d'erreur`);
      }

    } catch (error) {
      logger.error('Erreur lors de la collecte des métriques d\'erreur:', error);
    }
  }
}

module.exports = new MetricsCollectorService();



