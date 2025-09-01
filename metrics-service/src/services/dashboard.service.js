const Dashboard = require('../models/Dashboard');
const Metric = require('../models/Metric');
const logger = require('../utils/logger');
const moment = require('moment');

class DashboardService {
  async createDashboard(dashboardData) {
    try {
      const dashboard = new Dashboard(dashboardData);
      await dashboard.save();
      logger.info(`Tableau de bord créé: ${dashboard.name}`);
      return dashboard;
    } catch (error) {
      logger.error('Erreur lors de la création du tableau de bord:', error);
      throw error;
    }
  }

  async getDashboardById(dashboardId, userId) {
    try {
      const dashboard = await Dashboard.findById(dashboardId);
      
      if (!dashboard) {
        throw new Error('Tableau de bord non trouvé');
      }

      // Vérifier les permissions
      if (!dashboard.isPublic && dashboard.owner.toString() !== userId) {
        throw new Error('Accès non autorisé');
      }

      return dashboard;
    } catch (error) {
      logger.error('Erreur lors de la récupération du tableau de bord:', error);
      throw error;
    }
  }

  async getUserDashboards(userId) {
    try {
      const dashboards = await Dashboard.find({
        $or: [
          { owner: userId },
          { isPublic: true }
        ]
      }).sort({ updatedAt: -1 });

      return dashboards;
    } catch (error) {
      logger.error('Erreur lors de la récupération des tableaux de bord:', error);
      throw error;
    }
  }

  async updateDashboard(dashboardId, updates, userId) {
    try {
      const dashboard = await Dashboard.findById(dashboardId);
      
      if (!dashboard) {
        throw new Error('Tableau de bord non trouvé');
      }

      if (dashboard.owner.toString() !== userId) {
        throw new Error('Accès non autorisé');
      }

      Object.assign(dashboard, updates);
      await dashboard.save();
      
      logger.info(`Tableau de bord mis à jour: ${dashboard.name}`);
      return dashboard;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du tableau de bord:', error);
      throw error;
    }
  }

  async deleteDashboard(dashboardId, userId) {
    try {
      const dashboard = await Dashboard.findById(dashboardId);
      
      if (!dashboard) {
        throw new Error('Tableau de bord non trouvé');
      }

      if (dashboard.owner.toString() !== userId) {
        throw new Error('Accès non autorisé');
      }

      await Dashboard.findByIdAndDelete(dashboardId);
      logger.info(`Tableau de bord supprimé: ${dashboard.name}`);
      
      return { message: 'Tableau de bord supprimé avec succès' };
    } catch (error) {
      logger.error('Erreur lors de la suppression du tableau de bord:', error);
      throw error;
    }
  }

  async getDashboardData(dashboardId, userId) {
    try {
      const dashboard = await this.getDashboardById(dashboardId, userId);
      const dashboardData = {
        ...dashboard.toPublicJSON(),
        widgets: []
      };

      // Récupérer les données pour chaque widget
      for (const widget of dashboard.widgets) {
        const widgetData = await this.getWidgetData(widget, dashboard.filters);
        dashboardData.widgets.push({
          ...widget.toObject(),
          data: widgetData
        });
      }

      return dashboardData;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données du tableau de bord:', error);
      throw error;
    }
  }

  async getWidgetData(widget, filters) {
    try {
      const { config } = widget;
      const timeRange = this.calculateTimeRange(config.timeRange || filters.timeRange);
      
      let query = {
        timestamp: { $gte: timeRange.start, $lte: timeRange.end }
      };

      if (config.serviceName) {
        query.serviceName = config.serviceName;
      }

      if (config.metricName) {
        query.metricName = config.metricName;
      }

      // Appliquer les filtres personnalisés
      if (filters.services && filters.services.length > 0) {
        query.serviceName = { $in: filters.services };
      }

      const metrics = await Metric.find(query).sort({ timestamp: 1 });

      // Traiter les données selon le type de widget
      switch (widget.type) {
        case 'chart':
          return this.processChartData(metrics, config);
        case 'metric':
          return this.processMetricData(metrics, config);
        case 'table':
          return this.processTableData(metrics, config);
        case 'gauge':
          return this.processGaugeData(metrics, config);
        case 'list':
          return this.processListData(metrics, config);
        default:
          return metrics;
      }
    } catch (error) {
      logger.error('Erreur lors de la récupération des données du widget:', error);
      return [];
    }
  }

  processChartData(metrics, config) {
    const chartData = {
      labels: [],
      datasets: []
    };

    if (metrics.length === 0) return chartData;

    // Grouper par timestamp pour les graphiques temporels
    const groupedData = {};
    metrics.forEach(metric => {
      const timestamp = moment(metric.timestamp).format('YYYY-MM-DD HH:mm');
      if (!groupedData[timestamp]) {
        groupedData[timestamp] = [];
      }
      groupedData[timestamp].push(metric.value);
    });

    chartData.labels = Object.keys(groupedData);
    
    // Calculer les valeurs moyennes pour chaque timestamp
    const values = Object.values(groupedData).map(group => 
      group.reduce((sum, val) => sum + val, 0) / group.length
    );

    chartData.datasets.push({
      label: config.metricName || 'Valeur',
      data: values,
      borderColor: config.options?.borderColor || '#3b82f6',
      backgroundColor: config.options?.backgroundColor || 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    });

    return chartData;
  }

  processMetricData(metrics, config) {
    if (metrics.length === 0) return { value: 0, unit: '', trend: 0 };

    const latestMetric = metrics[metrics.length - 1];
    const previousMetric = metrics.length > 1 ? metrics[metrics.length - 2] : null;

    let trend = 0;
    if (previousMetric) {
      trend = ((latestMetric.value - previousMetric.value) / previousMetric.value) * 100;
    }

    return {
      value: latestMetric.value,
      unit: latestMetric.unit || '',
      trend: Math.round(trend * 100) / 100
    };
  }

  processTableData(metrics, config) {
    return metrics.map(metric => ({
      timestamp: moment(metric.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      serviceName: metric.serviceName,
      metricName: metric.metricName,
      value: metric.value,
      unit: metric.unit
    }));
  }

  processGaugeData(metrics, config) {
    if (metrics.length === 0) return { value: 0, max: 100, percentage: 0 };

    const latestMetric = metrics[metrics.length - 1];
    const maxValue = config.options?.maxValue || 100;
    const percentage = (latestMetric.value / maxValue) * 100;

    return {
      value: latestMetric.value,
      max: maxValue,
      percentage: Math.min(percentage, 100)
    };
  }

  processListData(metrics, config) {
    // Grouper par service ou métrique selon la configuration
    const grouped = {};
    metrics.forEach(metric => {
      const key = config.options?.groupBy === 'service' ? metric.serviceName : metric.metricName;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(metric);
    });

    return Object.entries(grouped).map(([key, groupMetrics]) => ({
      name: key,
      count: groupMetrics.length,
      latestValue: groupMetrics[groupMetrics.length - 1]?.value || 0
    }));
  }

  calculateTimeRange(timeRange) {
    const now = moment();
    let start;

    switch (timeRange) {
      case '1h':
        start = now.clone().subtract(1, 'hour');
        break;
      case '6h':
        start = now.clone().subtract(6, 'hours');
        break;
      case '24h':
        start = now.clone().subtract(24, 'hours');
        break;
      case '7d':
        start = now.clone().subtract(7, 'days');
        break;
      case '30d':
        start = now.clone().subtract(30, 'days');
        break;
      default:
        start = now.clone().subtract(24, 'hours');
    }

    return {
      start: start.toDate(),
      end: now.toDate()
    };
  }

  async generateDailyReport() {
    try {
      const yesterday = moment().subtract(1, 'day');
      const startOfDay = yesterday.startOf('day').toDate();
      const endOfDay = yesterday.endOf('day').toDate();

      const report = {
        date: yesterday.format('YYYY-MM-DD'),
        generatedAt: new Date(),
        summary: {},
        services: {},
        alerts: []
      };

      // Récupérer les métriques de la journée
      const metrics = await Metric.find({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      });

      // Analyser par service
      const services = ['auth-service', 'content-service', 'database-service', 'notification-service', 'payment-service'];
      
      for (const service of services) {
        const serviceMetrics = metrics.filter(m => m.serviceName === service);
        
        report.services[service] = {
          totalMetrics: serviceMetrics.length,
          errorCount: serviceMetrics.filter(m => m.metricType === 'error').length,
          avgResponseTime: this.calculateAverageResponseTime(serviceMetrics),
          uptime: this.calculateUptime(serviceMetrics)
        };
      }

      // Générer des alertes
      report.alerts = this.generateAlerts(report.services);

      // Sauvegarder le rapport
      // Note: Vous pourriez créer un modèle Report pour stocker les rapports
      
      logger.info(`Rapport quotidien généré pour ${report.date}`);
      return report;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport quotidien:', error);
      throw error;
    }
  }

  calculateAverageResponseTime(metrics) {
    const responseTimeMetrics = metrics.filter(m => m.metricName === 'service_health');
    if (responseTimeMetrics.length === 0) return 0;

    const totalTime = responseTimeMetrics.reduce((sum, metric) => {
      return sum + (metric.metadata?.responseTime || 0);
    }, 0);

    return totalTime / responseTimeMetrics.length;
  }

  calculateUptime(metrics) {
    const healthMetrics = metrics.filter(m => m.metricName === 'service_health');
    if (healthMetrics.length === 0) return 0;

    const successfulChecks = healthMetrics.filter(m => m.value === 1).length;
    return (successfulChecks / healthMetrics.length) * 100;
  }

  generateAlerts(services) {
    const alerts = [];

    Object.entries(services).forEach(([serviceName, data]) => {
      if (data.uptime < 95) {
        alerts.push({
          type: 'warning',
          service: serviceName,
          message: `Uptime faible: ${data.uptime.toFixed(2)}%`,
          severity: 'medium'
        });
      }

      if (data.errorCount > 10) {
        alerts.push({
          type: 'error',
          service: serviceName,
          message: `Nombre d'erreurs élevé: ${data.errorCount}`,
          severity: 'high'
        });
      }
    });

    return alerts;
  }
}

module.exports = new DashboardService();


