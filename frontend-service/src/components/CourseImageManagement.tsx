import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import ImageUpload from './ImageUpload';
import courseService from '../services/course.service';
import { toast } from 'react-toastify';

interface CourseImageManagementProps {
  courseId: string;
  currentImage?: string;
  courseName: string;
  onImageUpdated?: (newImageUrl: string) => void;
  disabled?: boolean;
}

const CourseImageManagement: React.FC<CourseImageManagementProps> = ({
  courseId,
  currentImage,
  courseName,
  onImageUpdated,
  disabled = false
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const handleSaveImage = async () => {
    if (!selectedImageUrl) {
      toast.warning('Veuillez d\'abord sélectionner une image');
      return;
    }

    setSaving(true);
    try {
      await courseService.updateCourseImage(courseId, selectedImageUrl);
      toast.success('Image du cours mise à jour avec succès !');
      
      if (onImageUpdated) {
        onImageUpdated(selectedImageUrl);
      }
      
      // Reset selection après sauvegarde
      setSelectedImageUrl(null);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image du cours');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedImageUrl(null);
  };

  const displayImage = selectedImageUrl || currentImage;
  const hasChanges = selectedImageUrl && selectedImageUrl !== currentImage;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Image du cours
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Cours : {courseName}
      </Typography>

      <Box sx={{ mt: 2, mb: 3 }}>
        <ImageUpload
          currentImage={displayImage}
          onImageUploaded={handleImageUploaded}
          disabled={disabled || saving}
          width={300}
          height={200}
          title="Miniature du cours"
          subtitle="Cliquez pour sélectionner une nouvelle image"
        />
      </Box>

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Nouvelle image sélectionnée. Cliquez sur "Enregistrer" pour l'appliquer au cours.
          </Typography>
        </Alert>
      )}

      {hasChanges && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveImage}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer l\'image'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCancelSelection}
            disabled={saving}
          >
            Annuler
          </Button>
        </Box>
      )}

      {!hasChanges && currentImage && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Image actuelle du cours. Cliquez sur l'image pour la changer.
          </Typography>
        </Box>
      )}

      {!currentImage && !selectedImageUrl && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Aucune image personnalisée. Une image par défaut sera utilisée.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CourseImageManagement;
