const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    enum: ['auth-service', 'content-service', 'database-service', 'notification-service', 'payment-service', 'frontend-service', 'system']
  },
  metricType: {
    type: String,
    required: true,
    enum: ['performance', 'usage', 'error', 'business', 'system']
  },
  metricName: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    default: null
  },
  tags: {
    type: Map,
    of: String,
    default: new Map()
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
metricSchema.index({ serviceName: 1, metricType: 1, timestamp: -1 });
metricSchema.index({ metricName: 1, timestamp: -1 });
metricSchema.index({ 'tags.userId': 1, timestamp: -1 });

// Méthodes statiques
metricSchema.statics.findByServiceAndTimeRange = function(serviceName, startTime, endTime) {
  return this.find({
    serviceName,
    timestamp: { $gte: startTime, $lte: endTime }
  }).sort({ timestamp: 1 });
};

metricSchema.statics.findByMetricName = function(metricName, limit = 100) {
  return this.find({ metricName })
    .sort({ timestamp: -1 })
    .limit(limit);
};

metricSchema.statics.getAggregatedMetrics = function(serviceName, metricName, interval, startTime, endTime) {
  const groupBy = {
    $group: {
      _id: {
        $dateToString: {
          format: interval === 'hour' ? '%Y-%m-%d %H:00:00' : 
                  interval === 'day' ? '%Y-%m-%d' : 
                  interval === 'month' ? '%Y-%m' : '%Y-%m-%d %H:%M:00',
          date: '$timestamp'
        }
      },
      avgValue: { $avg: '$value' },
      minValue: { $min: '$value' },
      maxValue: { $max: '$value' },
      count: { $sum: 1 }
    }
  };

  return this.aggregate([
    {
      $match: {
        serviceName,
        metricName,
        timestamp: { $gte: startTime, $lte: endTime }
      }
    },
    groupBy,
    { $sort: { '_id': 1 } }
  ]);
};

// Méthodes d'instance
metricSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    serviceName: obj.serviceName,
    metricType: obj.metricType,
    metricName: obj.metricName,
    value: obj.value,
    unit: obj.unit,
    tags: obj.tags,
    timestamp: obj.timestamp,
    metadata: obj.metadata
  };
};

module.exports = mongoose.model('Metric', metricSchema);


