const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboard.service');
const logger = require('../utils/logger');

// GET /api/dashboard - Récupérer les tableaux de bord de l'utilisateur
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dashboards = await dashboardService.getUserDashboards(userId);

    res.json({
      success: true,
      data: dashboards.map(dashboard => dashboard.toPublicJSON())
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des tableaux de bord:', error);
    next(error);
  }
});

// GET /api/dashboard/public - Récupérer les tableaux de bord publics
router.get('/public', async (req, res, next) => {
  try {
    const dashboards = await dashboardService.getUserDashboards(null);

    res.json({
      success: true,
      data: dashboards
        .filter(dashboard => dashboard.isPublic)
        .map(dashboard => dashboard.toPublicJSON())
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des tableaux de bord publics:', error);
    next(error);
  }
});

// GET /api/dashboard/:id - Récupérer un tableau de bord spécifique
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dashboard = await dashboardService.getDashboardById(id, userId);

    res.json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération du tableau de bord:', error);
    next(error);
  }
});

// GET /api/dashboard/:id/data - Récupérer les données d'un tableau de bord
router.get('/:id/data', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dashboardData = await dashboardService.getDashboardData(id, userId);

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des données du tableau de bord:', error);
    next(error);
  }
});

// POST /api/dashboard - Créer un nouveau tableau de bord
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dashboardData = {
      ...req.body,
      owner: userId
    };

    const dashboard = await dashboardService.createDashboard(dashboardData);

    res.status(201).json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la création du tableau de bord:', error);
    next(error);
  }
});

// PUT /api/dashboard/:id - Mettre à jour un tableau de bord
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const dashboard = await dashboardService.updateDashboard(id, updates, userId);

    res.json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la mise à jour du tableau de bord:', error);
    next(error);
  }
});

// DELETE /api/dashboard/:id - Supprimer un tableau de bord
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await dashboardService.deleteDashboard(id, userId);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    logger.error('Erreur lors de la suppression du tableau de bord:', error);
    next(error);
  }
});

// POST /api/dashboard/:id/widgets - Ajouter un widget au tableau de bord
router.post('/:id/widgets', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const widgetData = req.body;

    const dashboard = await dashboardService.getDashboardById(id, userId);
    await dashboard.addWidget(widgetData);

    res.status(201).json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de l\'ajout du widget:', error);
    next(error);
  }
});

// PUT /api/dashboard/:id/widgets/:widgetId - Mettre à jour un widget
router.put('/:id/widgets/:widgetId', async (req, res, next) => {
  try {
    const { id, widgetId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const dashboard = await dashboardService.getDashboardById(id, userId);
    await dashboard.updateWidget(widgetId, updates);

    res.json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la mise à jour du widget:', error);
    next(error);
  }
});

// DELETE /api/dashboard/:id/widgets/:widgetId - Supprimer un widget
router.delete('/:id/widgets/:widgetId', async (req, res, next) => {
  try {
    const { id, widgetId } = req.params;
    const userId = req.user.id;

    const dashboard = await dashboardService.getDashboardById(id, userId);
    await dashboard.removeWidget(widgetId);

    res.json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la suppression du widget:', error);
    next(error);
  }
});

// POST /api/dashboard/:id/clone - Cloner un tableau de bord
router.post('/:id/clone', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description } = req.body;

    const originalDashboard = await dashboardService.getDashboardById(id, userId);
    
    const clonedDashboard = await dashboardService.createDashboard({
      name: name || `${originalDashboard.name} (Copie)`,
      description: description || originalDashboard.description,
      widgets: originalDashboard.widgets,
      layout: originalDashboard.layout,
      theme: originalDashboard.theme,
      refreshInterval: originalDashboard.refreshInterval,
      filters: originalDashboard.filters,
      isPublic: false,
      owner: userId
    });

    res.status(201).json({
      success: true,
      data: clonedDashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors du clonage du tableau de bord:', error);
    next(error);
  }
});

// GET /api/dashboard/templates - Récupérer les modèles de tableaux de bord
router.get('/templates', async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'system-overview',
        name: 'Vue d\'ensemble système',
        description: 'Tableau de bord pour surveiller les métriques système',
        widgets: [
          {
            type: 'chart',
            title: 'Utilisation CPU',
            config: {
              metricName: 'cpu_load_1min',
              serviceName: 'system',
              chartType: 'line',
              timeRange: '24h',
              position: { x: 0, y: 0, width: 6, height: 4 }
            }
          },
          {
            type: 'gauge',
            title: 'Utilisation mémoire',
            config: {
              metricName: 'memory_usage_percent',
              serviceName: 'system',
              timeRange: '1h',
              position: { x: 6, y: 0, width: 6, height: 4 },
              options: { maxValue: 100 }
            }
          },
          {
            type: 'metric',
            title: 'Trafic réseau',
            config: {
              metricName: 'network_traffic_bytes',
              serviceName: 'system',
              timeRange: '1h',
              position: { x: 0, y: 4, width: 6, height: 2 }
            }
          }
        ]
      },
      {
        id: 'service-health',
        name: 'Santé des services',
        description: 'Surveillance de la santé de tous les services',
        widgets: [
          {
            type: 'list',
            title: 'État des services',
            config: {
              metricName: 'service_health',
              timeRange: '1h',
              position: { x: 0, y: 0, width: 12, height: 6 },
              options: { groupBy: 'service' }
            }
          }
        ]
      },
      {
        id: 'business-metrics',
        name: 'Métriques métier',
        description: 'Suivi des indicateurs métier clés',
        widgets: [
          {
            type: 'metric',
            title: 'Utilisateurs actifs',
            config: {
              metricName: 'active_users',
              serviceName: 'auth-service',
              timeRange: '24h',
              position: { x: 0, y: 0, width: 4, height: 2 }
            }
          },
          {
            type: 'metric',
            title: 'Cours publiés',
            config: {
              metricName: 'total_courses',
              serviceName: 'content-service',
              timeRange: '24h',
              position: { x: 4, y: 0, width: 4, height: 2 }
            }
          },
          {
            type: 'metric',
            title: 'Revenus quotidiens',
            config: {
              metricName: 'daily_revenue',
              serviceName: 'payment-service',
              timeRange: '24h',
              position: { x: 8, y: 0, width: 4, height: 2 }
            }
          }
        ]
      }
    ];

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des modèles:', error);
    next(error);
  }
});

// POST /api/dashboard/from-template - Créer un tableau de bord à partir d'un modèle
router.post('/from-template', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { templateId, name, description } = req.body;

    // Récupérer le modèle
    const templates = [
      {
        id: 'system-overview',
        name: 'Vue d\'ensemble système',
        description: 'Tableau de bord pour surveiller les métriques système',
        widgets: [
          {
            type: 'chart',
            title: 'Utilisation CPU',
            config: {
              metricName: 'cpu_load_1min',
              serviceName: 'system',
              chartType: 'line',
              timeRange: '24h',
              position: { x: 0, y: 0, width: 6, height: 4 }
            }
          },
          {
            type: 'gauge',
            title: 'Utilisation mémoire',
            config: {
              metricName: 'memory_usage_percent',
              serviceName: 'system',
              timeRange: '1h',
              position: { x: 6, y: 0, width: 6, height: 4 },
              options: { maxValue: 100 }
            }
          }
        ]
      }
    ];

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    const dashboard = await dashboardService.createDashboard({
      name: name || template.name,
      description: description || template.description,
      widgets: template.widgets,
      owner: userId
    });

    res.status(201).json({
      success: true,
      data: dashboard.toPublicJSON()
    });

  } catch (error) {
    logger.error('Erreur lors de la création du tableau de bord à partir du modèle:', error);
    next(error);
  }
});

module.exports = router;


