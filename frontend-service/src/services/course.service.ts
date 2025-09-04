import axios from 'axios';

const API_URL = process.env.REACT_APP_CONTENT_API_URL || 'http://localhost:3003/api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  thumbnail: string;
  price: number;
  rating: number | {
    average: number;
    count: number;
  };
  enrolledStudents?: string[];
  totalStudents?: number;
  duration: number;
  category: string;
  level: string;
  lessons?: string[];
  sections?: Array<{
    _id: string;
    title: string;
    lessons: Array<{
      _id: string;
      title: string;
      type: 'video' | 'quiz' | 'assignment';
      duration: number;
      completed?: boolean;
    }>;
  }>;
  requirements?: string[];
  objectives?: string[];
  status: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export interface CourseResponse {
  courses?: Course[];
  total?: number;
  page?: number;
  totalPages?: number;
}

class CourseService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getCourses(filters: CourseFilters = {}): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/content/courses`, { params: filters });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course> {
    const response = await axios.get(`${API_URL}/content/courses/${id}`);
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await axios.post(`${API_URL}/content/courses/${courseId}/enroll`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await axios.get(`${API_URL}/content/courses/enrolled`);
    return response.data;
  }

  async getCourseProgress(courseId: string): Promise<{
    completedLessons: string[];
    progress: number;
  }> {
    const response = await axios.get(`${API_URL}/content/courses/${courseId}/progress`);
    return response.data;
  }

  async markLessonAsCompleted(courseId: string, lessonId: string): Promise<void> {
    await axios.post(`${API_URL}/content/courses/${courseId}/lessons/${lessonId}/complete`);
  }

  async getCourseReviews(courseId: string): Promise<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }[]> {
    const response = await axios.get(`${API_URL}/content/courses/${courseId}/reviews`);
    return response.data;
  }

  async addCourseReview(courseId: string, data: { rating: number; comment: string }): Promise<void> {
    await axios.post(`${API_URL}/content/courses/${courseId}/reviews`, data);
  }

  async updateCourseImage(courseId: string, imageUrl: string): Promise<Course> {
    const response = await axios.put(
      `${API_URL}/content/courses/${courseId}/image`,
      { imageUrl },
      { headers: this.getAuthHeaders() }
    );
    return response.data.course;
  }
}

const courseService = new CourseService();
export default courseService; 