import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
  width = 200,
  height = 150,
  title = "Image du cours",
  subtitle = "Cliquez pour changer l'image"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP.' };
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Le fichier est trop volumineux. Maximum 5MB.' };
    }

    return { valid: true };
  };

  const uploadImage = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subdirectory', 'images');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/content/uploads/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      onImageUploaded(result.file.url);
      toast.success('Image uploadée avec succès !');
      
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input value pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    } else {
      toast.error('Veuillez déposer un fichier image valide');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
      toast.info('Image supprimée');
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Paper
        elevation={dragOver ? 8 : 2}
        sx={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled || uploading ? 'default' : 'pointer',
          border: dragOver ? '2px dashed #2196F3' : '2px dashed transparent',
          borderRadius: 2,
          backgroundColor: dragOver ? 'rgba(33, 150, 243, 0.1)' : 'background.paper',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: disabled || uploading ? 'background.paper' : 'rgba(0, 0, 0, 0.04)',
          },
        }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Upload en cours...
            </Typography>
          </Box>
        ) : currentImage ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={currentImage}
              alt="Course thumbnail"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <CameraIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="body2" color="white">
                  Changer l'image
                </Typography>
              </Box>
            </Box>
            {onImageRemoved && (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.primary" gutterBottom>
              {subtitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ou glissez-déposez une image ici
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              JPG, PNG, GIF, WebP • Max 5MB
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {!currentImage && (
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleClick}
          disabled={disabled || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? 'Upload...' : 'Sélectionner une image'}
        </Button>
      )}
    </Box>
  );
};

export default ImageUpload;
