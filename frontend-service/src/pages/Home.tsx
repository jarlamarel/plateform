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
        if (response.size > 0) {
          setFeaturedCourses(response);
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
        <Typography variant="h4" component="h2" gutterBottom>
          Cours populaires
        </Typography>
        <Grid container spacing={4}>
          {featuredCourses.map((course) => (
            <Grid item key={course._id} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={course.thumbnail}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={course.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({course.totalStudents} étudiants)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={course.level}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="h6" color="primary">
                      {course.price} €
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            Explorez par catégorie
          </Typography>
          <Grid container spacing={4}>
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
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => navigate(`/courses?category=${category.title}`)}
                >
                  <Box
                    sx={{
                      color: category.color,
                      mb: 2,
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
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