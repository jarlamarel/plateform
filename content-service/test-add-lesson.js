const axios = require('axios');

// Configuration de test
const BASE_URL = 'http://localhost:3003/api/content';
const TEST_COURSE_ID = '68a337a84ee5249d628cd688'; // ID de cours existant
const TEST_TOKEN = 'your-test-token-here'; // Remplacez par un token valide

async function testAddLesson() {
  try {
    console.log('🧪 Test d\'ajout de leçon...');
    
    const lessonData = {
      title: 'Test de leçon',
      description: 'Description de test pour vérifier que l\'ajout fonctionne',
      content: 'Contenu de test avec plus de 10 caractères pour passer la validation',
      duration: 30
    };
    
    console.log('📤 Données de la leçon:', lessonData);
    console.log('   URL:', `${BASE_URL}/courses/${TEST_COURSE_ID}/lessons`);
    
    // Faire la requête
    const response = await axios.post(
      `${BASE_URL}/courses/${TEST_COURSE_ID}/lessons`,
      lessonData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    
    console.log('✅ Leçon ajoutée avec succès !');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la leçon:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

// Exécuter le test
testAddLesson();
