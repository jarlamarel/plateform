import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Button,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayCircle as PlayCircleIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import courseService, { Course } from '../services/course.service';
import videoService from '../services/video.service';
import LoadingSpinner from '../components/LoadingSpinner';
import VideoPlayer from '../components/VideoPlayer';
import { toast } from 'react-toastify';

const CourseLearn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ completedLessons: string[]; progress: number } | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [currentVideoInfo, setCurrentVideoInfo] = useState<any>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchCourseProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Effet pour charger automatiquement la vidéo quand currentLesson change
  useEffect(() => {
    if (currentLesson) {
      loadVideoForLesson(currentLesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson]);

  const loadVideoForLesson = async (lessonId: string) => {
    setCurrentVideoInfo(null);
    setLoadingVideo(true);
    try {
      const videoInfo = await videoService.getVideoInfo(lessonId);
      setCurrentVideoInfo(videoInfo);
    } catch (error) {
      // Pas de vidéo pour cette leçon, c'est normal
      setCurrentVideoInfo(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  const fetchCourseDetails = useCallback(async () => {
    try {
      const courseData = await courseService.getCourseById(id!);
      setCourse(courseData);
      
      // Récupérer le paramètre de query pour la leçon
      const searchParams = new URLSearchParams(location.search);
      const lessonFromQuery = searchParams.get('lesson');
      
      if (lessonFromQuery) {
        // Si une leçon est spécifiée dans l'URL, la sélectionner
        setCurrentLesson(lessonFromQuery);
      } else if (!currentLesson && courseData.sections && courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
        // Sinon, définir la première leçon comme leçon courante si aucune n'est sélectionnée
        setCurrentLesson(courseData.sections[0].lessons[0]._id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du cours:', error);
      toast.error('Une erreur est survenue lors de la récupération des détails du cours');
    } finally {
      setLoading(false);
    }
  }, [id, currentLesson, location.search]);

  const fetchCourseProgress = useCallback(async () => {
    try {
      const progressData = await courseService.getCourseProgress(id!);
      setProgress(progressData);
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
    }
  }, [id]);

  const handleLessonClick = async (lessonId: string) => {
    setCurrentLesson(lessonId);
    await loadVideoForLesson(lessonId);
    
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleMarkAsCompleted = async (lessonId: string) => {
    try {
      await courseService.markLessonAsCompleted(id!, lessonId);
      toast.success('Leçon marquée comme terminée !');
      fetchCourseProgress();
    } catch (error) {
      console.error('Erreur lors de la validation de la leçon:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (loading || !course) {
    return <LoadingSpinner />;
  }

  const currentLessonData = course.sections
    ?.flatMap((section: any) => section.lessons)
    .find((lesson: any) => lesson._id === currentLesson);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Barre latérale */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress
              variant="determinate"
              value={progress?.progress || 0}
              size={40}
              sx={{ mr: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress?.progress || 0}% complété
            </Typography>
          </Box>
        </Box>
        <Divider />
        <List>
          {course.sections?.map((section: any) => (
            <React.Fragment key={section._id}>
              <ListItem>
                <ListItemText
                  primary={section.title}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                />
              </ListItem>
              {section.lessons.map((lesson: any) => {
                const isCompleted = progress?.completedLessons.includes(lesson._id);
                const isCurrent = lesson._id === currentLesson;

                return (
                  <ListItemButton
                    key={lesson._id}
                    selected={isCurrent}
                    onClick={() => handleLessonClick(lesson._id)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      {isCompleted ? (
                        <CheckCircleIcon color="success" />
                      ) : lesson.type === 'video' ? (
                        <PlayCircleIcon />
                      ) : lesson.type === 'quiz' ? (
                        <QuizIcon />
                      ) : (
                        <AssignmentIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.title}
                      secondary={`${lesson.duration} minutes`}
                    />
                  </ListItemButton>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 320px)` },
          ml: { md: '320px' },
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {currentLessonData ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {currentLessonData.title}
            </Typography>
            <Box sx={{ mb: 3 }}>
              {loadingVideo ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : currentVideoInfo ? (
                <VideoPlayer
                  videoUrl={currentVideoInfo.videoUrl}
                  videoType={currentVideoInfo.videoType}
                  title={currentVideoInfo.lessonTitle}
                  duration={currentVideoInfo.duration}
                  onProgress={(currentTime, duration) => {
                    // Optionnel: suivre la progression de visionnage
                  }}
                  onComplete={() => {
                    // Auto-marquer comme complété quand la vidéo est finie
                    if (!progress?.completedLessons.includes(currentLessonData._id)) {
                      handleMarkAsCompleted(currentLessonData._id);
                    }
                  }}
                />
              ) : currentLessonData.type === 'video' ? (
                <Box sx={{ 
                  bgcolor: 'grey.100', 
                  p: 4, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}>
                  <PlayCircleIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune vidéo disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cette leçon n'a pas encore de vidéo associée
                  </Typography>
                </Box>
              ) : currentLessonData.type === 'quiz' ? (
                <Box sx={{ bgcolor: 'info.light', p: 3, borderRadius: 2 }}>
                  <QuizIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Quiz</Typography>
                  <Typography>Le système de quiz sera bientôt disponible.</Typography>
                </Box>
              ) : (
                <Box sx={{ bgcolor: 'warning.light', p: 3, borderRadius: 2 }}>
                  <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Devoir</Typography>
                  <Typography>Le système de devoirs sera bientôt disponible.</Typography>
                </Box>
              )}
            </Box>

            {/* Contenu textuel de la leçon */}
            {currentLessonData.description && (
              <Typography variant="body1" paragraph>
                {currentLessonData.description}
              </Typography>
            )}

            {!progress?.completedLessons.includes(currentLessonData._id) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleMarkAsCompleted(currentLessonData._id)}
                sx={{ mt: 2 }}
              >
                Marquer comme terminé
              </Button>
            )}
          </Paper>
        ) : (
          <Typography variant="h6" color="text.secondary">
            Sélectionnez une leçon pour commencer
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CourseLearn; 