// Script de diagnostic pour les cours utilisateur
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function debugUserCourses() {
  console.log('🔍 Diagnostic des cours utilisateur...\n');

  try {
    // 1. Vérifier si le service d'authentification est accessible
    console.log('1️⃣ Test de connectivité du service d\'authentification...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('   ✅ Service d\'authentification accessible');
      console.log('   MongoDB status:', healthResponse.data.mongodb);
    } catch (error) {
      console.log('   ❌ Service d\'authentification non accessible');
      console.log(`   Erreur: ${error.message}`);
      return;
    }

    // 2. Tester la connexion utilisateur
    console.log('\n2️⃣ Test de connexion utilisateur...');
    let token;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'momo@gmail.com',
        password: 'password123'
      });
      token = loginResponse.data.token;
      console.log('   ✅ Connexion réussie');
      console.log(`   Utilisateur: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
      console.log(`   ID utilisateur: ${loginResponse.data.user._id}`);
    } catch (error) {
      console.log('   ❌ Échec de la connexion');
      console.log(`   Erreur: ${error.response?.data?.message || error.message}`);
      
      // Essayer de créer l'utilisateur
      console.log('\n   🔄 Tentative de création de l\'utilisateur...');
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          firstName: 'Test',
          lastName: 'User',
          email: 'momo@gmail.com',
          password: 'password123'
        });
        console.log('   ✅ Utilisateur créé');
        
        // Reconnecter
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'momo@gmail.com',
          password: 'password123'
        });
        token = loginResponse.data.token;
        console.log('   ✅ Reconnexion réussie');
        console.log(`   ID utilisateur: ${loginResponse.data.user._id}`);
      } catch (createError) {
        console.log('   ❌ Échec de création de l\'utilisateur');
        console.log(`   Erreur: ${createError.response?.data?.message || createError.message}`);
        return;
      }
    }

    // 3. Vérifier les cours de l'utilisateur
    console.log('\n3️⃣ Test des cours de l\'utilisateur...');
    
    // Test des cours inscrits
    try {
      console.log('   📡 Requête vers /users/me/courses/enrolled...');
      const enrolledResponse = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Cours inscrits récupérés');
      console.log(`   Nombre de cours: ${enrolledResponse.data.length}`);
      
      if (enrolledResponse.data.length > 0) {
        console.log('   Premier cours:', {
          id: enrolledResponse.data[0]._id,
          courseId: enrolledResponse.data[0].courseId,
          title: enrolledResponse.data[0].course?.title || 'Titre non disponible',
          progress: enrolledResponse.data[0].progress,
          completed: enrolledResponse.data[0].completed
        });
      } else {
        console.log('   ⚠️  Aucun cours trouvé pour cet utilisateur');
      }
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des cours inscrits');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 404) {
        console.log('   💡 L\'endpoint n\'existe pas. Vérifier les routes.');
      }
    }

    // 4. Si aucun cours, essayer d'en ajouter
    console.log('\n4️⃣ Vérification et ajout de données de test...');
    try {
      const enrolledResponse = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (enrolledResponse.data.length === 0) {
        console.log('   ⚠️  Aucun cours trouvé. Ajout de données de test...');
        
        // Ajouter plusieurs cours de test
        const testCourses = [
          {
            courseId: '507f1f77bcf86cd799439011',
            progress: 50,
            completed: false
          },
          {
            courseId: '507f1f77bcf86cd799439012',
            progress: 100,
            completed: true
          },
          {
            courseId: '507f1f77bcf86cd799439013',
            progress: 25,
            completed: false
          }
        ];
        
        for (const testCourse of testCourses) {
          try {
            await axios.put(`${API_BASE_URL}/users/me/courses/${testCourse.courseId}/progress`, {
              progress: testCourse.progress
            }, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   ✅ Cours ${testCourse.courseId} ajouté (${testCourse.progress}%)`);
          } catch (addError) {
            console.log(`   ❌ Erreur lors de l'ajout du cours ${testCourse.courseId}:`);
            console.log(`   Erreur: ${addError.response?.data?.message || addError.message}`);
          }
        }
        
        // Vérifier à nouveau
        console.log('\n   🔄 Vérification après ajout...');
        const newEnrolledResponse = await axios.get(`${API_BASE_URL}/users/me/courses/enrolled`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`   📊 Nombre de cours après ajout: ${newEnrolledResponse.data.length}`);
        
      } else {
        console.log('   ✅ Des cours existent déjà');
      }
    } catch (error) {
      console.log('   ❌ Erreur lors de la vérification des données');
      console.log(`   Erreur: ${error.response?.data?.message || error.message}`);
    }

    // 5. Test des autres endpoints
    console.log('\n5️⃣ Test des autres endpoints...');
    
    const endpoints = [
      '/users/me/courses',
      '/users/me/courses/in-progress',
      '/users/me/courses/completed'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`   ✅ ${endpoint}: ${response.data.length || response.data.courses?.length || 0} cours`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 Diagnostic terminé!');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifier que le service d\'authentification est démarré sur le port 3001');
    console.log('   2. Vérifier que MongoDB est connecté');
    console.log('   3. Exécuter: cd auth-service && node scripts/add-user-courses.js');
    console.log('   4. Redémarrer le frontend si nécessaire');
    console.log('   5. Vérifier que l\'utilisateur est connecté dans le frontend');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le diagnostic
debugUserCourses();
