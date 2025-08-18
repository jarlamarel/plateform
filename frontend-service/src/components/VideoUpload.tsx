import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  VideoFile as VideoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface VideoUploadProps {
  lessonId: string;
  existingVideo?: {
    url: string;
    type: string;
    fileName?: string;
    fileSize?: number;
  };
  onUploadSuccess?: (videoData: any) => void;
  onDeleteSuccess?: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  lessonId,
  existingVideo,
  onUploadSuccess,
  onDeleteSuccess,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState({
    title: '',
    description: '',
    duration: '',
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/content';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté. Utilisez MP4, WebM, MOV ou AVI.');
        return;
      }

      // Vérifier la taille (500MB max)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Le fichier est trop volumineux (max 500MB).');
        return;
      }

      setSelectedFile(file);
      setShowUploadDialog(true);
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', selectedFile);
    if (videoMetadata.title) formData.append('title', videoMetadata.title);
    if (videoMetadata.description) formData.append('description', videoMetadata.description);
    if (videoMetadata.duration) formData.append('duration', videoMetadata.duration);

    try {
      const xhr = new XMLHttpRequest();

      // Suivi du progrès
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      const response = await new Promise<any>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(xhr.responseText || 'Erreur lors de l\'upload'));
            }
          }
        };

        xhr.open('POST', `${API_URL}/videos/lessons/${lessonId}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
      });

      toast.success('Vidéo uploadée avec succès !');
      setShowUploadDialog(false);
      setSelectedFile(null);
      setVideoMetadata({ title: '', description: '', duration: '' });
      onUploadSuccess?.(response.lesson);

    } catch (error: any) {
      console.error('Erreur upload vidéo:', error);
      
      // Gestion spécifique des erreurs
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        toast.error('Erreur de permissions : Vous devez être le propriétaire du cours pour uploader des vidéos');
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Erreur d\'authentification : Veuillez vous reconnecter');
      } else if (error.message?.includes('413') || error.message?.includes('too large')) {
        toast.error('Fichier trop volumineux (max 500MB)');
      } else if (error.message?.includes('415') || error.message?.includes('Unsupported')) {
        toast.error('Format de fichier non supporté (utilisez MP4, WebM, MOV ou AVI)');
      } else {
        toast.error('Erreur lors de l\'upload de la vidéo : ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteVideo = async () => {
    if (!user || !existingVideo) return;

    try {
      const response = await fetch(`${API_URL}/videos/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Vidéo supprimée avec succès !');
      onDeleteSuccess?.();

    } catch (error) {
      console.error('Erreur suppression vidéo:', error);
      toast.error('Erreur lors de la suppression de la vidéo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case 'local': return 'Vidéo locale';
      case 'youtube': return 'YouTube';
      case 'vimeo': return 'Vimeo';
      default: return 'Vidéo externe';
    }
  };

  return (
    <Box>
      {existingVideo ? (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VideoIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Vidéo de la leçon</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={getVideoTypeLabel(existingVideo.type)} 
                  size="small" 
                  color="primary" 
                />
                {user?.role === 'instructor' && (
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={deleteVideo}
                    title="Supprimer la vidéo"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <video 
                controls 
                width="100%" 
                height="auto"
                style={{ maxHeight: '300px', borderRadius: '8px' }}
              >
                <source src={existingVideo.url} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </Box>

            {existingVideo.fileName && (
              <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                <Typography variant="body2">
                  Fichier: {existingVideo.fileName}
                </Typography>
                {existingVideo.fileSize && (
                  <Typography variant="body2">
                    Taille: {formatFileSize(existingVideo.fileSize)}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 2, border: '2px dashed', borderColor: 'grey.300' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <VideoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune vidéo associée à cette leçon
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Uploadez une vidéo pour enrichir votre contenu pédagogique
            </Typography>
            
            {user?.role === 'instructor' && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Choisir une vidéo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {user?.role === 'instructor' && existingVideo && (
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          fullWidth
        >
          Remplacer la vidéo
        </Button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        style={{ display: 'none' }}
      />

      {/* Dialog d'upload */}
      <Dialog open={showUploadDialog} onClose={() => !uploading && setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload de vidéo</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fichier sélectionné:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoIcon />
                <Typography variant="body1">{selectedFile.name}</Typography>
                <Chip label={formatFileSize(selectedFile.size)} size="small" />
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Titre de la leçon (optionnel)"
            value={videoMetadata.title}
            onChange={(e) => setVideoMetadata(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <TextField
            fullWidth
            label="Description (optionnel)"
            multiline
            rows={3}
            value={videoMetadata.description}
            onChange={(e) => setVideoMetadata(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <TextField
            fullWidth
            label="Durée en minutes (optionnel)"
            type="number"
            value={videoMetadata.duration}
            onChange={(e) => setVideoMetadata(prev => ({ ...prev, duration: e.target.value }))}
            disabled={uploading}
          />

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload en cours... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)} disabled={uploading}>
            Annuler
          </Button>
          <Button 
            onClick={uploadVideo} 
            variant="contained" 
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Upload...' : 'Uploader'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoUpload;
