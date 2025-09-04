const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const logger = require('../utils/logger');
const moment = require('moment');

// GET /api/analytics/overview - Vue d'ensemble des métriques
router.get('/overview', async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;
    
    const timeFilter = {};
    if (startTime || endTime) {
      timeFilter.timestamp = {};
      if (startTime) timeFilter.timestamp.$gte = new Date(startTime);
      if (endTime) timeFilter.timestamp.$lte = new Date(endTime);
    }

    // Statistiques générales
    const totalMetrics = await Metric.countDocuments(timeFilter);
    const totalServices = await Metric.distinct('serviceName', timeFilter);
    const totalMetricTypes = await Metric.distinct('metricType', timeFilter);

    // Métriques par service
    const metricsByService = await Metric.aggregate([
      { $match: timeFilter },
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

    // Métriques par type
    const metricsByType = await Metric.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$metricType',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Tendances temporelles (dernières 24h par heure)
    const last24Hours = moment().subtract(24, 'hours').toDate();
    const timeSeriesData = await Metric.aggregate([
      {
        $match: {
          timestamp: { $gte: last24Hours },
          ...timeFilter
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Top 10 des métriques les plus fréquentes
    const topMetrics = await Metric.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$metricName',
          count: { $sum: 1 },
          serviceName: { $first: '$serviceName' },
          metricType: { $first: '$metricType' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalMetrics,
          totalServices: totalServices.length,
          totalMetricTypes: totalMetricTypes.length,
          timeRange: {
            start: startTime || moment().subtract(24, 'hours').toISOString(),
            end: endTime || moment().toISOString()
          }
        },
        metricsByService,
        metricsByType,
        timeSeriesData,
        topMetrics
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'aperçu analytique:', error);
    next(error);
  }
});

// GET /api/analytics/service/:serviceName - Analyse par service
router.get('/service/:serviceName', async (req, res, next) => {
  try {
    const { serviceName } = req.params;
    const { startTime, endTime, interval = 'hour' } = req.query;

    const timeFilter = {};
    if (startTime || endTime) {
      timeFilter.timestamp = {};
      if (startTime) timeFilter.timestamp.$gte = new Date(startTime);
      if (endTime) timeFilter.timestamp.$lte = new Date(endTime);
    }

    // Métriques du service
    const serviceMetrics = await Metric.find({
      serviceName,
      ...timeFilter
    }).sort({ timestamp: -1 }).limit(100);

    // Statistiques par type de métrique
    const metricsByType = await Metric.aggregate([
      {
        $match: {
          serviceName,
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$metricType',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Série temporelle des métriques
    const timeSeries = await Metric.aggregate([
      {
        $match: {
          serviceName,
          ...timeFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: interval === 'hour' ? '%Y-%m-%d %H:00:00' : 
                      interval === 'day' ? '%Y-%m-%d' : 
                      interval === 'month' ? '%Y-%m' : '%Y-%m-%d %H:%M:00',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top métriques du service
    const topMetrics = await Metric.aggregate([
      {
        $match: {
          serviceName,
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$metricName',
          count: { $sum: 1 },
          metricType: { $first: '$metricType' },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Analyse des erreurs
    const errorAnalysis = await Metric.aggregate([
      {
        $match: {
          serviceName,
          metricType: 'error',
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$metricName',
          count: { $sum: 1 },
          latestError: { $last: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        serviceName,
        summary: {
          totalMetrics: serviceMetrics.length,
          metricsByType: metricsByType.length,
          errorCount: errorAnalysis.reduce((sum, error) => sum + error.count, 0)
        },
        metricsByType,
        timeSeries,
        topMetrics,
        errorAnalysis,
        recentMetrics: serviceMetrics.slice(0, 20)
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'analyse du service:', error);
    next(error);
  }
});

// GET /api/analytics/trends - Analyse des tendances
router.get('/trends', async (req, res, next) => {
  try {
    const { metricName, serviceName, period = '7d' } = req.query;

    const endDate = moment();
    let startDate;

    switch (period) {
      case '1d':
        startDate = moment().subtract(1, 'day');
        break;
      case '7d':
        startDate = moment().subtract(7, 'days');
        break;
      case '30d':
        startDate = moment().subtract(30, 'days');
        break;
      case '90d':
        startDate = moment().subtract(90, 'days');
        break;
      default:
        startDate = moment().subtract(7, 'days');
    }

    const query = {
      timestamp: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      }
    };

    if (metricName) query.metricName = metricName;
    if (serviceName) query.serviceName = serviceName;

    // Données de tendance
    const trendData = await Metric.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            metricName: '$metricName',
            serviceName: '$serviceName'
          },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Calcul des tendances
    const trends = trendData.reduce((acc, data) => {
      const key = `${data._id.serviceName}:${data._id.metricName}`;
      if (!acc[key]) {
        acc[key] = {
          serviceName: data._id.serviceName,
          metricName: data._id.metricName,
          dataPoints: [],
          trend: 'stable'
        };
      }
      acc[key].dataPoints.push({
        date: data._id.date,
        avgValue: data.avgValue,
        minValue: data.minValue,
        maxValue: data.maxValue,
        count: data.count
      });
      return acc;
    }, {});

    // Calculer la tendance pour chaque métrique
    Object.values(trends).forEach(trend => {
      if (trend.dataPoints.length >= 2) {
        const firstValue = trend.dataPoints[0].avgValue;
        const lastValue = trend.dataPoints[trend.dataPoints.length - 1].avgValue;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        if (change > 10) trend.trend = 'increasing';
        else if (change < -10) trend.trend = 'decreasing';
        else trend.trend = 'stable';
        
        trend.changePercent = change;
      }
    });

    res.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        trends: Object.values(trends),
        summary: {
          totalTrends: Object.keys(trends).length,
          increasing: Object.values(trends).filter(t => t.trend === 'increasing').length,
          decreasing: Object.values(trends).filter(t => t.trend === 'decreasing').length,
          stable: Object.values(trends).filter(t => t.trend === 'stable').length
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'analyse des tendances:', error);
    next(error);
  }
});

// GET /api/analytics/performance - Analyse des performances
router.get('/performance', async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    const timeFilter = {};
    if (startTime || endTime) {
      timeFilter.timestamp = {};
      if (startTime) timeFilter.timestamp.$gte = new Date(startTime);
      if (endTime) timeFilter.timestamp.$lte = new Date(endTime);
    }

    // Métriques de performance
    const performanceMetrics = await Metric.aggregate([
      {
        $match: {
          metricType: 'performance',
          ...timeFilter
        }
      },
      {
        $group: {
          _id: {
            serviceName: '$serviceName',
            metricName: '$metricName'
          },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 },
          p95: { $percentile: { input: '$value', p: 95 } },
          p99: { $percentile: { input: '$value', p: 99 } }
        }
      },
      { $sort: { avgValue: -1 } }
    ]);

    // Analyse des temps de réponse
    const responseTimeAnalysis = await Metric.aggregate([
      {
        $match: {
          metricName: { $regex: /response_time|latency|duration/i },
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$serviceName',
          avgResponseTime: { $avg: '$value' },
          maxResponseTime: { $max: '$value' },
          minResponseTime: { $min: '$value' },
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { avgResponseTime: -1 } }
    ]);

    // Analyse de la disponibilité
    const availabilityAnalysis = await Metric.aggregate([
      {
        $match: {
          metricName: { $regex: /health|status|availability/i },
          ...timeFilter
        }
      },
      {
        $group: {
          _id: {
            serviceName: '$serviceName',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          uptime: { $avg: '$value' },
          checks: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.serviceName',
          avgUptime: { $avg: '$uptime' },
          totalChecks: { $sum: '$checks' },
          days: { $sum: 1 }
        }
      },
      { $sort: { avgUptime: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        performanceMetrics,
        responseTimeAnalysis,
        availabilityAnalysis,
        summary: {
          totalPerformanceMetrics: performanceMetrics.length,
          servicesWithPerformanceData: [...new Set(performanceMetrics.map(m => m._id.serviceName))].length,
          avgResponseTime: responseTimeAnalysis.reduce((sum, r) => sum + r.avgResponseTime, 0) / responseTimeAnalysis.length || 0
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'analyse des performances:', error);
    next(error);
  }
});

// GET /api/analytics/errors - Analyse des erreurs
router.get('/errors', async (req, res, next) => {
  try {
    const { startTime, endTime, serviceName } = req.query;

    const timeFilter = {};
    if (startTime || endTime) {
      timeFilter.timestamp = {};
      if (startTime) timeFilter.timestamp.$gte = new Date(startTime);
      if (endTime) timeFilter.timestamp.$lte = new Date(endTime);
    }

    if (serviceName) timeFilter.serviceName = serviceName;

    // Analyse des erreurs par service
    const errorsByService = await Metric.aggregate([
      {
        $match: {
          metricType: 'error',
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$serviceName',
          errorCount: { $sum: 1 },
          uniqueErrors: { $addToSet: '$metricName' },
          latestError: { $last: '$timestamp' }
        }
      },
      {
        $project: {
          serviceName: '$_id',
          errorCount: 1,
          uniqueErrorTypes: { $size: '$uniqueErrors' },
          latestError: 1
        }
      },
      { $sort: { errorCount: -1 } }
    ]);

    // Analyse des erreurs par type
    const errorsByType = await Metric.aggregate([
      {
        $match: {
          metricType: 'error',
          ...timeFilter
        }
      },
      {
        $group: {
          _id: '$metricName',
          count: { $sum: 1 },
          services: { $addToSet: '$serviceName' },
          latestOccurrence: { $last: '$timestamp' }
        }
      },
      {
        $project: {
          errorType: '$_id',
          count: 1,
          affectedServices: { $size: '$services' },
          latestOccurrence: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Série temporelle des erreurs
    const errorTimeSeries = await Metric.aggregate([
      {
        $match: {
          metricType: 'error',
          ...timeFilter
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            serviceName: '$serviceName'
          },
          errorCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        errorsByService,
        errorsByType,
        errorTimeSeries,
        summary: {
          totalErrors: errorsByService.reduce((sum, service) => sum + service.errorCount, 0),
          servicesWithErrors: errorsByService.length,
          uniqueErrorTypes: errorsByType.length
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'analyse des erreurs:', error);
    next(error);
  }
});

module.exports = router;



