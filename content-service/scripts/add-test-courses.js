const mongoose = require('mongoose');
const Course = require('../src/models/course.model');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/content-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testCourses = [
  {
    title: 'Introduction à JavaScript',
    description: 'Apprenez les bases de JavaScript et commencez votre voyage dans le développement web',
    category: 'programming',
    level: 'beginner',
    price: 29.99,
    duration: 120,
    thumbnail: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=JavaScript',
    instructor: '507f1f77bcf86cd799439011', // ID fictif d'instructeur
    rating: { average: 4.5, count: 25 },
    tags: ['javascript', 'web', 'débutant'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'React pour débutants',
    description: 'Créez votre première application React et maîtrisez les composants',
    category: 'programming',
    level: 'beginner',
    price: 39.99,
    duration: 180,
    thumbnail: 'https://via.placeholder.com/300x200/61DAFB/000000?text=React',
    instructor: '507f1f77bcf86cd799439011',
    rating: { average: 4.8, count: 42 },
    tags: ['react', 'javascript', 'frontend'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Design UI/UX Avancé',
    description: 'Maîtrisez les principes de design moderne et créez des interfaces exceptionnelles',
    category: 'design',
    level: 'advanced',
    price: 59.99,
    duration: 240,
    thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Design',
    instructor: '507f1f77bcf86cd799439012',
    rating: { average: 4.7, count: 18 },
    tags: ['design', 'ui', 'ux', 'avancé'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Marketing Digital Complet',
    description: 'Stratégies complètes de marketing digital pour faire croître votre entreprise',
    category: 'marketing',
    level: 'intermediate',
    price: 49.99,
    duration: 200,
    thumbnail: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Marketing',
    instructor: '507f1f77bcf86cd799439013',
    rating: { average: 4.6, count: 31 },
    tags: ['marketing', 'digital', 'stratégie'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Gestion d\'Entreprise',
    description: 'Les fondamentaux de la gestion d\'entreprise et du leadership',
    category: 'business',
    level: 'intermediate',
    price: 44.99,
    duration: 160,
    thumbnail: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Business',
    instructor: '507f1f77bcf86cd799439014',
    rating: { average: 4.4, count: 22 },
    tags: ['business', 'gestion', 'leadership'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Python pour Data Science',
    description: 'Apprenez Python et ses bibliothèques pour l\'analyse de données',
    category: 'programming',
    level: 'intermediate',
    price: 54.99,
    duration: 220,
    thumbnail: 'https://via.placeholder.com/300x200/3776AB/FFFFFF?text=Python',
    instructor: '507f1f77bcf86cd799439015',
    rating: { average: 4.9, count: 38 },
    tags: ['python', 'data-science', 'analyse'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Angular Framework',
    description: 'Développez des applications web modernes avec Angular',
    category: 'programming',
    level: 'advanced',
    price: 64.99,
    duration: 280,
    thumbnail: 'https://via.placeholder.com/300x200/DD0031/FFFFFF?text=Angular',
    instructor: '507f1f77bcf86cd799439016',
    rating: { average: 4.3, count: 15 },
    tags: ['angular', 'typescript', 'framework'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Design Graphique Créatif',
    description: 'Libérez votre créativité avec les outils de design graphique',
    category: 'design',
    level: 'beginner',
    price: 34.99,
    duration: 140,
    thumbnail: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Graphic',
    instructor: '507f1f77bcf86cd799439017',
    rating: { average: 4.5, count: 28 },
    tags: ['design', 'graphique', 'créativité'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Stratégie Marketing Avancée',
    description: 'Techniques avancées de marketing pour maximiser vos résultats',
    category: 'marketing',
    level: 'advanced',
    price: 69.99,
    duration: 260,
    thumbnail: 'https://via.placeholder.com/300x200/E91E63/FFFFFF?text=Strategy',
    instructor: '507f1f77bcf86cd799439018',
    rating: { average: 4.7, count: 19 },
    tags: ['marketing', 'stratégie', 'avancé'],
    status: 'published',
    isDeleted: false
  },
  {
    title: 'Finance d\'Entreprise',
    description: 'Comprendre les fondamentaux de la finance d\'entreprise',
    category: 'business',
    level: 'beginner',
    price: 39.99,
    duration: 150,
    thumbnail: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Finance',
    instructor: '507f1f77bcf86cd799439019',
    rating: { average: 4.2, count: 24 },
    tags: ['finance', 'business', 'comptabilité'],
    status: 'published',
    isDeleted: false
  }
];

async function addTestCourses() {
  try {
    console.log('🚀 Ajout de cours de test dans la base de données...\n');

    // Vérifier la connexion
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Erreur: MongoDB n\'est pas connecté');
      console.log('État de la connexion:', mongoose.connection.readyState);
      return;
    }

    console.log('✅ Connexion MongoDB établie');

    // Supprimer les cours existants (optionnel)
    const existingCount = await Course.countDocuments();
    console.log(`📊 Cours existants dans la base: ${existingCount}`);

    if (existingCount > 0) {
      console.log('🗑️  Suppression des cours existants...');
      await Course.deleteMany({});
      console.log('✅ Cours existants supprimés');
    }

    // Ajouter les nouveaux cours
    console.log('➕ Ajout des cours de test...');
    const insertedCourses = await Course.insertMany(testCourses);
    
    console.log(`✅ ${insertedCourses.length} cours ajoutés avec succès!`);
    
    // Afficher un résumé
    console.log('\n📋 Résumé des cours ajoutés:');
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category} - ${course.level})`);
    });

    // Vérifier le total
    const totalCount = await Course.countDocuments();
    console.log(`\n📊 Total de cours dans la base: ${totalCount}`);

    console.log('\n🎉 Script terminé avec succès!');
    console.log('💡 Vous pouvez maintenant tester l\'API des cours');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des cours:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
addTestCourses();


