import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserCourse } from '../services/userCourses.service';

interface UserCourseCardProps {
  userCourse: UserCourse;
  onContinue?: (courseId: string) => void;
}

const UserCourseCard: React.FC<UserCourseCardProps> = ({ userCourse, onContinue }) => {
  const navigate = useNavigate();
  const { course, progress, completed, enrolledAt } = userCourse;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'primary';
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(course._id);
    } else {
      navigate(`/courses/${course._id}/learn`);
    }
  };

  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      height: { xs: 'auto', sm: 200 },
      mb: 2,
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease-in-out'
      }
    }}>
      <CardMedia
        component="img"
        sx={{ 
          width: { xs: '100%', sm: 200 },
          height: { xs: 150, sm: 200 },
          objectFit: 'cover'
        }}
        image={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
        alt={course.title}
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: 1.2,
              mb: 1
            }}>
              {course.title}
            </Typography>
            {completed && (
              <Chip
                icon={<CheckIcon />}
                label="Terminé"
                color="success"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
            {course.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {course.instructor.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDuration(course.duration)}
            </Typography>
            <Chip
              label={course.level}
              size="small"
              sx={{ ml: 1 }}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={course.category}
              size="small"
              sx={{ ml: 1 }}
              color="secondary"
              variant="outlined"
            />
          </Box>

          {!completed && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progression
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={getProgressColor(progress) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Inscrit le {formatDate(enrolledAt)}
            </Typography>
            
            <Button
              variant="contained"
              size="small"
              startIcon={completed ? <CheckIcon /> : <PlayIcon />}
              onClick={handleContinue}
              sx={{ minWidth: 120 }}
            >
              {completed ? 'Revoir' : 'Continuer'}
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default UserCourseCard;
