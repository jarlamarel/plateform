import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';

interface VideoPlayerProps {
  videoUrl: string;
  videoType: 'local' | 'youtube' | 'vimeo' | 'external';
  title?: string;
  duration?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoType,
  title,
  duration,
  onProgress,
  onComplete,
  autoplay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      onProgress?.(current, video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = () => {
      setError('Erreur lors du chargement de la vidéo');
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
      if (autoplay) {
        video.play().catch(() => {
          // Autoplay bloqué par le navigateur
        });
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoUrl, autoplay, onProgress, onComplete]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * videoDuration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case 'local': return 'Vidéo locale';
      case 'youtube': return 'YouTube';
      case 'vimeo': return 'Vimeo';
      default: return 'Vidéo externe';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  // Pour YouTube et Vimeo, utiliser des iframes
  if (videoType === 'youtube' || videoType === 'vimeo') {
    return (
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
            )}
            <Chip 
              label={getVideoTypeLabel(videoType)} 
              size="small" 
              color="primary" 
              sx={{ mb: 2 }} 
            />
          </Box>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={videoUrl}
              title={title || 'Vidéo de la leçon'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
              }}
              allowFullScreen
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Pour les vidéos locales
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          <Chip 
            label={getVideoTypeLabel(videoType)} 
            size="small" 
            color="primary" 
          />
        </Box>

        <Box sx={{ position: 'relative', mb: 2 }}>
          <video
            ref={videoRef}
            src={videoUrl}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '500px',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
            preload="metadata"
          />

          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
              }}
            >
              <Typography>Chargement...</Typography>
            </Box>
          )}
        </Box>

        {/* Contrôles personnalisés */}
        <Box sx={{ mb: 2 }}>
          {/* Barre de progression */}
          <Box
            sx={{
              height: 8,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 1,
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={handleSeek}
          >
            <Box
              sx={{
                height: '100%',
                backgroundColor: 'primary.main',
                borderRadius: 1,
                width: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%`,
              }}
            />
          </Box>

          {/* Contrôles */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={togglePlay} size="small">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <IconButton onClick={toggleMute} size="small">
                {isMuted ? <MuteIcon /> : <VolumeIcon />}
              </IconButton>

              <Typography variant="body2" sx={{ minWidth: 80 }}>
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </Typography>
            </Box>

            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Informations supplémentaires */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Progression: {videoDuration > 0 ? Math.round((currentTime / videoDuration) * 100) : 0}%
          </Typography>
          
          {duration && (
            <Typography variant="body2" color="text.secondary">
              Durée estimée: {Math.round(duration)} min
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
