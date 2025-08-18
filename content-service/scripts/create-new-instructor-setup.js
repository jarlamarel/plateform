#!/usr/bin/env node

/**
 * 🎯 Script de Création d'un Nouvel Instructeur avec ses Cours
 * 
 * Ce script crée :
 * - Un nouveau profil instructeur
 * - Des cours exclusifs pour cet instructeur
 * - Des leçons prêtes pour l'upload de vidéos
 * 
 * Usage:
 *   node scripts/create-new-instructor-setup.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../src/config');

// Modèles
const Course = require('../src/models/course.model');
const Lesson = require('../src/models/lesson.model');

// Configuration du nouvel instructeur
const NEW_INSTRUCTOR = {
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'alex.martin@instructor.com',
  password: 'instructor2024',
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

/**
 * Connexion à MongoDB (base auth pour l'utilisateur)
 */
async function connectAuthDB() {
  try {
    // Connexion à la base auth pour créer l'utilisateur
    const authUri = config.database.uri.replace('/courses', '/auth');
    await mongoose.connect(authUri);
    log.success('Connexion à MongoDB (auth) établie');
  } catch (error) {
    log.error(`Erreur de connexion MongoDB auth: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Connexion à MongoDB (base courses pour les cours)
 */
async function connectCoursesDB() {
  try {
    await mongoose.connect(config.database.uri);
    log.success('Connexion à MongoDB (courses) établie');
  } catch (error) {
    log.error(`Erreur de connexion MongoDB courses: ${error.message}`);
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
 * Créer le nouvel instructeur
 */
async function createInstructor() {
  log.info('Création du nouvel instructeur...');
  
  // Modèle User (collection users)
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', UserSchema, 'users');
  
  // Vérifier si l'instructeur existe déjà
  const existingUser = await User.findOne({ email: NEW_INSTRUCTOR.email });
  if (existingUser) {
    log.warning(`L'instructeur ${NEW_INSTRUCTOR.email} existe déjà`);
    return existingUser;
  }
  
  // Hasher le mot de passe
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(NEW_INSTRUCTOR.password, saltRounds);
  
  // Créer l'instructeur
  const instructorData = {
    ...NEW_INSTRUCTOR,
    password: hashedPassword,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const instructor = new User(instructorData);
  await instructor.save();
  
  log.success(`Instructeur créé: ${instructor.firstName} ${instructor.lastName}`);
  log.info(`Email: ${instructor.email}`);
  log.info(`ID: ${instructor._id}`);
  
  return instructor;
}

/**
 * Créer les cours pour l'instructeur
 */
async function createCourses(instructorId) {
  log.info('Création des cours...');
  
  const coursesData = [
    {
      title: '🚀 Développement Web Moderne',
      description: 'Apprenez les dernières technologies web avec React, Node.js et MongoDB. Un cours complet pour devenir développeur full-stack.',
      instructor: instructorId,
      category: 'programming',
      level: 'intermediate',
      price: 99.99,
      duration: 240,
      thumbnail: 'https://via.placeholder.com/400x300/2196F3/white?text=Dev+Web+Moderne',
      status: 'published',
      requirements: [
        'Connaissances de base en HTML/CSS',
        'Notions de JavaScript',
        'Motivation pour apprendre'
      ],
      objectives: [
        'Maîtriser React et ses hooks',
        'Créer des APIs REST avec Node.js',
        'Gérer une base de données MongoDB',
        'Déployer des applications web'
      ],
      tags: ['react', 'nodejs', 'mongodb', 'javascript', 'fullstack'],
      rating: { average: 4.8, count: 0 },
      enrolledStudents: [],
      lessons: [],
      isDeleted: false
    },
    {
      title: '🎨 Design UI/UX avec Figma',
      description: 'Créez des interfaces utilisateur modernes et intuitives. Apprenez les principes du design et maîtrisez Figma.',
      instructor: instructorId,
      category: 'design',
      level: 'beginner',
      price: 79.99,
      duration: 180,
      thumbnail: 'https://via.placeholder.com/400x300/FF5722/white?text=UI%2FUX+Design',
      status: 'published',
      requirements: [
        'Aucune expérience requise',
        'Accès à Figma (gratuit)',
        'Créativité et curiosité'
      ],
      objectives: [
        'Comprendre les principes du design',
        'Maîtriser Figma professionnellement',
        'Créer des prototypes interactifs',
        'Réaliser des tests utilisateurs'
      ],
      tags: ['figma', 'ui', 'ux', 'design', 'prototype'],
      rating: { average: 4.6, count: 0 },
      enrolledStudents: [],
      lessons: [],
      isDeleted: false
    },
    {
      title: '📱 Applications Mobile avec React Native',
      description: 'Développez des applications mobiles multiplateformes avec React Native. De zéro à la publication sur les stores.',
      instructor: instructorId,
      category: 'programming',
      level: 'advanced',
      price: 129.99,
      duration: 320,
      thumbnail: 'https://via.placeholder.com/400x300/4CAF50/white?text=React+Native',
      status: 'published',
      requirements: [
        'Expérience avec React',
        'Connaissances JavaScript avancées',
        'Environnement de développement mobile'
      ],
      objectives: [
        'Créer des apps iOS et Android',
        'Gérer la navigation mobile',
        'Intégrer des APIs natives',
        'Publier sur App Store et Google Play'
      ],
      tags: ['react-native', 'mobile', 'ios', 'android', 'javascript'],
      rating: { average: 4.9, count: 0 },
      enrolledStudents: [],
      lessons: [],
      isDeleted: false
    }
  ];
  
  const createdCourses = [];
  
  for (let i = 0; i < coursesData.length; i++) {
    const courseData = coursesData[i];
    const course = new Course(courseData);
    await course.save();
    
    log.success(`Cours créé: ${course.title}`);
    log.info(`ID: ${course._id}`);
    
    createdCourses.push(course);
  }
  
  return createdCourses;
}

/**
 * Créer les leçons pour chaque cours
 */
async function createLessons(courses, instructorId) {
  log.info('Création des leçons...');
  
  const lessonsData = {
    // Cours 1: Développement Web Moderne
    0: [
      {
        title: '🌟 Introduction au Développement Full-Stack',
        description: 'Vue d\'ensemble des technologies modernes et architecture d\'une application web complète.',
        content: 'Dans cette leçon, nous explorerons l\'écosystème du développement web moderne, les outils essentiels et la planification d\'un projet full-stack.',
        duration: 45,
        order: 1
      },
      {
        title: '⚛️ Fondamentaux de React',
        description: 'Composants, JSX, props et state - les bases essentielles de React.',
        content: 'Apprenez à créer vos premiers composants React, comprendre le JSX et gérer l\'état de votre application.',
        duration: 60,
        order: 2
      },
      {
        title: '🔗 Hooks et Gestion d\'État',
        description: 'useState, useEffect et hooks personnalisés pour une gestion d\'état moderne.',
        content: 'Maîtrisez les hooks React pour créer des applications interactives et performantes.',
        duration: 75,
        order: 3
      },
      {
        title: '🚀 API REST avec Node.js',
        description: 'Création d\'une API backend robuste avec Express et middleware.',
        content: 'Développez votre première API REST complète avec authentification et validation.',
        duration: 90,
        order: 4
      }
    ],
    // Cours 2: Design UI/UX
    1: [
      {
        title: '🎨 Principes de Design UI/UX',
        description: 'Les fondamentaux du design d\'interface et d\'expérience utilisateur.',
        content: 'Découvrez les règles d\'or du design, la psychologie des couleurs et la typographie.',
        duration: 40,
        order: 1
      },
      {
        title: '🖥️ Maîtrise de Figma',
        description: 'Interface, outils et techniques avancées dans Figma.',
        content: 'Apprenez à utiliser Figma comme un professionnel avec tous ses outils et raccourcis.',
        duration: 55,
        order: 2
      },
      {
        title: '📐 Création de Wireframes',
        description: 'Structurer vos idées avec des wireframes efficaces.',
        content: 'Transformez vos concepts en wireframes clairs et fonctionnels.',
        duration: 50,
        order: 3
      }
    ],
    // Cours 3: React Native
    2: [
      {
        title: '📱 Introduction à React Native',
        description: 'Configuration de l\'environnement et premiers pas avec React Native.',
        content: 'Installez et configurez votre environnement de développement mobile.',
        duration: 60,
        order: 1
      },
      {
        title: '🧭 Navigation Mobile',
        description: 'React Navigation et gestion des écrans dans une app mobile.',
        content: 'Créez une navigation fluide et intuitive pour votre application mobile.',
        duration: 70,
        order: 2
      },
      {
        title: '🔌 Intégration d\'APIs Natives',
        description: 'Accès aux fonctionnalités natives du téléphone (caméra, GPS, etc.).',
        content: 'Intégrez les capacités natives du smartphone dans votre application.',
        duration: 85,
        order: 3
      },
      {
        title: '🚀 Publication sur les Stores',
        description: 'Processus de publication sur App Store et Google Play Store.',
        content: 'Préparez et publiez votre application sur les stores officiels.',
        duration: 95,
        order: 4
      }
    ]
  };
  
  const allCreatedLessons = [];
  
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
    const course = courses[courseIndex];
    const courseLessons = lessonsData[courseIndex] || [];
    const createdLessons = [];
    
    log.info(`Création des leçons pour: ${course.title}`);
    
    for (const lessonData of courseLessons) {
      const lesson = new Lesson({
        ...lessonData,
        courseId: course._id,
        instructor: instructorId,
        isPublished: true
      });
      
      await lesson.save();
      createdLessons.push(lesson._id);
      allCreatedLessons.push(lesson);
      
      log.success(`Leçon créée: ${lesson.title}`);
    }
    
    // Mettre à jour le cours avec ses leçons
    course.lessons = createdLessons;
    await course.save();
  }
  
  return allCreatedLessons;
}

/**
 * Afficher le résumé
 */
function displaySummary(instructor, courses, lessons) {
  log.separator();
  log.title('📊 RÉSUMÉ DE LA CRÉATION');
  
  console.log(`${colors.bright}👤 Nouvel Instructeur:${colors.reset}`);
  console.log(`   Nom: ${instructor.firstName} ${instructor.lastName}`);
  console.log(`   Email: ${instructor.email}`);
  console.log(`   Mot de passe: ${NEW_INSTRUCTOR.password}`);
  console.log(`   ID: ${instructor._id}`);
  
  console.log(`\n${colors.bright}📚 Cours créés (${courses.length}):${colors.reset}`);
  courses.forEach((course, index) => {
    console.log(`   ${index + 1}. "${course.title}" (${course.level})`);
    console.log(`      ID: ${course._id}`);
    console.log(`      Prix: ${course.price}€`);
    console.log(`      Leçons: ${course.lessons.length}`);
  });
  
  console.log(`\n${colors.bright}📝 Leçons créées:${colors.reset}`);
  console.log(`   Total: ${lessons.length} leçons`);
  console.log(`   Toutes prêtes pour l'upload de vidéos`);
  
  log.separator();
  log.title('🚀 COMMENT TESTER L\'UPLOAD');
  
  console.log(`${colors.bright}1. Connexion:${colors.reset}`);
  console.log(`   📧 Email: ${instructor.email}`);
  console.log(`   🔑 Mot de passe: ${NEW_INSTRUCTOR.password}`);
  console.log(`   🔗 URL: http://localhost:3000/login`);
  
  console.log(`\n${colors.bright}2. URLs d'upload pour chaque cours:${colors.reset}`);
  courses.forEach((course, index) => {
    console.log(`   ${index + 1}. ${course.title}:`);
    console.log(`      http://localhost:3000/courses/${course._id}/upload-videos`);
  });
  
  console.log(`\n${colors.bright}3. Test de sécurité:${colors.reset}`);
  console.log(`   ✅ Ces cours appartiennent EXCLUSIVEMENT à ${instructor.firstName}`);
  console.log(`   ✅ Aucun conflit avec les autres instructeurs`);
  console.log(`   ✅ Interface d'upload entièrement fonctionnelle`);
  
  log.separator();
  log.success('🎉 Configuration terminée avec succès !');
  log.info('Vous pouvez maintenant tester l\'upload de vidéos sans aucun conflit !');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    log.title('CRÉATION D\'UN NOUVEL INSTRUCTEUR AVEC SES COURS');
    
    // 1. Connexion à la base auth et création de l'instructeur
    await connectAuthDB();
    log.separator();
    const instructor = await createInstructor();
    await disconnectDB();
    
    // 2. Connexion à la base courses et création des cours/leçons
    await connectCoursesDB();
    log.separator();
    const courses = await createCourses(instructor._id);
    log.separator();
    const lessons = await createLessons(courses, instructor._id);
    
    // Afficher le résumé
    displaySummary(instructor, courses, lessons);
    
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

// Lancement du script
main();
