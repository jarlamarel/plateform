#!/usr/bin/env node

/**
 * 🎯 Script d'Attribution des Cours à un Instructeur
 * 
 * Ce script attribue TOUS les cours existants à l'instructeur spécifié :
 * - Email: instructor@test.com
 * - Nom: Test
 * - Prénom: Instructor
 * 
 * Usage:
 *   node scripts/assign-courses-to-instructor.js
 * 
 * Options:
 *   --create-instructor : Crée l'instructeur s'il n'existe pas
 *   --create-test-course : Crée un cours de test en plus
 *   --dry-run : Simule les changements sans les appliquer
 */

const mongoose = require('mongoose');
const path = require('path');

// Configuration
const config = require('../src/config');

// Modèles
const Course = require('../src/models/course.model');
const Lesson = require('../src/models/lesson.model');

// Configuration de l'instructeur cible
const TARGET_INSTRUCTOR = {
  email: 'instructor@test.com',
  firstName: 'Test',
  lastName: 'Instructor',
  role: 'instructor'
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}🎯 ${msg}${colors.reset}\n`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

// Arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  createInstructor: args.includes('--create-instructor'),
  createTestCourse: args.includes('--create-test-course'),
  dryRun: args.includes('--dry-run')
};

/**
 * Connexion à MongoDB
 */
async function connectDB() {
  try {
    // Configuration MongoDB sans les options dépréciées
    const mongoOptions = {
      // Suppression des options dépréciées useNewUrlParser et useUnifiedTopology
    };
    
    await mongoose.connect(config.database.uri, mongoOptions);
    log.success('Connexion à MongoDB établie');
  } catch (error) {
    log.error(`Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Déconnexion de MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    log.info('Connexion MongoDB fermée');
  } catch (error) {
    log.warning(`Erreur lors de la fermeture: ${error.message}`);
  }
}

/**
 * Trouve ou crée l'instructeur cible
 */
async function findOrCreateInstructor() {
  log.info('Recherche de l\'instructeur cible...');
  
  // Modèle User (collection users dans auth-service)
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', UserSchema, 'users');
  
  let instructor = await User.findOne({ email: TARGET_INSTRUCTOR.email });
  
  if (instructor) {
    log.success(`Instructeur trouvé: ${instructor.firstName} ${instructor.lastName} (${instructor.email})`);
    log.info(`ID: ${instructor._id}`);
    log.info(`Rôle: ${instructor.role}`);
    
    return instructor;
  }
  
  if (options.createInstructor) {
    log.warning('Instructeur non trouvé, création en cours...');
    
    if (options.dryRun) {
      log.info('[DRY RUN] Instructeur serait créé avec les données:');
      console.log(JSON.stringify(TARGET_INSTRUCTOR, null, 2));
      return { _id: 'fake-id-for-dry-run', ...TARGET_INSTRUCTOR };
    }
    
    instructor = new User({
      ...TARGET_INSTRUCTOR,
      password: '$2b$10$example.hash.for.password123', // Hash fictif
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await instructor.save();
    log.success(`Instructeur créé: ${instructor.firstName} ${instructor.lastName}`);
    
    return instructor;
  }
  
  log.error('Instructeur non trouvé !');
  log.info('Solutions possibles:');
  log.info('1. Utiliser --create-instructor pour le créer automatiquement');
  log.info('2. Créer manuellement: cd auth-service && node scripts/promote-user.js create-test');
  log.info('3. Vérifier que l\'instructeur existe déjà dans la base');
  
  return null;
}

/**
 * Attribue tous les cours à l'instructeur
 */
async function assignCoursesToInstructor(instructorId) {
  log.info('Récupération de tous les cours...');
  
  const courses = await Course.find({ isDeleted: { $ne: true } });
  log.info(`${courses.length} cours trouvé(s)`);
  
  if (courses.length === 0) {
    log.warning('Aucun cours trouvé dans la base de données');
    return { updated: 0, skipped: 0 };
  }
  
  let updated = 0;
  let skipped = 0;
  
  log.separator();
  log.title('Attribution des cours');
  
  for (const course of courses) {
    const currentInstructor = course.instructor?.toString();
    const targetInstructor = instructorId.toString();
    
    console.log(`\n📚 Cours: "${course.title}"`);
    log.info(`   ID: ${course._id}`);
    log.info(`   Statut: ${course.status}`);
    log.info(`   Instructeur actuel: ${currentInstructor || 'Non défini'}`);
    
    if (currentInstructor === targetInstructor) {
      log.success('   ✅ Déjà attribué au bon instructeur');
      skipped++;
      continue;
    }
    
    if (options.dryRun) {
      log.warning('   [DRY RUN] Serait mis à jour');
      updated++;
      continue;
    }
    
    try {
      await Course.findByIdAndUpdate(
        course._id,
        { 
          instructor: instructorId,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      log.success('   ✅ Instructeur mis à jour');
      updated++;
      
    } catch (error) {
      log.error(`   ❌ Erreur: ${error.message}`);
    }
  }
  
  return { updated, skipped };
}

/**
 * Attribue toutes les leçons à l'instructeur
 */
async function assignLessonsToInstructor(instructorId) {
  log.info('Récupération de toutes les leçons...');
  
  const lessons = await Lesson.find({});
  log.info(`${lessons.length} leçon(s) trouvée(s)`);
  
  if (lessons.length === 0) {
    return { updated: 0, skipped: 0 };
  }
  
  let updated = 0;
  let skipped = 0;
  
  for (const lesson of lessons) {
    const currentInstructor = lesson.instructor?.toString();
    const targetInstructor = instructorId.toString();
    
    if (currentInstructor === targetInstructor) {
      skipped++;
      continue;
    }
    
    if (options.dryRun) {
      updated++;
      continue;
    }
    
    try {
      await Lesson.findByIdAndUpdate(
        lesson._id,
        { 
          instructor: instructorId,
          updatedAt: new Date()
        }
      );
      updated++;
    } catch (error) {
      log.error(`Erreur leçon ${lesson._id}: ${error.message}`);
    }
  }
  
  return { updated, skipped };
}

/**
 * Crée un cours de test
 */
async function createTestCourse(instructorId) {
  if (!options.createTestCourse) return null;
  
  log.info('Création d\'un cours de test...');
  
  const testCourseData = {
    title: '🎯 Cours de Test - Upload Vidéo',
    description: 'Cours créé automatiquement pour tester l\'upload de vidéos et la gestion des leçons. Ce cours contient des leçons d\'exemple prêtes pour recevoir des vidéos.',
    instructor: instructorId,
    category: 'programming',
    level: 'beginner',
    price: 0,
    duration: 180,
    thumbnail: 'https://via.placeholder.com/400x300/4CAF50/white?text=Cours+de+Test',
    status: 'published',
    requirements: [
      'Aucun prérequis nécessaire',
      'Motivation pour apprendre',
      'Ordinateur avec connexion internet'
    ],
    objectives: [
      'Comprendre le système d\'upload de vidéos',
      'Maîtriser la gestion des leçons',
      'Tester les fonctionnalités d\'instructeur'
    ],
    tags: ['test', 'upload', 'vidéo', 'démo'],
    rating: { average: 0, count: 0 },
    enrolledStudents: [],
    lessons: [],
    isDeleted: false
  };
  
  if (options.dryRun) {
    log.info('[DRY RUN] Cours de test serait créé avec les données:');
    console.log(JSON.stringify(testCourseData, null, 2));
    return { _id: 'fake-course-id' };
  }
  
  const course = new Course(testCourseData);
  await course.save();
  
  log.success(`Cours de test créé: ${course.title}`);
  log.info(`ID du cours: ${course._id}`);
  
  // Créer des leçons de test
      const testLessons = [
      {
        title: '📹 Leçon 1: Introduction aux Vidéos',
        description: 'Première leçon pour tester l\'upload de vidéos',
        content: 'Cette leçon est prête à recevoir votre première vidéo. Utilisez l\'interface d\'upload pour ajouter du contenu vidéo.',
        duration: 30,
        order: 1,
        courseId: course._id,
        instructor: instructorId,
        isPublished: true
      },
      {
        title: '🎬 Leçon 2: Techniques Avancées',
        description: 'Deuxième leçon pour des vidéos plus complexes',
        content: 'Cette leçon peut contenir des vidéos de démonstration, des tutoriels ou des présentations.',
        duration: 45,
        order: 2,
        courseId: course._id,
        instructor: instructorId,
        isPublished: true
      },
      {
        title: '🚀 Leçon 3: Projet Pratique',
        description: 'Leçon pratique avec projet à réaliser',
        content: 'Utilisez cette leçon pour uploader des vidéos de projet, des corrections ou des démonstrations pratiques.',
        duration: 60,
        order: 3,
        courseId: course._id,
        instructor: instructorId,
        isPublished: true
      }
    ];
  
  const createdLessons = [];
  for (const lessonData of testLessons) {
    const lesson = new Lesson(lessonData);
    await lesson.save();
    createdLessons.push(lesson._id);
    log.success(`Leçon créée: ${lesson.title}`);
  }
  
  // Mettre à jour le cours avec les leçons
  course.lessons = createdLessons;
  await course.save();
  
  return course;
}

/**
 * Affiche un résumé des opérations
 */
function displaySummary(results, instructor, testCourse) {
  log.separator();
  log.title('📊 RÉSUMÉ DES OPÉRATIONS');
  
  console.log(`${colors.bright}👤 Instructeur cible:${colors.reset}`);
  console.log(`   Nom: ${instructor.firstName} ${instructor.lastName}`);
  console.log(`   Email: ${instructor.email}`);
  console.log(`   ID: ${instructor._id}`);
  
  console.log(`\n${colors.bright}📚 Cours:${colors.reset}`);
  console.log(`   Mis à jour: ${results.courses.updated}`);
  console.log(`   Déjà corrects: ${results.courses.skipped}`);
  console.log(`   Total traité: ${results.courses.updated + results.courses.skipped}`);
  
  console.log(`\n${colors.bright}📝 Leçons:${colors.reset}`);
  console.log(`   Mises à jour: ${results.lessons.updated}`);
  console.log(`   Déjà correctes: ${results.lessons.skipped}`);
  console.log(`   Total traité: ${results.lessons.updated + results.lessons.skipped}`);
  
  if (testCourse) {
    console.log(`\n${colors.bright}🎯 Cours de test:${colors.reset}`);
    console.log(`   Créé: ${testCourse.title}`);
    console.log(`   ID: ${testCourse._id}`);
  }
  
  if (options.dryRun) {
    log.warning('\n⚠️  Mode DRY RUN - Aucune modification réelle effectuée');
    log.info('Relancez sans --dry-run pour appliquer les changements');
  } else {
    log.success('\n🎉 Toutes les opérations ont été effectuées avec succès !');
  }
  
  console.log(`\n${colors.bright}🚀 Prochaines étapes:${colors.reset}`);
  console.log('1. Connectez-vous avec instructor@test.com');
  console.log('2. Allez sur la page des cours');
  console.log('3. Cliquez sur "Gérer les leçons" sur n\'importe quel cours');
  console.log('4. Uploadez vos vidéos via l\'interface graphique !');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    log.title('ATTRIBUTION DES COURS À L\'INSTRUCTEUR');
    
    if (options.dryRun) {
      log.warning('Mode DRY RUN activé - Simulation uniquement');
    }
    
    // Connexion à la base de données
    await connectDB();
    
    // Trouver ou créer l'instructeur
    const instructor = await findOrCreateInstructor();
    if (!instructor) {
      process.exit(1);
    }
    
    // Attribution des cours
    log.separator();
    const courseResults = await assignCoursesToInstructor(instructor._id);
    
    // Attribution des leçons
    log.separator();
    log.title('Attribution des leçons');
    const lessonResults = await assignLessonsToInstructor(instructor._id);
    log.success(`${lessonResults.updated} leçon(s) mise(s) à jour, ${lessonResults.skipped} déjà correcte(s)`);
    
    // Création d'un cours de test si demandé
    let testCourse = null;
    if (options.createTestCourse) {
      log.separator();
      log.title('Création du cours de test');
      testCourse = await createTestCourse(instructor._id);
    }
    
    // Affichage du résumé
    displaySummary({
      courses: courseResults,
      lessons: lessonResults
    }, instructor, testCourse);
    
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Gestion des signaux de fermeture
process.on('SIGINT', async () => {
  log.warning('\nInterruption détectée, fermeture propre...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.warning('\nTerminaison détectée, fermeture propre...');
  await disconnectDB();
  process.exit(0);
});

// Affichage de l'aide
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.cyan}🎯 Script d'Attribution des Cours à un Instructeur${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/assign-courses-to-instructor.js [options]

${colors.bright}Options:${colors.reset}
  --create-instructor    Crée l'instructeur s'il n'existe pas
  --create-test-course   Crée un cours de test avec 3 leçons
  --dry-run             Simule les changements sans les appliquer
  --help, -h            Affiche cette aide

${colors.bright}Exemples:${colors.reset}
  # Attribution simple (instructeur doit exister)
  node scripts/assign-courses-to-instructor.js

  # Création de l'instructeur + attribution
  node scripts/assign-courses-to-instructor.js --create-instructor

  # Tout en un : instructeur + cours de test + attribution
  node scripts/assign-courses-to-instructor.js --create-instructor --create-test-course

  # Simulation (aucune modification)
  node scripts/assign-courses-to-instructor.js --dry-run

${colors.bright}Instructeur cible:${colors.reset}
  Email: instructor@test.com
  Nom: Test Instructor
  Rôle: instructor
`);
  process.exit(0);
}

// Lancement du script
main();
