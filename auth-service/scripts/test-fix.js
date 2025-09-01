const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFix() {
  console.log('🔧 Test des corrections apportées...\n');

  try {
    // Test 1: Créer un utilisateur
    console.log('1️⃣ Test: Création d\'un utilisateur');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'testfix@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Fix'
    });
    
    console.log('   ✅ Utilisateur créé');
    const token = registerResponse.data.token;
    console.log(`   Token: ${token ? 'Présent' : 'Absent'}`);
    console.log('');

    // Test 2: Récupérer le profil
    console.log('2️⃣ Test: Récupération du profil');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Profil récupéré');
      console.log(`   Nom: ${profileResponse.data.firstName} ${profileResponse.data.lastName}`);
      console.log(`   Email: ${profileResponse.data.email}`);
      console.log('');
      
    } catch (error) {
      console.log('   ❌ Erreur récupération profil:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
      console.log('');
    }

    // Test 3: Mise à jour du profil
    console.log('3️⃣ Test: Mise à jour du profil');
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
      console.log('');
      
    } catch (error) {
      console.log('   ❌ Erreur mise à jour:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
      console.log(`   Error: ${error.response?.data?.error}`);
      console.log('');
    }

    // Test 4: Test validation lastName vide
    console.log('4️⃣ Test: Validation lastName vide');
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
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Validation correcte: lastName vide rejeté');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Erreur inattendue:');
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.message}`);
      }
    }
    console.log('');

    console.log('🎉 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testFix();


