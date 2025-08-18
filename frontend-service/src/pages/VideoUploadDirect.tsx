import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  VideoLibrary as VideoIcon,
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

const VideoUploadDirect: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [courseName, setCourseName] = useState<string>('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

  useEffect(() => {
    if (courseId) {
      fetchLessons();
      fetchCourseName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/courses/${courseId}/lessons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const lessonsData = await response.json();
        setLessons(lessonsData.sort((a: Lesson, b: Lesson) => a.order - b.order));
      } else {
        toast.error('Erreur lors de la récupération des leçons');
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des leçons:', error);
      toast.error('Erreur lors de la récupération des leçons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseName = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourseName(courseData.title);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du nom du cours:', error);
    }
  };

  const handleVideoManage = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowVideoDialog(true);
  };

  const handleVideoUploadSuccess = () => {
    setShowVideoDialog(false);
    setSelectedLesson(null);
    fetchLessons(); // Recharger les leçons pour voir les changements
    toast.success('Vidéo mise à jour avec succès !');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Vérification stricte des permissions
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🔐 Connexion Requise
          </Typography>
          <Typography variant="body1" gutterBottom>
            Vous devez être connecté en tant qu'instructeur pour accéder à cette page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Se connecter
          </Button>
        </Alert>
      </Container>
    );
  }

  if (user.role !== 'instructor') {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            ❌ Accès Refusé
          </Typography>
          <Typography variant="body1" gutterBottom>
            Cette interface d'upload de vidéos est réservée aux instructeurs uniquement.
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Votre rôle actuel : {user.role}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pour devenir instructeur, contactez l'administrateur.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Retour aux cours
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/courses')}
          sx={{ mb: 2 }}
        >
          Retour aux cours
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          🎥 Upload de Vidéos
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {courseName || `Cours ID: ${courseId}`}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Interface directe pour uploader des vidéos dans les leçons. 
          Cliquez sur l'icône vidéo à côté de chaque leçon pour ajouter ou modifier sa vidéo.
        </Alert>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Leçons disponibles ({lessons.length})
          </Typography>
          
          {lessons.length === 0 ? (
            <Alert severity="warning">
              Aucune leçon trouvée pour ce cours. 
              <Button 
                variant="text" 
                onClick={() => navigate(`/courses/${courseId}`)}
                sx={{ ml: 1 }}
              >
                Voir le cours
              </Button>
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
                            {lesson.title}
                          </Typography>
                          {lesson.videoUrl && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                backgroundColor: 'success.light', 
                                color: 'success.contrastText',
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1 
                              }}
                            >
                              Vidéo présente
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Durée: {lesson.duration} min • Ordre: {lesson.order}
                            {lesson.videoUrl && (
                              <>
                                <br />
                                Vidéo: {lesson.videoFileName || 'Fichier vidéo'}
                                {lesson.videoSize && ` (${Math.round(lesson.videoSize / (1024 * 1024))} MB)`}
                              </>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleVideoManage(lesson)}
                        color={lesson.videoUrl ? "success" : "primary"}
                        title={lesson.videoUrl ? "Modifier la vidéo" : "Ajouter une vidéo"}
                      >
                        <VideoIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < lessons.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialog de gestion vidéo */}
      {selectedLesson && showVideoDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowVideoDialog(false)}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎥 Gestion de la vidéo - {selectedLesson.title}
              </Typography>
              
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
              
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button onClick={() => setShowVideoDialog(false)}>
                  Fermer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default VideoUploadDirect;
