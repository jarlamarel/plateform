const mongoose = require('mongoose');

const userCourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lessonsCompleted: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  certificates: [{
    certificateId: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    downloadUrl: String
  }]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
userCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userCourseSchema.index({ userId: 1, completed: 1 });
userCourseSchema.index({ userId: 1, enrolledAt: -1 });

// Méthode pour calculer le progrès automatiquement
userCourseSchema.methods.calculateProgress = function() {
  if (this.lessonsCompleted && this.lessonsCompleted.length > 0) {
    // Logique pour calculer le progrès basé sur les leçons complétées
    // Cette méthode peut être étendue selon vos besoins
    return Math.round((this.lessonsCompleted.length / 10) * 100); // Exemple simplifié
  }
  return this.progress;
};

// Méthode pour marquer comme terminé
userCourseSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

// Méthode pour ajouter une leçon complétée
userCourseSchema.methods.addCompletedLesson = function(lessonId) {
  const existingLesson = this.lessonsCompleted.find(
    lesson => lesson.lessonId.toString() === lessonId.toString()
  );
  
  if (!existingLesson) {
    this.lessonsCompleted.push({ lessonId });
    this.lastAccessedAt = new Date();
    this.progress = this.calculateProgress();
    
    // Marquer comme terminé si le progrès atteint 100%
    if (this.progress >= 100) {
      this.completed = true;
      this.completedAt = new Date();
    }
  }
  
  return this.save();
};

// Méthode pour ajouter une note
userCourseSchema.methods.addNote = function(lessonId, content) {
  this.notes.push({ lessonId, content });
  return this.save();
};

const UserCourse = mongoose.model('UserCourse', userCourseSchema);

module.exports = UserCourse;
