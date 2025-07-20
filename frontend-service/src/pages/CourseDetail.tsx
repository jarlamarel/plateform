import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Rating,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  PlayCircle as PlayCircleIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import courseService, { Course } from '../services/course.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchCourseReviews();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const courseData = await courseService.getCourseById(id!);
      setCourse(courseData);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du cours:', error);
      toast.error('Une erreur est survenue lors de la récupération des détails du cours');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReviews = async () => {
    try {
      const reviewsData = await courseService.getCourseReviews(id!);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    setEnrolling(true);
    try {
      await courseService.enrollInCourse(id!);
      toast.success('Inscription au cours réussie !');
      navigate(`/courses/${id}/learn`);
    } catch (error) {
      console.error('Erreur lors de l\'inscription au cours:', error);
      toast.error('Une erreur est survenue lors de l\'inscription au cours');
    } finally {
      setEnrolling(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || !course) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête du cours */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {course.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={course.rating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({course.rating} - {reviews?.totalReviews || 0} avis)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">{course.duration} heures</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">{course.totalStudents} étudiants</Typography>
            </Box>
            <Chip label={course.level} color="primary" variant="outlined" />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" color="primary">
                {course.price}€
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'S\'inscrire au cours'
              )}
            </Button>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ce cours comprend :
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PlayCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={`${course.sections.reduce(
                    (acc, section) => acc + section.lessons.length,
                    0
                  )} leçons`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText primary={`${course.duration} heures de contenu`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Accès à vie" />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Contenu du cours */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Contenu du cours" />
            <Tab label="À propos" />
            <Tab label="Avis" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <List>
            {course.sections.map((section) => (
              <React.Fragment key={section._id}>
                <ListItem>
                  <ListItemText
                    primary={section.title}
                    primaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
                {section.lessons.map((lesson) => (
                  <ListItem key={lesson._id} sx={{ pl: 4 }}>
                    <ListItemIcon>
                      {lesson.type === 'video' ? (
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
                  </ListItem>
                ))}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                À propos de ce cours
              </Typography>
              <Typography variant="body1" paragraph>
                {course.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    À propos de l'instructeur
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={undefined}
                      alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Typography variant="subtitle1">
                      {`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Avis des étudiants
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
                {reviews?.averageRating.toFixed(1)}
              </Typography>
              <Box>
                <Rating value={reviews?.averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Basé sur {reviews?.totalReviews} avis
                </Typography>
              </Box>
            </Box>
          </Box>

          <List>
            {reviews?.reviews.map((review: any) => (
              <ListItem key={review._id} alignItems="flex-start">
                <ListItemIcon>
                  <Avatar src={review.user.avatar} alt={review.user.name} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        {review.user.name}
                      </Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {review.comment}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CourseDetail; 