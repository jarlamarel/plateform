const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration de test
const BASE_URL = 'http://localhost:3003/api/content';
const TEST_LESSON_ID = '68a337a94ee5249d628cd6a3'; // ID de leçon existant
const TEST_TOKEN = 'your-test-token-here'; // Remplacez par un token valide

async function testVideoUpload() {
  try {
    console.log('🧪 Test d\'upload de vidéo...');
    
    // Créer un fichier de test (1KB)
    const testFilePath = path.join(__dirname, 'test-video.mp4');
    const testContent = Buffer.alloc(1024, 'test-video-content');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('✅ Fichier de test créé:', testFilePath);
    
    // Préparer la requête
    const formData = new FormData();
    formData.append('video', fs.createReadStream(testFilePath));
    formData.append('title', 'Vidéo de test');
    formData.append('description', 'Description de test');
    
    // Headers
    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${TEST_TOKEN}`
    };
    
    console.log('📤 Envoi de la requête d\'upload...');
    console.log('   URL:', `${BASE_URL}/videos/lessons/${TEST_LESSON_ID}/upload`);
    console.log('   Headers:', headers);
    
    // Faire la requête
    const response = await axios.post(
      `${BASE_URL}/videos/lessons/${TEST_LESSON_ID}/upload`,
      formData,
      { headers }
    );
    
    console.log('✅ Upload réussi !');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    
    // Nettoyer
    fs.unlinkSync(testFilePath);
    console.log('🧹 Fichier de test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

// Exécuter le test
testVideoUpload();
