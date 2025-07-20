const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: {
        values: ['document', 'video', 'image', 'audio'],
        message: 'Le type doit être document, video, image ou audio',
      },
      required: [true, 'Le type est requis'],
    },
    file: {
      url: {
        type: String,
        required: [true, 'L\'URL du fichier est requise'],
      },
      key: {
        type: String,
        required: [true, 'La clé du fichier est requise'],
      },
      size: {
        type: Number,
        required: [true, 'La taille du fichier est requise'],
      },
      mimeType: {
        type: String,
        required: [true, 'Le type MIME est requis'],
      },
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Le cours est requis'],
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La leçon est requise'],
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'instructeur est requis'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    versions: [{
      url: String,
      key: String,
      size: Number,
      mimeType: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour la recherche
resourceSchema.index({ title: 'text', description: 'text' });

// Méthodes virtuelles
resourceSchema.virtual('versionCount').get(function() {
  return this.versions.length;
});

// Méthodes d'instance
resourceSchema.methods.addVersion = async function(versionData) {
  this.versions.push(versionData);
  await this.save();
};

resourceSchema.methods.removeVersion = async function(versionIndex) {
  if (versionIndex >= 0 && versionIndex < this.versions.length) {
    this.versions.splice(versionIndex, 1);
    await this.save();
  }
};

resourceSchema.methods.incrementDownloads = async function() {
  this.downloads += 1;
  await this.save();
};

// Méthodes statiques
resourceSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId, isDeleted: false });
};

resourceSchema.statics.findByLesson = function(lessonId) {
  return this.find({ lessonId, isDeleted: false });
};

resourceSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructorId, isDeleted: false });
};

// Middleware pre-save
resourceSchema.pre('save', function(next) {
  if (this.isModified('file')) {
    this.versions.push({
      url: this.file.url,
      key: this.file.key,
      size: this.file.size,
      mimeType: this.file.mimeType,
    });
  }
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource; 