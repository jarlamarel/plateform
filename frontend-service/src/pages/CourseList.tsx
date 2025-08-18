import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  Paper,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import courseService, { Course, CourseFilters } from '../services/course.service';
import { toast } from 'react-toastify';

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'Développement Web',
    'Data Science',
    'Design',
    'Marketing Digital',
    'Business',
    'Langues',
  ];

  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, level, page]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const filters: CourseFilters = {
        search: searchQuery || undefined,
        category: category !== 'all' ? category : undefined,
        level: level !== 'all' ? level : undefined,
        page,
        limit: 9,
      };

      const response = await courseService.getCourses(filters);
      console.log('CourseList Response:', response);
      
      // Handle both array and object responses
      if (Array.isArray(response)) {
        setCourses(response);
        setTotalPages(1);
      } else if (response && response.courses) {
        setCourses(response.courses);
        setTotalPages(response.totalPages || 1);
      } else {
        setCourses([]);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      toast.error('Une erreur est survenue lors de la récupération des cours');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, level, page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleLevelChange = (event: any) => {
    setLevel(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explorez nos cours
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Découvrez des milliers de cours en ligne et développez vos compétences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Filtres */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtres
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={category}
                label="Catégorie"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={level}
                label="Niveau"
                onChange={handleLevelChange}
              >
                <MenuItem value="all">Tous les niveaux</MenuItem>
                {levels.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Liste des cours */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
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
                      height="180"
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
                      component="h2"
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
                        precision={0.5} 
                        size="small" 
                        readOnly 
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
                          {course.enrolledStudents?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                        {typeof course.price === 'number' ? course.price.toFixed(2) : course.price}€
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

          {/* Pagination */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseList; 