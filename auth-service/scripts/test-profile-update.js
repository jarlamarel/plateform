const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/auth';

// Fonction pour tester la mise à jour du profil
async function testProfileUpdate() {
  console.log('🧪 Test de mise à jour du profil utilisateur...\n');

  try {
    // Test 1: Connexion pour obtenir un token
    console.log('1️⃣ Test: Connexion utilisateur');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      email: 'momo@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Connexion réussie, token obtenu\n');

    // Test 2: Mise à jour valide du profil
    console.log('2️⃣ Test: Mise à jour valide du profil');
    const validUpdate = await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
      firstName: 'Momomo',
      lastName: 'Momo'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Mise à jour valide réussie');
    console.log(`   Utilisateur: ${validUpdate.data.firstName} ${validUpdate.data.lastName}\n`);

    // Test 3: Test avec firstName vide
    console.log('3️⃣ Test: Mise à jour avec firstName vide (doit échouer)');
    try {
      await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
        firstName: '',
        lastName: 'Momo'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ❌ Erreur: La validation aurait dû échouer');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Validation correcte: firstName vide rejeté');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Erreur inattendue:', error.message);
      }
    }
    console.log('');

    // Test 4: Test avec lastName vide
    console.log('4️⃣ Test: Mise à jour avec lastName vide (doit échouer)');
    try {
      await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
        firstName: 'Momomo',
        lastName: ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ❌ Erreur: La validation aurait dû échouer');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Validation correcte: lastName vide rejeté');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Erreur inattendue:', error.message);
      }
    }
    console.log('');

    // Test 5: Test avec email vide
    console.log('5️⃣ Test: Mise à jour avec email vide (doit échouer)');
    try {
      await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
        email: ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ❌ Erreur: La validation aurait dû échouer');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Validation correcte: email vide rejeté');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Erreur inattendue:', error.message);
      }
    }
    console.log('');

    // Test 6: Test avec des espaces uniquement
    console.log('6️⃣ Test: Mise à jour avec des espaces uniquement (doit échouer)');
    try {
      await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
        firstName: '   ',
        lastName: '   '
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ❌ Erreur: La validation aurait dû échouer');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Validation correcte: espaces uniquement rejetés');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Erreur inattendue:', error.message);
      }
    }
    console.log('');

    // Test 7: Mise à jour partielle (seulement firstName)
    console.log('7️⃣ Test: Mise à jour partielle (seulement firstName)');
    const partialUpdate = await axios.put(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
      firstName: 'Nouveau Prénom'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Mise à jour partielle réussie');
    console.log(`   Nouveau prénom: ${partialUpdate.data.firstName}\n`);

    // Test 8: Récupération du profil mis à jour
    console.log('8️⃣ Test: Récupération du profil mis à jour');
    const profileResponse = await axios.get(`${API_BASE_URL.replace('/auth', '/users')}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Profil récupéré avec succès');
    console.log(`   Prénom: ${profileResponse.data.firstName}`);
    console.log(`   Nom: ${profileResponse.data.lastName}`);
    console.log(`   Email: ${profileResponse.data.email}\n`);

    console.log('🎉 Tous les tests terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      email: 'momo@gmail.com',
      password: 'password123',
      firstName: 'Momo',
      lastName: 'Test'
    });
    
    console.log('✅ Utilisateur de test créé avec succès');
    console.log(`   Email: ${response.data.user.email}`);
    console.log(`   Nom: ${response.data.user.firstName} ${response.data.user.lastName}\n`);
    
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message.includes('déjà utilisé')) {
      console.log('ℹ️  Utilisateur de test existe déjà\n');
    } else {
      console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error.message);
    }
  }
}

// Exécuter les tests
async function main() {
  await createTestUser();
  await testProfileUpdate();
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { testProfileUpdate, createTestUser };
