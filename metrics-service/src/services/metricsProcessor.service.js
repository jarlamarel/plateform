const Metric = require('../models/Metric');
const logger = require('../utils/logger');
const moment = require('moment');

class MetricsProcessorService {
  constructor() {
    this.retentionPeriods = {
      raw: 30, // 30 jours pour les métriques brutes
      hourly: 90, // 90 jours pour les agrégations horaires
      daily: 365, // 1 an pour les agrégations quotidiennes
      monthly: 2555 // 7 ans pour les agrégations mensuelles
    };
  }

  async cleanOldMetrics() {
    try {
      const now = new Date();
      const cutoffDate = moment(now).subtract(this.retentionPeriods.raw, 'days').toDate();

      const result = await Metric.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      logger.info(`Nettoyage des anciennes métriques terminé: ${result.deletedCount} métriques supprimées`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Erreur lors du nettoyage des anciennes métriques:', error);
      throw error;
    }
  }

  async aggregateMetrics(interval = 'hour') {
    try {
      const now = new Date();
      let cutoffDate;
      let groupFormat;

      switch (interval) {
        case 'hour':
          cutoffDate = moment(now).subtract(24, 'hours').toDate();
          groupFormat = '%Y-%m-%d %H:00:00';
          break;
        case 'day':
          cutoffDate = moment(now).subtract(7, 'days').toDate();
          groupFormat = '%Y-%m-%d';
          break;
        case 'month':
          cutoffDate = moment(now).subtract(30, 'days').toDate();
          groupFormat = '%Y-%m';
          break;
        default:
          throw new Error('Intervalle non supporté');
      }

      // Agrégation par service, type de métrique et intervalle de temps
      const aggregatedData = await Metric.aggregate([
        {
          $match: {
            timestamp: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: {
              serviceName: '$serviceName',
              metricType: '$metricType',
              metricName: '$metricName',
              interval: {
                $dateToString: {
                  format: groupFormat,
                  date: '$timestamp'
                }
              }
            },
            count: { $sum: 1 },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            sumValue: { $sum: '$value' },
            firstTimestamp: { $first: '$timestamp' },
            lastTimestamp: { $last: '$timestamp' }
          }
        },
        {
          $project: {
            serviceName: '$_id.serviceName',
            metricType: '$_id.metricType',
            metricName: '$_id.metricName',
            interval: '$_id.interval',
            count: 1,
            avgValue: { $round: ['$avgValue', 4] },
            minValue: 1,
            maxValue: 1,
            sumValue: 1,
            firstTimestamp: 1,
            lastTimestamp: 1,
            aggregatedAt: new Date()
          }
        },
        { $sort: { interval: 1 } }
      ]);

      logger.info(`Agrégation ${interval} terminée: ${aggregatedData.length} enregistrements générés`);
      return aggregatedData;
    } catch (error) {
      logger.error(`Erreur lors de l'agrégation ${interval}:`, error);
      throw error;
    }
  }

  async calculateTrends(metricName, serviceName, period = '7d') {
    try {
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
        default:
          startDate = moment().subtract(7, 'days');
      }

      const query = {
        metricName,
        timestamp: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate()
        }
      };

      if (serviceName) {
        query.serviceName = serviceName;
      }

      const metrics = await Metric.find(query).sort({ timestamp: 1 });

      if (metrics.length === 0) {
        return {
          trend: 'stable',
          changePercent: 0,
          dataPoints: []
        };
      }

      // Calculer la tendance linéaire
      const dataPoints = metrics.map((metric, index) => ({
        x: index,
        y: metric.value,
        timestamp: metric.timestamp
      }));

      const trend = this.calculateLinearTrend(dataPoints);

      return {
        trend: trend.direction,
        changePercent: trend.changePercent,
        slope: trend.slope,
        dataPoints: dataPoints.slice(-20) // Garder seulement les 20 derniers points
      };
    } catch (error) {
      logger.error('Erreur lors du calcul des tendances:', error);
      throw error;
    }
  }

  calculateLinearTrend(dataPoints) {
    if (dataPoints.length < 2) {
      return { direction: 'stable', changePercent: 0, slope: 0 };
    }

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, point, index) => sum + index, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
    const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.y), 0);
    const sumXX = dataPoints.reduce((sum, point, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const firstValue = dataPoints[0].y;
    const lastValue = dataPoints[n - 1].y;
    const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    let direction = 'stable';
    if (changePercent > 5) direction = 'increasing';
    else if (changePercent < -5) direction = 'decreasing';

    return {
      direction,
      changePercent: Math.round(changePercent * 100) / 100,
      slope: Math.round(slope * 10000) / 10000,
      intercept: Math.round(intercept * 10000) / 10000
    };
  }

  async detectAnomalies(metricName, serviceName, threshold = 2) {
    try {
      const endDate = moment();
      const startDate = moment().subtract(24, 'hours');

      const metrics = await Metric.find({
        metricName,
        serviceName,
        timestamp: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate()
        }
      }).sort({ timestamp: 1 });

      if (metrics.length < 10) {
        return [];
      }

      const values = metrics.map(m => m.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const anomalies = metrics.filter((metric, index) => {
        const zScore = Math.abs((metric.value - mean) / stdDev);
        return zScore > threshold;
      });

      return anomalies.map(anomaly => ({
        timestamp: anomaly.timestamp,
        value: anomaly.value,
        zScore: Math.abs((anomaly.value - mean) / stdDev),
        expectedRange: {
          min: mean - (threshold * stdDev),
          max: mean + (threshold * stdDev)
        }
      }));
    } catch (error) {
      logger.error('Erreur lors de la détection d\'anomalies:', error);
      throw error;
    }
  }

  async generateSummaryReport(startDate, endDate) {
    try {
      const query = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      // Statistiques générales
      const totalMetrics = await Metric.countDocuments(query);
      const uniqueServices = await Metric.distinct('serviceName', query);
      const uniqueMetricTypes = await Metric.distinct('metricType', query);

      // Métriques par service
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

      // Métriques par type
      const typeStats = await Metric.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$metricType',
            count: { $sum: 1 },
            avgValue: { $avg: '$value' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Top 10 des métriques les plus fréquentes
      const topMetrics = await Metric.aggregate([
        { $match: query },
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

      // Analyse des erreurs
      const errorAnalysis = await Metric.aggregate([
        {
          $match: {
            ...query,
            metricType: 'error'
          }
        },
        {
          $group: {
            _id: {
              serviceName: '$serviceName',
              metricName: '$metricName'
            },
            count: { $sum: 1 },
            latestError: { $last: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalMetrics,
          uniqueServices: uniqueServices.length,
          uniqueMetricTypes: uniqueMetricTypes.length
        },
        serviceStats,
        typeStats,
        topMetrics,
        errorAnalysis,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport de synthèse:', error);
      throw error;
    }
  }

  async optimizeDatabase() {
    try {
      // Créer des index pour optimiser les requêtes fréquentes
      await Metric.collection.createIndex({ serviceName: 1, timestamp: -1 });
      await Metric.collection.createIndex({ metricType: 1, timestamp: -1 });
      await Metric.collection.createIndex({ metricName: 1, timestamp: -1 });
      await Metric.collection.createIndex({ 'tags.userId': 1, timestamp: -1 });

      logger.info('Optimisation de la base de données terminée');
    } catch (error) {
      logger.error('Erreur lors de l\'optimisation de la base de données:', error);
      throw error;
    }
  }

  async getMetricsDistribution() {
    try {
      const distribution = await Metric.aggregate([
        {
          $group: {
            _id: {
              serviceName: '$serviceName',
              metricType: '$metricType'
            },
            count: { $sum: 1 },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' }
          }
        },
        {
          $group: {
            _id: '$_id.serviceName',
            metricTypes: {
              $push: {
                type: '$_id.metricType',
                count: '$count',
                avgValue: '$avgValue',
                minValue: '$minValue',
                maxValue: '$maxValue'
              }
            },
            totalMetrics: { $sum: '$count' }
          }
        },
        { $sort: { totalMetrics: -1 } }
      ]);

      return distribution;
    } catch (error) {
      logger.error('Erreur lors du calcul de la distribution des métriques:', error);
      throw error;
    }
  }
}

module.exports = new MetricsProcessorService();



