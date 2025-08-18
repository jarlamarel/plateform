import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Course } from '../services/course.service';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact';
}

const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'default' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course._id}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'primary';
    }
  };

  const imageHeight = variant === 'compact' ? 140 : 180;

  return (
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
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height={imageHeight}
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
          color={getLevelColor(course.level) as any}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            fontWeight: 'bold',
            textTransform: 'capitalize',
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
            minHeight: variant === 'compact' ? '2.4rem' : '3rem',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 2 : 2,
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
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Voir plus
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;