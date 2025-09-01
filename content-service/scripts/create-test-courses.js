const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modèle User local pour ce script
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'instructor'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash du mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Import du modèle Course
const Course = require('../src/models/course.model');

// Données de l'instructeur Alex Martin
const instructorData = {
  email: 'alex.martin@instructor.com',
  password: 'instructor2024',
  firstName: 'Alex',
  lastName: 'Martin',
  role: 'instructor',
  isEmailVerified: true,
  isPhoneVerified: true
};

// Données des cours de test avec diversité de catégories et niveaux
const testCourses = [
  // PROGRAMMING - BEGINNER
  {
    title: 'Introduction à JavaScript pour Débutants',
    description: 'Apprenez les bases de JavaScript avec des exercices pratiques et des projets concrets. Ce cours couvre les variables, fonctions, objets et la manipulation du DOM.',
    category: 'programming',
    level: 'beginner',
    price: 49.99,
    duration: 8,
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    requirements: ['Aucune connaissance préalable requise', 'Ordinateur avec navigateur web'],
    objectives: [
      'Comprendre les fondamentaux de JavaScript',
      'Créer des applications web interactives',
      'Manipuler le DOM',
      'Gérer les événements utilisateur'
    ],
    tags: ['javascript', 'web', 'débutant', 'programmation'],
    status: 'published'
  },
  {
    title: 'Python pour les Nuls',
    description: 'Découvrez Python de manière simple et amusante. Ce cours est parfait pour ceux qui n\'ont jamais programmé auparavant.',
    category: 'programming',
    level: 'beginner',
    price: 39.99,
    duration: 6,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    requirements: ['Aucune expérience en programmation requise'],
    objectives: [
      'Installer et configurer Python',
      'Écrire votre premier programme',
      'Comprendre les structures de données',
      'Créer des scripts automatisés'
    ],
    tags: ['python', 'débutant', 'automatisation'],
    status: 'published'
  },

  // PROGRAMMING - INTERMEDIATE
  {
    title: 'React.js Avancé : Hooks et Context API',
    description: 'Maîtrisez les concepts avancés de React avec les Hooks et la Context API. Créez des applications modernes et performantes.',
    category: 'programming',
    level: 'intermediate',
    price: 79.99,
    duration: 12,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    requirements: ['Connaissance de base en JavaScript', 'Expérience avec React'],
    objectives: [
      'Maîtriser les Hooks personnalisés',
      'Implémenter la Context API',
      'Optimiser les performances',
      'Créer des composants réutilisables'
    ],
    tags: ['react', 'hooks', 'context', 'intermédiaire'],
    status: 'published'
  },

  // DESIGN - BEGINNER
  {
    title: 'Design UI/UX pour Débutants',
    description: 'Apprenez les principes fondamentaux du design d\'interface utilisateur et d\'expérience utilisateur.',
    category: 'design',
    level: 'beginner',
    price: 59.99,
    duration: 8,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    requirements: ['Aucune expérience en design requise'],
    objectives: [
      'Comprendre les principes de design',
      'Créer des wireframes et prototypes',
      'Concevoir des interfaces intuitives',
      'Tester l\'expérience utilisateur'
    ],
    tags: ['design', 'ui', 'ux', 'débutant'],
    status: 'published'
  },

  // BUSINESS - BEGINNER
  {
    title: 'Entrepreneuriat pour Débutants',
    description: 'Découvrez les bases de l\'entrepreneuriat et lancez votre première entreprise étape par étape.',
    category: 'business',
    level: 'beginner',
    price: 44.99,
    duration: 6,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    requirements: ['Aucune expérience entrepreneuriale requise'],
    objectives: [
      'Valider votre idée d\'entreprise',
      'Créer un business plan',
      'Identifier votre marché cible',
      'Lancer votre MVP'
    ],
    tags: ['entrepreneuriat', 'business-plan', 'startup'],
    status: 'published'
  },

  // MARKETING - BEGINNER
  {
    title: 'Marketing Digital pour Débutants',
    description: 'Apprenez les fondamentaux du marketing digital et commencez à promouvoir vos produits en ligne.',
    category: 'marketing',
    level: 'beginner',
    price: 54.99,
    duration: 7,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    requirements: ['Aucune expérience en marketing requise'],
    objectives: [
      'Comprendre les canaux marketing',
      'Créer des campagnes publicitaires',
      'Analyser les performances',
      'Optimiser le ROI'
    ],
    tags: ['marketing', 'digital', 'publicité'],
    status: 'published'
  }
];

async function createInstructor() {
  try {
    // Vérifier si l'instructeur existe déjà
    let instructor = await User.findOne({ email: instructorData.email });
    
    if (!instructor) {
      // Créer l'instructeur
      instructor = new User(instructorData);
      await instructor.save();
      console.log('✅ Instructeur Alex Martin créé avec succès');
    } else {
      console.log('ℹ️  Instructeur Alex Martin existe déjà');
    }
    
    return instructor;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'instructeur:', error.message);
    throw error;
  }
}

async function createCourses(instructorId) {
  try {
    const createdCourses = [];
    
    for (const courseData of testCourses) {
      // Vérifier si le cours existe déjà
      const existingCourse = await Course.findOne({ 
        title: courseData.title,
        instructor: instructorId 
      });
      
      if (!existingCourse) {
        const course = new Course({
          ...courseData,
          instructor: instructorId
        });
        
        await course.save();
        createdCourses.push(course);
        console.log(`✅ Cours créé: ${course.title}`);
      } else {
        console.log(`ℹ️  Cours existe déjà: ${courseData.title}`);
      }
    }
    
    return createdCourses;
  } catch (error) {
    console.error('❌ Erreur lors de la création des cours:', error.message);
    throw error;
  }
}

async function displayStatistics() {
  try {
    const totalCourses = await Course.countDocuments();
    const coursesByCategory = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const coursesByLevel = await Course.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Statistiques des cours:');
    console.log(`Total des cours: ${totalCourses}`);
    
    console.log('\nPar catégorie:');
    coursesByCategory.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} cours`);
    });
    
    console.log('\nPar niveau:');
    coursesByLevel.forEach(level => {
      console.log(`  ${level._id}: ${level.count} cours`);
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Début du script de création des cours de test...\n');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/content-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à la base de données établie');
    
    // Créer l'instructeur
    const instructor = await createInstructor();
    
    // Créer les cours
    const courses = await createCourses(instructor._id);
    
    // Afficher les statistiques
    await displayStatistics();
    
    console.log('\n🎉 Script terminé avec succès!');
    console.log(`📚 ${courses.length} nouveaux cours créés`);
    
  } catch (error) {
    console.error('❌ Erreur dans le script:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de la base de données');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createInstructor, createCourses, testCourses };
