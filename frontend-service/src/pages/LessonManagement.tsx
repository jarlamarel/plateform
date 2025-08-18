import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import VideoUpload from '../components/VideoUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  videoUrl?: string;
  videoType?: string;
  videoFileName?: string;
  videoSize?: number;
  isPublished: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

const LessonManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    duration: 0,
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

  useEffect(() => {
    if (courseId) {
      fetchCourseAndLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails du cours
      const courseResponse = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData);
      }

      // Récupérer les leçons
      const lessonsResponse = await fetch(`${API_URL}/courses/${courseId}/lessons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.sort((a: Lesson, b: Lesson) => a.order - b.order));
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      toast.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      duration: 0,
    });
    setSelectedLesson(null);
    setShowLessonDialog(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
    });
    setSelectedLesson(lesson);
    setShowLessonDialog(true);
  };

  const handleSaveLesson = async () => {
    try {
      const url = selectedLesson 
        ? `${API_URL}/courses/${courseId}/lessons/${selectedLesson._id}`
        : `${API_URL}/courses/${courseId}/lessons`;
      
      const method = selectedLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(lessonForm),
      });

      if (response.ok) {
        toast.success(selectedLesson ? 'Leçon mise à jour' : 'Leçon créée');
        setShowLessonDialog(false);
        fetchCourseAndLessons();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }

    } catch (error) {
      console.error('Erreur sauvegarde leçon:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      try {
        const response = await fetch(`${API_URL}/courses/${courseId}/lessons/${lessonId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          toast.success('Leçon supprimée');
          fetchCourseAndLessons();
        } else {
          throw new Error('Erreur lors de la suppression');
        }

      } catch (error) {
        console.error('Erreur suppression leçon:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleVideoUpload = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowVideoDialog(true);
  };

  const handleVideoUploadSuccess = () => {
    setShowVideoDialog(false);
    fetchCourseAndLessons();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return (
      <Container>
        <Alert severity="error">Cours non trouvé</Alert>
      </Container>
    );
  }

  // Vérifier les permissions
  const isInstructor = user?.role === 'instructor';
  const isOwner = course.instructor._id === user?._id;
  const canEdit = isInstructor && isOwner;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(`/courses/${courseId}`)}
          sx={{ mb: 2 }}
        >
          Retour au cours
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des leçons
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {course.title}
        </Typography>

        {!canEdit && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Vous ne pouvez pas modifier ce cours car vous n'en êtes pas l'instructeur.
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Leçons du cours ({lessons.length})
                </Typography>
                {canEdit && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateLesson}
                  >
                    Ajouter une leçon
                  </Button>
                )}
              </Box>

              {lessons.length === 0 ? (
                <Alert severity="info">
                  Aucune leçon n'a encore été créée pour ce cours.
                </Alert>
              ) : (
                <List>
                  {lessons.map((lesson, index) => (
                    <React.Fragment key={lesson._id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {index + 1}. {lesson.title}
                              </Typography>
                              {lesson.videoUrl && (
                                <Chip
                                  icon={<VideoIcon />}
                                  label="Vidéo"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {!lesson.isPublished && (
                                <Chip
                                  label="Brouillon"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {lesson.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Durée: {lesson.duration} minutes
                              </Typography>
                            </Box>
                          }
                        />
                        
                        {canEdit && (
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleVideoUpload(lesson)}
                                title="Gérer la vidéo"
                              >
                                <VideoIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEditLesson(lesson)}
                                title="Modifier"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteLesson(lesson._id)}
                                title="Supprimer"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      {index < lessons.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de création/édition de leçon */}
      <Dialog open={showLessonDialog} onClose={() => setShowLessonDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLesson ? 'Modifier la leçon' : 'Créer une nouvelle leçon'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titre de la leçon"
            value={lessonForm.title}
            onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={lessonForm.description}
            onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Contenu de la leçon"
            multiline
            rows={6}
            value={lessonForm.content}
            onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Durée (en minutes)"
            type="number"
            value={lessonForm.duration}
            onChange={(e) => setLessonForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLessonDialog(false)}>
            Annuler
          </Button>
          <Button onClick={handleSaveLesson} variant="contained">
            {selectedLesson ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de gestion vidéo */}
      <Dialog open={showVideoDialog} onClose={() => setShowVideoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Gestion de la vidéo - {selectedLesson?.title}
        </DialogTitle>
        <DialogContent>
          {selectedLesson && (
            <VideoUpload
              lessonId={selectedLesson._id}
              existingVideo={selectedLesson.videoUrl ? {
                url: selectedLesson.videoUrl,
                type: selectedLesson.videoType || 'local',
                fileName: selectedLesson.videoFileName,
                fileSize: selectedLesson.videoSize,
              } : undefined}
              onUploadSuccess={handleVideoUploadSuccess}
              onDeleteSuccess={handleVideoUploadSuccess}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVideoDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LessonManagement;
