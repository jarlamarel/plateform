const mongoose = require('mongoose');
require('dotenv').config();

// Import du modèle Course
const Course = require('../src/models/course.model');

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à la base de données...\n');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/content-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB établie');
    
    // Test de récupération des cours
    console.log('\n📚 Test de récupération des cours...');
    const courses = await Course.find({ isDeleted: { $ne: true } }).limit(5);
    console.log(`✅ ${courses.length} cours trouvés`);
    
    if (courses.length > 0) {
      console.log('\n📋 Premier cours:');
      console.log(`   Titre: ${courses[0].title}`);
      console.log(`   Catégorie: ${courses[0].category}`);
      console.log(`   Niveau: ${courses[0].level}`);
      console.log(`   Instructeur ID: ${courses[0].instructor}`);
    }
    
    // Test de comptage
    console.log('\n📊 Test de comptage...');
    const total = await Course.countDocuments({ isDeleted: { $ne: true } });
    console.log(`✅ Total des cours: ${total}`);
    
    // Test par catégorie
    console.log('\n🏷️ Test par catégorie...');
    const programmingCourses = await Course.find({ 
      category: 'programming',
      isDeleted: { $ne: true }
    });
    console.log(`✅ Cours de programmation: ${programmingCourses.length}`);
    
    // Test par niveau
    console.log('\n📈 Test par niveau...');
    const beginnerCourses = await Course.find({ 
      level: 'beginner',
      isDeleted: { $ne: true }
    });
    console.log(`✅ Cours débutant: ${beginnerCourses.length}`);
    
    console.log('\n🎉 Tous les tests réussis!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le test
testConnection();


