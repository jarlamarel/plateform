const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour promouvoir un utilisateur
const promoteUser = async (email, newRole) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ Utilisateur avec l'email ${email} non trouvé`);
      return;
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    console.log(`✅ Utilisateur ${email} promu de "${oldRole}" à "${newRole}"`);
    console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Nouveau rôle: ${user.role}`);

  } catch (error) {
    console.error('❌ Erreur lors de la promotion:', error);
  }
};

// Fonction pour lister tous les utilisateurs
const listUsers = async () => {
  try {
    const users = await User.find({}, 'email firstName lastName role createdAt').sort({ createdAt: -1 });
    
    console.log('\n📋 Liste des utilisateurs:');
    console.log('─'.repeat(80));
    console.log('| Email'.padEnd(25) + '| Nom'.padEnd(20) + '| Rôle'.padEnd(12) + '| Créé le'.padEnd(20) + '|');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      const email = user.email.length > 23 ? user.email.substring(0, 20) + '...' : user.email;
      const name = `${user.firstName} ${user.lastName}`;
      const displayName = name.length > 18 ? name.substring(0, 15) + '...' : name;
      const date = user.createdAt.toLocaleDateString('fr-FR');
      
      console.log(`| ${email.padEnd(23)} | ${displayName.padEnd(18)} | ${user.role.padEnd(10)} | ${date.padEnd(18)} |`);
    });
    console.log('─'.repeat(80));
    console.log(`\n📊 Total: ${users.length} utilisateur(s)`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  }
};

// Fonction pour créer un utilisateur instructeur de test
const createTestInstructor = async () => {
  try {
    // Vérifier si l'utilisateur test existe déjà
    const existingUser = await User.findOne({ email: 'instructor@test.com' });
    if (existingUser) {
      console.log('ℹ️ L\'utilisateur instructeur test existe déjà');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`🎭 Rôle: ${existingUser.role}`);
      return;
    }

    // Créer un nouvel utilisateur instructeur
    const instructor = new User({
      email: 'instructor@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Instructor',
      role: 'instructor',
      isEmailVerified: true,
    });

    await instructor.save();
    console.log('✅ Utilisateur instructeur test créé avec succès!');
    console.log('📧 Email: instructor@test.com');
    console.log('🔑 Mot de passe: password123');
    console.log('🎭 Rôle: instructor');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'instructeur test:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'promote':
      const email = args[1];
      const role = args[2] || 'instructor';
      
      if (!email) {
        console.error('❌ Veuillez fournir un email');
        console.log('Usage: node promote-user.js promote <email> [role]');
        process.exit(1);
      }

      if (!['user', 'instructor', 'admin'].includes(role)) {
        console.error('❌ Rôle invalide. Utilisez: user, instructor, ou admin');
        process.exit(1);
      }

      await promoteUser(email, role);
      break;

    case 'list':
      await listUsers();
      break;

    case 'create-test':
      await createTestInstructor();
      break;

    default:
      console.log(`
🎓 Script de gestion des utilisateurs

Usage:
  node promote-user.js <command> [arguments]

Commandes disponibles:

  promote <email> [role]    Promouvoir un utilisateur
                           Rôles: user, instructor, admin
                           Par défaut: instructor

  list                     Lister tous les utilisateurs

  create-test             Créer un utilisateur instructeur de test
                         Email: instructor@test.com
                         Mot de passe: password123

Exemples:
  node promote-user.js promote user@example.com instructor
  node promote-user.js promote admin@example.com admin
  node promote-user.js list
  node promote-user.js create-test
      `);
  }

  mongoose.connection.close();
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

// Exécuter le script
main().catch(console.error);
