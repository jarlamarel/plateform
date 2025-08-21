const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../config');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'payment-service',
      version: '1.0.0',
      port: config.port,
      environment: config.nodeEnv,
      checks: {
        database: 'OK',
        stripe: 'OK',
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      health.checks.database = 'DISCONNECTED';
      health.status = 'DEGRADED';
    }

    // Vérifier la configuration Stripe
    if (!config.stripe.secretKey) {
      health.checks.stripe = 'NOT_CONFIGURED';
      health.status = 'DEGRADED';
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'payment-service',
      error: error.message
    });
  }
});

// Endpoint pour les métriques détaillées
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      service: 'payment-service',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        pid: process.pid
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      configuration: {
        port: config.port,
        environment: config.nodeEnv,
        stripeConfigured: !!config.stripe.secretKey,
        jwtConfigured: !!config.jwt.secret
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Unable to retrieve metrics',
      message: error.message
    });
  }
});

module.exports = router;
