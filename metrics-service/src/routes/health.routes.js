const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');

// GET /api/health - Vérification de santé générale
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Vérifier la connexion à MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Métriques système
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      platform: {
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname()
      }
    };

    const responseTime = Date.now() - startTime;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      version: process.env.npm_package_version || '1.0.0',
      uptime: systemMetrics.uptime,
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbStatus,
          message: dbStatus === 'connected' ? 'MongoDB connection is healthy' : 'MongoDB connection failed'
        },
        memory: {
          status: systemMetrics.memory.used < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB
          message: `Memory usage: ${Math.round(systemMetrics.memory.used / 1024 / 1024)}MB`
        },
        cpu: {
          status: systemMetrics.cpu.loadAverage[0] < 5 ? 'healthy' : 'warning',
          message: `CPU load: ${systemMetrics.cpu.loadAverage[0].toFixed(2)}`
        }
      },
      metrics: {
        totalMetrics: await mongoose.model('Metric').countDocuments().catch(() => 0),
        totalDashboards: await mongoose.model('Dashboard').countDocuments().catch(() => 0),
        systemMetrics: {
          memoryUsagePercent: ((systemMetrics.memory.used / systemMetrics.memory.total) * 100).toFixed(2),
          cpuLoad1Min: systemMetrics.cpu.loadAverage[0].toFixed(2),
          cpuLoad5Min: systemMetrics.cpu.loadAverage[1].toFixed(2),
          cpuLoad15Min: systemMetrics.cpu.loadAverage[2].toFixed(2)
        }
      }
    };

    // Déterminer le statut global
    const allChecksHealthy = Object.values(healthStatus.checks).every(check => check.status === 'healthy');
    healthStatus.status = allChecksHealthy ? 'healthy' : 'degraded';

    // Ajouter le header de temps de réponse
    res.set('X-Response-Time', `${responseTime}ms`);

    res.json(healthStatus);

  } catch (error) {
    logger.error('Erreur lors de la vérification de santé:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      error: error.message,
      checks: {
        database: {
          status: 'error',
          message: 'Database check failed'
        },
        system: {
          status: 'error',
          message: 'System check failed'
        }
      }
    });
  }
});

// GET /api/health/ready - Vérification de disponibilité
router.get('/ready', async (req, res) => {
  try {
    // Vérifier que le service est prêt à recevoir des requêtes
    const dbReady = mongoose.connection.readyState === 1;
    
    if (!dbReady) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        service: 'metrics-service',
        message: 'Service not ready - database connection not established'
      });
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      message: 'Service is ready to handle requests'
    });

  } catch (error) {
    logger.error('Erreur lors de la vérification de disponibilité:', error);
    
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      error: error.message
    });
  }
});

// GET /api/health/live - Vérification de vivacité
router.get('/live', (req, res) => {
  // Vérification simple que le processus est en vie
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    service: 'metrics-service',
    pid: process.pid,
    uptime: process.uptime()
  });
});

// GET /api/health/metrics - Métriques Prometheus
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      // Métriques système
      system_memory_usage_bytes: process.memoryUsage().heapUsed,
      system_memory_total_bytes: process.memoryUsage().heapTotal,
      system_cpu_load_1min: os.loadavg()[0],
      system_cpu_load_5min: os.loadavg()[1],
      system_cpu_load_15min: os.loadavg()[2],
      
      // Métriques de l'application
      app_uptime_seconds: process.uptime(),
      app_requests_total: 0, // À implémenter avec un compteur global
      
      // Métriques de la base de données
      db_connection_status: mongoose.connection.readyState === 1 ? 1 : 0,
      db_metrics_total: await mongoose.model('Metric').countDocuments().catch(() => 0),
      db_dashboards_total: await mongoose.model('Dashboard').countDocuments().catch(() => 0)
    };

    // Format Prometheus
    const prometheusMetrics = Object.entries(metrics)
      .map(([name, value]) => `${name} ${value}`)
      .join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);

  } catch (error) {
    logger.error('Erreur lors de la génération des métriques Prometheus:', error);
    res.status(500).send('# Error generating metrics\n');
  }
});

// GET /api/health/detailed - Vérification détaillée
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      
      // Informations système détaillées
      system: {
        platform: {
          type: os.type(),
          release: os.release(),
          arch: os.arch(),
          hostname: os.hostname(),
          userInfo: os.userInfo()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        cpu: {
          model: os.cpus()[0].model,
          cores: os.cpus().length,
          loadAverage: os.loadavg(),
          uptime: os.uptime()
        },
        network: {
          interfaces: Object.keys(os.networkInterfaces())
        }
      },
      
      // Informations de l'application
      application: {
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      },
      
      // Informations de la base de données
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        collections: Object.keys(mongoose.connection.collections)
      },
      
      // Statistiques des métriques
      metrics: {
        total: await mongoose.model('Metric').countDocuments().catch(() => 0),
        byService: await mongoose.model('Metric').aggregate([
          { $group: { _id: '$serviceName', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).catch(() => []),
        byType: await mongoose.model('Metric').aggregate([
          { $group: { _id: '$metricType', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).catch(() => [])
      },
      
      // Statistiques des tableaux de bord
      dashboards: {
        total: await mongoose.model('Dashboard').countDocuments().catch(() => 0),
        public: await mongoose.model('Dashboard').countDocuments({ isPublic: true }).catch(() => 0),
        private: await mongoose.model('Dashboard').countDocuments({ isPublic: false }).catch(() => 0)
      }
    };

    res.json(detailedHealth);

  } catch (error) {
    logger.error('Erreur lors de la vérification détaillée:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'metrics-service',
      error: error.message
    });
  }
});

module.exports = router;


