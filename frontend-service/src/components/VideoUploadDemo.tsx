import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  CloudUpload as UploadIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const VideoUploadDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Accéder à la gestion des leçons',
      description: 'Depuis la page de détail du cours, cliquez sur "Gérer les leçons"',
      icon: <VideoIcon />,
      color: 'primary'
    },
    {
      label: 'Créer ou sélectionner une leçon',
      description: 'Créez une nouvelle leçon ou modifiez une existante',
      icon: <VideoIcon />,
      color: 'secondary'
    },
    {
      label: 'Cliquer sur l\'icône vidéo',
      description: 'Cliquez sur l\'icône 🎥 à côté de la leçon pour ouvrir l\'interface d\'upload',
      icon: <UploadIcon />,
      color: 'info'
    },
    {
      label: 'Uploader votre vidéo',
      description: 'Sélectionnez votre fichier vidéo et remplissez les métadonnées',
      icon: <PlayIcon />,
      color: 'warning'
    },
    {
      label: 'Vidéo prête !',
      description: 'Votre vidéo est maintenant disponible pour les étudiants',
      icon: <CheckIcon />,
      color: 'success'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🎥 Guide d'Upload de Vidéos
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Bonne nouvelle !</strong> Le système d'upload de vidéos est déjà entièrement fonctionnel 
            dans votre application. Suivez ces étapes pour l'utiliser.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Formats supportés :
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="MP4" color="primary" size="small" />
            <Chip label="WebM" color="primary" size="small" />
            <Chip label="MOV" color="primary" size="small" />
            <Chip label="AVI" color="primary" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Taille maximale : 500MB par fichier
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Dernière étape</Typography>
                  ) : null
                }
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: index <= activeStep ? `${step.color}.main` : 'grey.300',
                      color: index <= activeStep ? 'white' : 'grey.500',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Terminer' : 'Continuer'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Retour
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>🎉 Parfait ! Vous savez maintenant comment uploader des vidéos.</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Recommencer le guide
            </Button>
          </Paper>
        )}

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🔧 Fonctionnalités disponibles :
          </Typography>
          <ul>
            <li>Upload avec barre de progression en temps réel</li>
            <li>Validation automatique des formats de fichier</li>
            <li>Prévisualisation vidéo intégrée</li>
            <li>Contrôles de lecture personnalisés</li>
            <li>Streaming sécurisé pour les étudiants</li>
            <li>Gestion des permissions (instructeurs uniquement)</li>
            <li>Auto-complétion des leçons après visionnage</li>
          </ul>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            💡 <strong>Astuce :</strong> Pour tester le système, assurez-vous d'être connecté en tant qu'instructeur 
            et d'avoir créé au moins un cours. Le bouton "Gérer les leçons" n'apparaît que pour les propriétaires du cours.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VideoUploadDemo;

