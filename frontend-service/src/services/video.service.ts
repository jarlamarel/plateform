const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

export interface VideoInfo {
  lessonId: string;
  lessonTitle: string;
  videoUrl: string;
  videoType: 'local' | 'youtube' | 'vimeo' | 'external';
  duration?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface VideoUploadResponse {
  message: string;
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    videoType: string;
    fileSize: number;
  };
}

class VideoService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async uploadVideo(
    lessonId: string,
    videoFile: File,
    metadata?: {
      title?: string;
      description?: string;
      duration?: string;
    }
  ): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.duration) formData.append('duration', metadata.duration);

    const response = await fetch(`${API_URL}/videos/lessons/${lessonId}/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'upload de la vidéo');
    }

    return response.json();
  }

  async uploadVideoWithProgress(
    lessonId: string,
    videoFile: File,
    metadata?: {
      title?: string;
      description?: string;
      duration?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      if (metadata?.title) formData.append('title', metadata.title);
      if (metadata?.description) formData.append('description', metadata.description);
      if (metadata?.duration) formData.append('duration', metadata.duration);

      const xhr = new XMLHttpRequest();

      // Suivi du progrès
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Erreur lors du parsing de la réponse'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || 'Erreur lors de l\'upload'));
            } catch {
              reject(new Error('Erreur lors de l\'upload de la vidéo'));
            }
          }
        }
      };

      xhr.open('POST', `${API_URL}/videos/lessons/${lessonId}/upload`);
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async getVideoInfo(lessonId: string): Promise<VideoInfo> {
    const response = await fetch(`${API_URL}/videos/lessons/${lessonId}/info`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Aucune vidéo associée à cette leçon');
      }
      throw new Error('Erreur lors de la récupération des informations vidéo');
    }

    return response.json();
  }

  async deleteVideo(lessonId: string): Promise<void> {
    const response = await fetch(`${API_URL}/videos/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la vidéo');
    }
  }

  getVideoStreamUrl(filename: string): string {
    return `${API_URL}/videos/stream/${filename}`;
  }

  // Utilitaires pour valider les fichiers vidéo
  validateVideoFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez MP4, WebM, MOV ou AVI.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Le fichier est trop volumineux (max 500MB).',
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}

const videoService = new VideoService();
export default videoService;
