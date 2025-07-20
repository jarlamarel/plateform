const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.lessons',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number, // en secondes
    default: 0,
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  notes: String,
  resourcesDownloaded: [{
    type: String,
    url: String,
    downloadedAt: Date,
  }],
}, {
  timestamps: true,
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  lessonsProgress: [lessonProgressSchema],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  totalTimeSpent: {
    type: Number, // en minutes
    default: 0,
  },
  certificates: [{
    name: String,
    issuedAt: Date,
    url: String,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  completionDate: Date,
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.lessons',
  },
}, {
  timestamps: true,
});

// Méthode pour mettre à jour la progression d'une leçon
progressSchema.methods.updateLessonProgress = async function(lessonId, data) {
  const lessonProgress = this.lessonsProgress.find(
    lp => lp.lesson.toString() === lessonId.toString()
  );

  if (!lessonProgress) {
    this.lessonsProgress.push({
      lesson: lessonId,
      ...data,
    });
  } else {
    Object.assign(lessonProgress, data);
  }

  // Mettre à jour la progression globale
  const completedLessons = this.lessonsProgress.filter(lp => lp.completed).length;
  this.overallProgress = (completedLessons / this.lessonsProgress.length) * 100;

  // Vérifier si le cours est terminé
  if (this.overallProgress === 100 && !this.completed) {
    this.completed = true;
    this.completionDate = new Date();
  }

  return this.save();
};

// Méthode pour ajouter un certificat
progressSchema.methods.addCertificate = function(certificateData) {
  this.certificates.push({
    ...certificateData,
    issuedAt: new Date(),
  });
  return this.save();
};

// Méthode pour obtenir les statistiques de progression
progressSchema.methods.getStats = function() {
  return {
    overallProgress: this.overallProgress,
    totalTimeSpent: this.totalTimeSpent,
    completedLessons: this.lessonsProgress.filter(lp => lp.completed).length,
    totalLessons: this.lessonsProgress.length,
    certificates: this.certificates.length,
    lastAccessed: this.lastAccessed,
    completed: this.completed,
    completionDate: this.completionDate,
  };
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress; 