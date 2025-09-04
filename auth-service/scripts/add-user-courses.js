const mongoose = require('mongoose');
const UserCourse = require('../src/models/UserCourse');
const User = require('../src/models/User');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Cours de test avec des IDs fictifs (vous devrez les remplacer par de vrais IDs de cours)
const testCourses = [
  {
    courseId: '507f1f77bcf86cd799439011', // Introduction à JavaScript
    progress: 75,
    completed: false,
    enrolledAt: new Date('2025-01-15'),
    lastAccessedAt: new Date('2025-01-20')
  },
  {
    courseId: '507f1f77bcf86cd799439012', // React pour débutants
    progress: 100,
    completed: true,
    enrolledAt: new Date('2025-01-10'),
    lastAccessedAt: new Date('2025-01-18'),
    completedAt: new Date('2025-01-18')
  },
  {
    courseId: '507f1f77bcf86cd799439013', // Design UI/UX Avancé
    progress: 25,
    completed: false,
    enrolledAt: new Date('2025-01-22'),
    lastAccessedAt: new Date('2025-01-22')
  },
  {
    courseId: '507f1f77bcf86cd799439014', // Marketing Digital Complet
    progress: 0,
    completed: false,
    enrolledAt: new Date('2025-01-25'),
    lastAccessedAt: new Date('2025-01-25')
  },
  {
    courseId: '507f1f77bcf86cd799439015', // Python pour Data Science
    progress: 90,
    completed: false,
    enrolledAt: new Date('2025-01-12'),
    lastAccessedAt: new Date('2025-01-21')
  }
];

async function addUserCourses() {
  try {
    console.log('🚀 Ajout de cours utilisateur de test...\n');

    // Vérifier la connexion
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Erreur: MongoDB n\'est pas connecté');
      return;
    }

    console.log('✅ Connexion MongoDB établie');

    // Récupérer un utilisateur de test
    const testUser = await User.findOne({ email: 'momo@gmail.com' });
    if (!testUser) {
      console.log('❌ Utilisateur de test non trouvé. Création d\'un utilisateur...');
      
      // Créer un utilisateur de test si nécessaire
      const newUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'momo@gmail.com',
        password: 'password123',
        role: 'user',
        isVerified: true
      });
      
      await newUser.save();
      console.log('✅ Utilisateur de test créé');
    }

    const userId = testUser ? testUser._id : (await User.findOne({ email: 'momo@gmail.com' }))._id;
    console.log(`👤 Utilisateur: ${userId}`);

    // Supprimer les cours existants pour cet utilisateur
    const existingCount = await UserCourse.countDocuments({ userId });
    if (existingCount > 0) {
      console.log(`🗑️  Suppression de ${existingCount} cours existants...`);
      await UserCourse.deleteMany({ userId });
      console.log('✅ Cours existants supprimés');
    }

    // Ajouter les nouveaux cours
    console.log('➕ Ajout des cours de test...');
    const userCoursesToAdd = testCourses.map(course => ({
      ...course,
      userId: userId
    }));

    const insertedCourses = await UserCourse.insertMany(userCoursesToAdd);
    console.log(`✅ ${insertedCourses.length} cours ajoutés avec succès!`);

    // Afficher un résumé
    console.log('\n📋 Résumé des cours ajoutés:');
    insertedCourses.forEach((userCourse, index) => {
      const status = userCourse.completed ? '✅ Terminé' : 
                    userCourse.progress > 0 ? '🔄 En cours' : '⏸️  Non commencé';
      console.log(`${index + 1}. Cours ID: ${userCourse.courseId} - ${status} (${userCourse.progress}%)`);
    });

    // Statistiques
    const totalCourses = await UserCourse.countDocuments({ userId });
    const completedCourses = await UserCourse.countDocuments({ userId, completed: true });
    const inProgressCourses = await UserCourse.countDocuments({ 
      userId, 
      completed: false, 
      progress: { $gt: 0 } 
    });
    const notStartedCourses = await UserCourse.countDocuments({ 
      userId, 
      completed: false, 
      progress: 0 
    });

    console.log('\n📊 Statistiques:');
    console.log(`   Total: ${totalCourses} cours`);
    console.log(`   Terminés: ${completedCourses} cours`);
    console.log(`   En cours: ${inProgressCourses} cours`);
    console.log(`   Non commencés: ${notStartedCourses} cours`);

    console.log('\n🎉 Script terminé avec succès!');
    console.log('💡 Vous pouvez maintenant tester l\'affichage des cours dans le profil');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des cours:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
addUserCourses();



