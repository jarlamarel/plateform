// Script de test rapide pour les cours utilisateur
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function quickTest() {
  console.log('🚀 Test rapide des cours utilisateur...\n');

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'momo@gmail.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('   ✅ Connecté');

    // 2. Test de l'endpoint
    console.log('\n2️⃣ Test de l\'endpoint...');
    const response = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Endpoint fonctionne');
    console.log(`   📊 Nombre de cours: ${response.data.length}`);

    if (response.data.length === 0) {
      console.log('\n3️⃣ Ajout de cours de test...');
      
      // Ajouter un cours de test
      await axios.put(`${API_BASE_URL}/users/me/courses/507f1f77bcf86cd799439011/progress`, {
        progress: 50
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Cours ajouté');

      // Vérifier à nouveau
      const newResponse = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   📊 Nouveau nombre de cours: ${newResponse.data.length}`);
    }

    console.log('\n🎉 Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
  }
}

quickTest();



