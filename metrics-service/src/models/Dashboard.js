const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['chart', 'metric', 'table', 'gauge', 'list']
  },
  title: {
    type: String,
    required: true
  },
  config: {
    metricName: String,
    serviceName: String,
    chartType: {
      type: String,
      enum: ['line', 'bar', 'pie', 'area', 'gauge']
    },
    timeRange: {
      type: String,
      enum: ['1h', '6h', '24h', '7d', '30d', 'custom']
    },
    refreshInterval: {
      type: Number,
      default: 30 // secondes
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 6 },
      height: { type: Number, default: 4 }
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
});

const dashboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  widgets: [widgetSchema],
  layout: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  refreshInterval: {
    type: Number,
    default: 60 // secondes
  },
  filters: {
    services: [String],
    timeRange: {
      type: String,
      enum: ['1h', '6h', '24h', '7d', '30d', 'custom'],
      default: '24h'
    },
    customFilters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true
});

// Index
dashboardSchema.index({ owner: 1, name: 1 });
dashboardSchema.index({ isPublic: 1 });
dashboardSchema.index({ isDefault: 1 });

// Méthodes statiques
dashboardSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId }).sort({ updatedAt: -1 });
};

dashboardSchema.statics.findPublicDashboards = function() {
  return this.find({ isPublic: true }).sort({ updatedAt: -1 });
};

dashboardSchema.statics.findDefaultDashboard = function() {
  return this.findOne({ isDefault: true });
};

// Méthodes d'instance
dashboardSchema.methods.addWidget = function(widget) {
  this.widgets.push(widget);
  return this.save();
};

dashboardSchema.methods.removeWidget = function(widgetId) {
  this.widgets = this.widgets.filter(widget => widget._id.toString() !== widgetId);
  return this.save();
};

dashboardSchema.methods.updateWidget = function(widgetId, updates) {
  const widget = this.widgets.id(widgetId);
  if (widget) {
    Object.assign(widget, updates);
    return this.save();
  }
  throw new Error('Widget not found');
};

dashboardSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    name: obj.name,
    description: obj.description,
    isPublic: obj.isPublic,
    isDefault: obj.isDefault,
    widgets: obj.widgets,
    layout: obj.layout,
    theme: obj.theme,
    refreshInterval: obj.refreshInterval,
    filters: obj.filters,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

module.exports = mongoose.model('Dashboard', dashboardSchema);


