const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
      minlength: [10, 'La description doit contenir au moins 10 caractères'],
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Le cours est requis'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'instructeur est requis'],
    },
    duration: {
      type: Number,
      required: [true, 'La durée est requise'],
      min: [0, 'La durée ne peut pas être négative'],
    },
    order: {
      type: Number,
      required: false, // Optionnel car automatiquement défini par le middleware pre-save
      min: [0, 'L\'ordre ne peut pas être négatif'],
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    resources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    }],
    completedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Champs pour les vidéos
    videoUrl: {
      type: String,
      default: null,
    },
    videoType: {
      type: String,
      enum: ['youtube', 'vimeo', 'local', 'external'],
      default: null,
    },
    videoFileName: {
      type: String,
      default: null, // Pour les vidéos stockées localement
    },
    videoSize: {
      type: Number,
      default: null, // Taille du fichier en bytes
    },
    videoMimeType: {
      type: String,
      default: null,
    },
    videoDuration: {
      type: Number,
      default: null, // Durée de la vidéo en secondes
    },
    videoThumbnail: {
      type: String,
      default: null, // URL de la miniature de la vidéo
    },
    originalVideoUrl: {
      type: String,
      default: null, // URL originale (avant conversion en embed)
    },
    videoDescription: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour la recherche
lessonSchema.index({ title: 'text', description: 'text' });

// Méthodes virtuelles
lessonSchema.virtual('resourceCount').get(function() {
  return this.resources.length;
});

lessonSchema.virtual('prerequisiteCount').get(function() {
  return this.prerequisites.length;
});

lessonSchema.virtual('completionCount').get(function() {
  return this.completedBy.length;
});

// Méthodes d'instance
lessonSchema.methods.addPrerequisite = async function(prerequisiteId) {
  if (!this.prerequisites.includes(prerequisiteId)) {
    this.prerequisites.push(prerequisiteId);
    await this.save();
  }
};

lessonSchema.methods.removePrerequisite = async function(prerequisiteId) {
  this.prerequisites = this.prerequisites.filter(id => id.toString() !== prerequisiteId.toString());
  await this.save();
};

lessonSchema.methods.addResource = async function(resourceId) {
  if (!this.resources.includes(resourceId)) {
    this.resources.push(resourceId);
    await this.save();
  }
};

lessonSchema.methods.removeResource = async function(resourceId) {
  this.resources = this.resources.filter(id => id.toString() !== resourceId.toString());
  await this.save();
};

lessonSchema.methods.markAsComplete = async function(userId) {
  const alreadyCompleted = this.completedBy.some(completion => completion.user.toString() === userId.toString());
  if (!alreadyCompleted) {
    this.completedBy.push({ user: userId });
    await this.save();
  }
};

lessonSchema.methods.markAsIncomplete = async function(userId) {
  this.completedBy = this.completedBy.filter(completion => completion.user.toString() !== userId.toString());
  await this.save();
};

// Méthodes statiques
lessonSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId, isDeleted: false }).sort('order');
};

lessonSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId, isDeleted: false });
};

// Middleware pre-save
lessonSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastLesson = await this.constructor.findOne({ courseId: this.courseId }).sort('-order');
    this.order = lastLesson ? lastLesson.order + 1 : 0;
  }
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson; 