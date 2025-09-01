const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSimple() {
  console.log('🧪 Test simple de l\'API d\'authentification...\n');

  try {
    // Test 1: Vérifier si le service répond
    console.log('1️⃣ Test: Vérification de la disponibilité du service');
    try {
      await axios.get(`${API_BASE_URL}/auth`);
      console.log('   ✅ Service d\'authentification accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Service d\'authentification non accessible');
        console.log('   Assurez-vous que le service est démarré sur le port 3001');
        return;
      }
      console.log('   ℹ️  Service accessible (erreur attendue pour GET /auth)');
    }
    console.log('');

    // Test 2: Créer un utilisateur de test
    console.log('2️⃣ Test: Création d\'un utilisateur de test');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      
      console.log('   ✅ Utilisateur créé avec succès');
      console.log(`   Token: ${registerResponse.data.token ? 'Présent' : 'Absent'}`);
      console.log(`   User: ${registerResponse.data.user ? 'Présent' : 'Absent'}`);
      
      const token = registerResponse.data.token;
      
      // Test 3: Mise à jour du profil
      console.log('\n3️⃣ Test: Mise à jour du profil');
      try {
        const updateResponse = await axios.put(`${API_BASE_URL}/users/me`, {
          firstName: 'Nouveau Prénom',
          lastName: 'Nouveau Nom'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('   ✅ Mise à jour réussie');
        console.log(`   Nouveau nom: ${updateResponse.data.firstName} ${updateResponse.data.lastName}`);
        
      } catch (updateError) {
        console.log('   ❌ Erreur lors de la mise à jour:');
        console.log(`   Status: ${updateError.response?.status}`);
        console.log(`   Message: ${updateError.response?.data?.message}`);
        console.log(`   Error: ${updateError.response?.data?.error}`);
      }
      
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.message?.includes('déjà utilisé')) {
        console.log('   ℹ️  Utilisateur existe déjà, tentative de connexion');
        
        // Essayer de se connecter
        try {
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
          });
          
          console.log('   ✅ Connexion réussie');
          const token = loginResponse.data.token;
          
          // Test de mise à jour
          console.log('\n3️⃣ Test: Mise à jour du profil (après connexion)');
          try {
            const updateResponse = await axios.put(`${API_BASE_URL}/users/me`, {
              firstName: 'Nouveau Prénom',
              lastName: 'Nouveau Nom'
            }, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('   ✅ Mise à jour réussie');
            console.log(`   Nouveau nom: ${updateResponse.data.firstName} ${updateResponse.data.lastName}`);
            
          } catch (updateError) {
            console.log('   ❌ Erreur lors de la mise à jour:');
            console.log(`   Status: ${updateError.response?.status}`);
            console.log(`   Message: ${updateError.response?.data?.message}`);
            console.log(`   Error: ${updateError.response?.data?.error}`);
            
            // Test avec des données vides
            console.log('\n4️⃣ Test: Mise à jour avec lastName vide (doit échouer)');
            try {
              await axios.put(`${API_BASE_URL}/users/me`, {
                firstName: 'Test',
                lastName: ''
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log('   ❌ Erreur: La validation aurait dû échouer');
            } catch (validationError) {
              console.log('   ✅ Validation correcte: lastName vide rejeté');
              console.log(`   Message: ${validationError.response?.data?.message}`);
            }
          }
          
        } catch (loginError) {
          console.log('   ❌ Erreur lors de la connexion:');
          console.log(`   Status: ${loginError.response?.status}`);
          console.log(`   Message: ${loginError.response?.data?.message}`);
        }
      } else {
        console.log('   ❌ Erreur lors de la création:');
        console.log(`   Status: ${registerError.response?.status}`);
        console.log(`   Message: ${registerError.response?.data?.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testSimple();


