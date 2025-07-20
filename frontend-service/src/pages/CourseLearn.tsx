import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
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
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import courseService, { Course } from '../services/course.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const CourseLearn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ completedLessons: string[]; progress: number } | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchCourseProgress();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const courseData = await courseService.getCourseById(id!);
      setCourse(courseData);
      // Définir la première leçon comme leçon courante si aucune n'est sélectionnée
      if (!currentLesson && courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
        setCurrentLesson(courseData.sections[0].lessons[0]._id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du cours:', error);
      toast.error('Une erreur est survenue lors de la récupération des détails du cours');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const progressData = await courseService.getCourseProgress(id!);
      setProgress(progressData);
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    setCurrentLesson(lessonId);
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
    .flatMap((section) => section.lessons)
    .find((lesson) => lesson._id === currentLesson);

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
          {course.sections.map((section) => (
            <React.Fragment key={section._id}>
              <ListItem>
                <ListItemText
                  primary={section.title}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                />
              </ListItem>
              {section.lessons.map((lesson) => {
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
            <Typography variant="body1" paragraph>
              {currentLessonData.type === 'video' ? (
                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                  {/* TODO: Intégrer le lecteur vidéo */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircleIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  </Box>
                </Box>
              ) : currentLessonData.type === 'quiz' ? (
                <Box>
                  {/* TODO: Intégrer le quiz */}
                  <Typography>Contenu du quiz à venir</Typography>
                </Box>
              ) : (
                <Box>
                  {/* TODO: Intégrer le devoir */}
                  <Typography>Contenu du devoir à venir</Typography>
                </Box>
              )}
            </Typography>

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