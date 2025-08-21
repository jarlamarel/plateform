import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  VideoLibrary as VideoIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Folder as FolderIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const UploadDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps = [
    {
      title: "Connexion Instructeur",
      description: "Se connecter avec instructor@test.com",
      icon: <SchoolIcon />,
      color: "primary"
    },
    {
      title: "Accéder au Cours",
      description: "Cliquer sur un cours existant",
      icon: <FolderIcon />,
      color: "secondary"
    },
    {
      title: "Gérer les Leçons",
      description: "Bouton 'Gérer les leçons' visible",
      icon: <SettingsIcon />,
      color: "info"
    },
    {
      title: "Upload Vidéo",
      description: "Interface graphique d'upload",
      icon: <UploadIcon />,
      color: "warning"
    },
    {
      title: "Lecture Vidéo",
      description: "Lecteur intégré fonctionnel",
      icon: <PlayIcon />,
      color: "success"
    }
  ];

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🎥 Interface d'Upload de Vidéos
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎉 Votre interface graphique est prête !
        </Typography>
        <Typography>
          Le système d'upload de vidéos avec interface graphique complète est déjà implémenté 
          et fonctionnel dans votre application.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📱 Fonctionnalités de l'Interface
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <UploadIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Upload Drag & Drop"
                secondary="Glissez-déposez vos fichiers vidéo directement"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Validation Automatique"
                secondary="Vérification des formats et tailles (MP4, WebM, MOV, AVI - max 500MB)"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <VideoIcon color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary="Lecteur Intégré"
                secondary="Prévisualisation et lecture avec contrôles personnalisés"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setShowDemo(true)}
          startIcon={<PlayIcon />}
        >
          Voir la Démo Interactive
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={simulateUpload}
          startIcon={<UploadIcon />}
        >
          Simuler un Upload
        </Button>
      </Box>

      {uploadProgress > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📤 Simulation d'Upload
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              Upload en cours... {Math.round(uploadProgress)}%
            </Typography>
            {uploadProgress >= 100 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Upload terminé avec succès !
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Comment utiliser l'interface
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${step.color}.main`,
                    color: 'white',
                  }}
                >
                  {step.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {index + 1}. {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de démonstration */}
      <Dialog open={showDemo} onClose={() => setShowDemo(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          🎥 Démonstration de l'Interface d'Upload
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <VideoIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Interface Graphique Complète
            </Typography>
            <Typography variant="body1" paragraph>
              Votre système dispose d'une interface graphique moderne avec :
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
              <Chip label="Drag & Drop" color="primary" />
              <Chip label="Barre de Progression" color="secondary" />
              <Chip label="Validation Auto" color="info" />
              <Chip label="Lecteur Intégré" color="success" />
              <Chip label="Design Moderne" color="warning" />
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                💡 <strong>Pour l'utiliser :</strong><br/>
                1. Connectez-vous en tant qu'instructeur<br/>
                2. Allez sur un cours → "Gérer les leçons"<br/>
                3. Cliquez sur l'icône vidéo 🎥<br/>
                4. Uploadez vos fichiers !
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDemo(false)}>
            Fermer
          </Button>
          <Button variant="contained" onClick={() => setShowDemo(false)}>
            Commencer à utiliser
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔗 Liens Rapides
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" href="http://localhost:3000/login" target="_blank">
            Se Connecter
          </Button>
          <Button variant="outlined" href="http://localhost:3000/courses" target="_blank">
            Voir les Cours
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UploadDemo;



