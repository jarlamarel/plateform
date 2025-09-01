const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const metricsCollector = require('../services/metricsCollector.service');
const logger = require('../utils/logger');
const { validateMetricData } = require('../middlewares/validation.middleware');

// GET /api/metrics - Récupérer les métriques avec filtres
router.get('/', async (req, res, next) => {
  try {
    const {
      serviceName,
      metricType,
      metricName,
      startTime,
      endTime,
      limit = 100,
      page = 1,
      sort = 'timestamp',
      order = 'desc'
    } = req.query;

    // Construire la requête
    const query = {};
    
    if (serviceName) query.serviceName = serviceName;
    if (metricType) query.metricType = metricType;
    if (metricName) query.metricName = metricName;
    
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Exécuter la requête
    const metrics = await Metric.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Compter le total pour la pagination
    const total = await Metric.countDocuments(query);

    res.json({
      success: true,
      data: metrics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques:', error);
    next(error);
  }
});

// GET /api/metrics/aggregated - Récupérer des métriques agrégées
router.get('/aggregated', async (req, res, next) => {
  try {
    const {
      serviceName,
      metricName,
      interval = 'hour',
      startTime,
      endTime
    } = req.query;

    if (!serviceName || !metricName || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'serviceName, metricName, startTime et endTime sont requis'
      });
    }

    const aggregatedData = await Metric.getAggregatedMetrics(
      serviceName,
      metricName,
      interval,
      new Date(startTime),
      new Date(endTime)
    );

    res.json({
      success: true,
      data: aggregatedData
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques agrégées:', error);
    next(error);
  }
});

// GET /api/metrics/latest - Récupérer les dernières métriques
router.get('/latest', async (req, res, next) => {
  try {
    const { serviceName, metricName, limit = 10 } = req.query;

    const query = {};
    if (serviceName) query.serviceName = serviceName;
    if (metricName) query.metricName = metricName;

    const metrics = await Metric.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des dernières métriques:', error);
    next(error);
  }
});

// POST /api/metrics - Créer une nouvelle métrique
router.post('/', validateMetricData, async (req, res, next) => {
  try {
    const metricData = req.body;
    
    // Ajouter le timestamp si non fourni
    if (!metricData.timestamp) {
      metricData.timestamp = new Date();
    }

    const metric = new Metric(metricData);
    await metric.save();

    logger.info(`Métrique créée: ${metric.metricName} pour ${metric.serviceName}`);

    res.status(201).json({
      success: true,
      data: metric.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la création de la métrique:', error);
    next(error);
  }
});

// POST /api/metrics/batch - Créer plusieurs métriques en lot
router.post('/batch', async (req, res, next) => {
  try {
    const { metrics } = req.body;

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le champ metrics doit être un tableau non vide'
      });
    }

    // Valider chaque métrique
    for (const metricData of metrics) {
      const { error } = validateMetricData(metricData);
      if (error) {
        return res.status(400).json({
          success: false,
          message: `Métrique invalide: ${error.details[0].message}`
        });
      }
    }

    // Ajouter le timestamp si non fourni
    const now = new Date();
    const metricsWithTimestamp = metrics.map(metric => ({
      ...metric,
      timestamp: metric.timestamp || now
    }));

    const savedMetrics = await Metric.insertMany(metricsWithTimestamp);

    logger.info(`${savedMetrics.length} métriques créées en lot`);

    res.status(201).json({
      success: true,
      data: savedMetrics.map(metric => metric.toPublicJSON()),
      count: savedMetrics.length
    });

  } catch (error) {
    logger.error('Erreur lors de la création des métriques en lot:', error);
    next(error);
  }
});

// POST /api/metrics/collect - Déclencher la collecte manuelle
router.post('/collect', async (req, res, next) => {
  try {
    const { type = 'all' } = req.body;

    let result = {};

    switch (type) {
      case 'system':
        await metricsCollector.collectSystemMetrics();
        result.system = 'Métriques système collectées';
        break;
      case 'services':
        await metricsCollector.collectServiceMetrics();
        result.services = 'Métriques des services collectées';
        break;
      case 'business':
        await metricsCollector.collectBusinessMetrics();
        result.business = 'Métriques métier collectées';
        break;
      case 'errors':
        await metricsCollector.collectErrorMetrics();
        result.errors = 'Métriques d\'erreur collectées';
        break;
      case 'all':
      default:
        await metricsCollector.collectSystemMetrics();
        await metricsCollector.collectServiceMetrics();
        await metricsCollector.collectBusinessMetrics();
        await metricsCollector.collectErrorMetrics();
        result.all = 'Toutes les métriques collectées';
        break;
    }

    res.json({
      success: true,
      message: 'Collecte de métriques déclenchée',
      result
    });

  } catch (error) {
    logger.error('Erreur lors de la collecte de métriques:', error);
    next(error);
  }
});

// GET /api/metrics/stats - Statistiques générales
router.get('/stats', async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const query = {};
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    // Statistiques par service
    const serviceStats = await Metric.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$serviceName',
          count: { $sum: 1 },
          errorCount: {
            $sum: { $cond: [{ $eq: ['$metricType', 'error'] }, 1, 0] }
          },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par type de métrique
    const typeStats = await Metric.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$metricType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Métriques les plus récentes
    const latestMetrics = await Metric.find(query)
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        serviceStats,
        typeStats,
        latestMetrics,
        totalMetrics: await Metric.countDocuments(query)
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    next(error);
  }
});

// DELETE /api/metrics - Supprimer des métriques
router.delete('/', async (req, res, next) => {
  try {
    const { startTime, endTime, serviceName, metricType } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'startTime et endTime sont requis pour la suppression'
      });
    }

    const query = {
      timestamp: {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      }
    };

    if (serviceName) query.serviceName = serviceName;
    if (metricType) query.metricType = metricType;

    const result = await Metric.deleteMany(query);

    logger.info(`${result.deletedCount} métriques supprimées`);

    res.json({
      success: true,
      message: `${result.deletedCount} métriques supprimées`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    logger.error('Erreur lors de la suppression des métriques:', error);
    next(error);
  }
});

module.exports = router;


