const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api/content';

async function testCoursesAPI() {
  console.log('🧪 Test de l\'API des cours...\n');

  try {
    // Test 1: Vérifier si le service répond
    console.log('1️⃣ Test: Vérification de la disponibilité du service');
    try {
      await axios.get(`${API_BASE_URL}/courses`);
      console.log('   ✅ Service de contenu accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Service de contenu non accessible');
        console.log('   Assurez-vous que le service est démarré sur le port 3003');
        return;
      }
      console.log('   ℹ️  Service accessible');
    }
    console.log('');

    // Test 2: Récupérer tous les cours
    console.log('2️⃣ Test: Récupération de tous les cours');
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      
      console.log('   ✅ Réponse reçue');
      console.log(`   Type de réponse: ${typeof response.data}`);
      
      if (Array.isArray(response.data)) {
        console.log(`   Nombre de cours: ${response.data.length}`);
        console.log('   Format: Tableau simple');
        
        if (response.data.length > 0) {
          console.log('   Premier cours:', {
            title: response.data[0].title,
            category: response.data[0].category,
            level: response.data[0].level
          });
        }
      } else if (response.data && response.data.courses) {
        console.log(`   Nombre de cours: ${response.data.courses.length}`);
        console.log(`   Total: ${response.data.total}`);
        console.log(`   Page: ${response.data.page}`);
        console.log(`   Pages totales: ${response.data.totalPages}`);
        console.log('   Format: Objet avec pagination');
        
        if (response.data.courses.length > 0) {
          console.log('   Premier cours:', {
            title: response.data.courses[0].title,
            category: response.data.courses[0].category,
            level: response.data.courses[0].level
          });
        }
      } else {
        console.log('   ❌ Format de réponse inattendu');
        console.log('   Données reçues:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}`);
    }
    console.log('');

    // Test 3: Récupérer les cours avec pagination
    console.log('3️⃣ Test: Récupération avec pagination (limit=5)');
    try {
      const response = await axios.get(`${API_BASE_URL}/courses?limit=5`);
      
      if (response.data && response.data.courses) {
        console.log(`   ✅ Cours récupérés: ${response.data.courses.length}`);
        console.log(`   Total disponible: ${response.data.total}`);
        console.log(`   Page actuelle: ${response.data.page}`);
        console.log(`   Pages totales: ${response.data.totalPages}`);
      } else {
        console.log('   ❌ Format de réponse inattendu pour la pagination');
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération avec pagination:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}`);
    }
    console.log('');

    // Test 4: Récupérer les filtres disponibles
    console.log('4️⃣ Test: Récupération des filtres disponibles');
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/filters`);
      
      console.log('   ✅ Filtres récupérés');
      console.log('   Catégories:', response.data.categories);
      console.log('   Niveaux:', response.data.levels);
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des filtres:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}`);
    }
    console.log('');

    // Test 5: Test avec un filtre spécifique
    console.log('5️⃣ Test: Filtrage par catégorie (programming)');
    try {
      const response = await axios.get(`${API_BASE_URL}/courses?category=programming`);
      
      if (response.data && response.data.courses) {
        console.log(`   ✅ Cours trouvés: ${response.data.courses.length}`);
        if (response.data.courses.length > 0) {
          console.log('   Premier cours filtré:', {
            title: response.data.courses[0].title,
            category: response.data.courses[0].category
          });
        }
      } else if (Array.isArray(response.data)) {
        console.log(`   ✅ Cours trouvés: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log('   Premier cours filtré:', {
            title: response.data[0].title,
            category: response.data[0].category
          });
        }
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors du filtrage:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testCoursesAPI();


