import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Rating,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Brush as DesignIcon,
  TrendingUp as MarketingIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import courseService, { Course } from '../services/course.service';

const categories = [
  {
    title: 'Développement Web',
    description: 'Apprenez à créer des sites web modernes et des applications web',
    icon: <CodeIcon sx={{ fontSize: 40 }} />,
    color: '#2196f3',
  },
  {
    title: 'Data Science',
    description: 'Maîtrisez l\'analyse de données et l\'intelligence artificielle',
    icon: <DataIcon sx={{ fontSize: 40 }} />,
    color: '#4caf50',
  },
  {
    title: 'Design',
    description: 'Découvrez les principes du design et créez des interfaces utilisateur',
    icon: <DesignIcon sx={{ fontSize: 40 }} />,
    color: '#f44336',
  },
  {
    title: 'Marketing Digital',
    description: 'Apprenez à promouvoir votre entreprise en ligne',
    icon: <MarketingIcon sx={{ fontSize: 40 }} />,
    color: '#ff9800',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await courseService.getCourses({ limit: 4 });
        console.log(response);
        if (Array.isArray(response) && response.length > 0) {
          setFeaturedCourses(response);
        } else if (response && response.courses && response.courses.length > 0) {
          setFeaturedCourses(response.courses);
        }
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Apprenez à votre rythme
          </Typography>
          <Typography variant="h5" paragraph>
            Découvrez des milliers de cours en ligne et développez vos compétences
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Explorer les cours
          </Button>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Cours populaires
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Découvrez nos cours les plus appréciés par les étudiants et commencez votre apprentissage dès aujourd'hui
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {featuredCourses.map((course) => (
            <Grid item key={course._id} xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={course.thumbnail}
                    alt={course.title}
                    sx={{
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <Chip
                    label={course.level}
                    size="small"
                    color={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'error'}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      lineHeight: 1.3,
                      mb: 1.5,
                      minHeight: '2.6rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{
                      mb: 2,
                      minHeight: '3rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={typeof course.rating === 'number' ? course.rating : course.rating?.average || 0} 
                      readOnly 
                      size="small" 
                      precision={0.5}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.875rem' }}>
                      ({typeof course.rating === 'number' ? 0 : course.rating?.count || 0})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration}h
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.totalStudents || course.enrolledStudents?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      {course.price}€
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{
                        borderRadius: 20,
                        px: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Voir plus
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Explorez par catégorie
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Découvrez une large gamme de cours dans différents domaines pour développer vos compétences
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item key={category.title} xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease-in-out',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
                    },
                  }}
                  onClick={() => navigate(`/courses?category=${category.title}`)}
                >
                  <Box
                    sx={{
                      color: category.color,
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${category.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': {
                        fontSize: '2.5rem',
                      },
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {category.description}
                  </Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      Explorer →
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Prêt à commencer votre apprentissage ?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Rejoignez des milliers d'étudiants et commencez votre voyage d'apprentissage dès aujourd'hui.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/courses')}
        >
          Commencer maintenant
        </Button>
      </Container>
    </Box>
  );
};

export default Home; 