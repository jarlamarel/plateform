import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface UserCourse {
  _id: string;
  courseId: string;
  userId: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  lastAccessedAt: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
      _id: string;
      firstName: string;
      lastName: string;
      name: string;
    };
    duration: number;
    category: string;
    level: string;
  };
}

export interface UserCoursesResponse {
  courses: UserCourse[];
  total: number;
  page: number;
  totalPages: number;
}

class UserCoursesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getUserCourses(page = 1, limit = 10): Promise<UserCoursesResponse> {
    try {
      const response = await axios.get(`${API_URL}/users/me/courses`, {
        headers: this.getAuthHeaders(),
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw error;
    }
  }

  async getEnrolledCourses(): Promise<UserCourse[]> {
    console.log('🔍 userCoursesService.getEnrolledCourses() appelé');
    console.log('   URL:', `${API_URL}/users/me/courses/enrolled`);
    console.log('   Headers:', this.getAuthHeaders());
    
    try {
      const response = await axios.get(`${API_URL}/users/me/courses/enrolled`, {
        headers: this.getAuthHeaders(),
        timeout: 10000 // Timeout de 10 secondes
      });
      console.log('✅ Réponse reçue:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching enrolled courses:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      
      // Gestion spécifique des erreurs de rate limiting
      if (error.response?.status === 429) {
        throw new Error('Trop de requêtes. Veuillez patienter un moment avant de réessayer.');
      }
      
      // Gestion des erreurs de timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
      }
      
      throw error;
    }
  }

  async getCompletedCourses(): Promise<UserCourse[]> {
    try {
      const response = await axios.get(`${API_URL}/users/me/courses/completed`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching completed courses:', error);
      throw error;
    }
  }

  async getInProgressCourses(): Promise<UserCourse[]> {
    try {
      const response = await axios.get(`${API_URL}/users/me/courses/in-progress`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching in-progress courses:', error);
      throw error;
    }
  }

  async updateCourseProgress(courseId: string, progress: number): Promise<void> {
    try {
      await axios.put(`${API_URL}/users/me/courses/${courseId}/progress`, {
        progress
      }, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  async markCourseAsCompleted(courseId: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/users/me/courses/${courseId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error marking course as completed:', error);
      throw error;
    }
  }
}

export default new UserCoursesService();
