import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  thumbnail: string;
  price: number;
  rating: number;
  totalStudents: number;
  duration: number;
  category: string;
  level: string;
  sections: {
    _id: string;
    title: string;
    lessons: {
      _id: string;
      title: string;
      type: 'video' | 'quiz' | 'assignment';
      duration: number;
      completed: boolean;
    }[];
  }[];
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export interface CourseResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

class CourseService {
  async getCourses(filters: CourseFilters = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/courses`, { params: filters });
    return response.data;
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

export default new CourseService(); 