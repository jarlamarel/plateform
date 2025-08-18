import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

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
  async getCourses(filters: CourseFilters = {}): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/courses`, { params: filters });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course> {
    const response = await axios.get(`${API_URL}/courses/${id}`);
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await axios.post(`${API_URL}/courses/${courseId}/enroll`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await axios.get(`${API_URL}/courses/enrolled`);
    return response.data;
  }

  async getCourseProgress(courseId: string): Promise<{
    completedLessons: string[];
    progress: number;
  }> {
    const response = await axios.get(`${API_URL}/courses/${courseId}/progress`);
    return response.data;
  }

  async markLessonAsCompleted(courseId: string, lessonId: string): Promise<void> {
    await axios.post(`${API_URL}/courses/${courseId}/lessons/${lessonId}/complete`);
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
    const response = await axios.get(`${API_URL}/courses/${courseId}/reviews`);
    return response.data;
  }

  async addCourseReview(courseId: string, data: { rating: number; comment: string }): Promise<void> {
    await axios.post(`${API_URL}/courses/${courseId}/reviews`, data);
  }
}

const courseService = new CourseService();
export default courseService; 