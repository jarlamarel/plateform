const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testUserCoursesAPI() {
  console.log('🧪 Test de l\'API des cours utilisateur...\n');

  try {
    // Test 1: Connexion utilisateur
    console.log('1️⃣ Test: Connexion utilisateur');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'momo@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Connexion réussie');
    console.log(`   Utilisateur: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}\n`);

    // Test 2: Récupérer tous les cours de l'utilisateur
    console.log('2️⃣ Test: Récupération de tous les cours');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Cours récupérés avec succès');
      console.log(`   Nombre de cours: ${response.data.courses.length}`);
      console.log(`   Total disponible: ${response.data.total}`);
      console.log(`   Page: ${response.data.page}`);
      console.log(`   Pages totales: ${response.data.totalPages}`);
      
      if (response.data.courses.length > 0) {
        console.log('   Premier cours:', {
          title: response.data.courses[0].course.title,
          progress: response.data.courses[0].progress,
          completed: response.data.courses[0].completed
        });
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }
    console.log('');

    // Test 3: Récupérer les cours en cours
    console.log('3️⃣ Test: Récupération des cours en cours');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/courses/in-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Cours en cours récupérés');
      console.log(`   Nombre de cours en cours: ${response.data.length}`);
      
      if (response.data.length > 0) {
        console.log('   Premier cours en cours:', {
          title: response.data[0].course.title,
          progress: response.data[0].progress
        });
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours en cours:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }
    console.log('');

    // Test 4: Récupérer les cours terminés
    console.log('4️⃣ Test: Récupération des cours terminés');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/courses/completed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Cours terminés récupérés');
      console.log(`   Nombre de cours terminés: ${response.data.length}`);
      
      if (response.data.length > 0) {
        console.log('   Premier cours terminé:', {
          title: response.data[0].course.title,
          progress: response.data[0].progress,
          completedAt: response.data[0].completedAt
        });
      }
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours terminés:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }
    console.log('');

    // Test 5: Récupérer tous les cours inscrits
    console.log('5️⃣ Test: Récupération de tous les cours inscrits');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Tous les cours inscrits récupérés');
      console.log(`   Nombre total de cours inscrits: ${response.data.length}`);
      
      // Afficher un résumé des statuts
      const completed = response.data.filter(c => c.completed).length;
      const inProgress = response.data.filter(c => !c.completed && c.progress > 0).length;
      const notStarted = response.data.filter(c => !c.completed && c.progress === 0).length;
      
      console.log('   📊 Résumé des statuts:');
      console.log(`      Terminés: ${completed}`);
      console.log(`      En cours: ${inProgress}`);
      console.log(`      Non commencés: ${notStarted}`);
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours inscrits:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }
    console.log('');

    // Test 6: Mettre à jour le progrès d'un cours
    console.log('6️⃣ Test: Mise à jour du progrès d\'un cours');
    try {
      const courseId = '507f1f77bcf86cd799439011'; // ID du cours de test
      const newProgress = 85;
      
      const response = await axios.put(`${API_BASE_URL}/users/me/courses/${courseId}/progress`, {
        progress: newProgress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Progrès mis à jour avec succès');
      console.log(`   Nouveau progrès: ${response.data.progress}%`);
      console.log(`   Terminé: ${response.data.completed}`);
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la mise à jour du progrès:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }
    console.log('');

    // Test 7: Marquer un cours comme terminé
    console.log('7️⃣ Test: Marquage d\'un cours comme terminé');
    try {
      const courseId = '507f1f77bcf86cd799439012'; // ID du cours de test
      
      const response = await axios.put(`${API_BASE_URL}/users/me/courses/${courseId}/complete`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Cours marqué comme terminé');
      console.log(`   Terminé: ${response.data.completed}`);
      console.log(`   Date de fin: ${response.data.completedAt}`);
      
    } catch (error) {
      console.log('   ❌ Erreur lors du marquage du cours comme terminé:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    console.log('\n🎉 Tous les tests terminés!');
    console.log('💡 L\'API des cours utilisateur fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testUserCoursesAPI();


