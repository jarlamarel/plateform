import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  VideoLibrary as VideoIcon,
  School as SchoolIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import VideoUploadDemo from '../components/VideoUploadDemo';

const VideoDemo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🎥 Système d'Upload de Vidéos
        </Typography>
        
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Interface complète pour uploader et gérer vos vidéos de cours
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <VideoIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Interface Intuitive
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload facile avec drag & drop, barre de progression en temps réel, 
                  et validation automatique des formats.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <SchoolIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Expérience Étudiante
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lecteur vidéo intégré avec contrôles personnalisés, 
                  streaming sécurisé et suivi de progression.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <UploadIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Gestion Avancée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Métadonnées, permissions, formats multiples (MP4, WebM, MOV, AVI), 
                  et stockage sécurisé.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="success" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            ✅ Système déjà fonctionnel !
          </Typography>
          <Typography>
            Le système d'upload de vidéos est entièrement implémenté et prêt à être utilisé. 
            Connectez-vous en tant qu'instructeur pour commencer à uploader vos vidéos.
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/courses')}
            sx={{ mr: 2 }}
          >
            Voir mes cours
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </Button>
        </Box>

        <VideoUploadDemo />

        <Box sx={{ mt: 6, p: 3, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            🚀 Comment commencer ?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Pour les instructeurs :</Typography>
              <ol>
                <li>Connectez-vous à votre compte instructeur</li>
                <li>Créez ou accédez à un cours existant</li>
                <li>Cliquez sur "Gérer les leçons"</li>
                <li>Ajoutez vos vidéos aux leçons</li>
              </ol>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Pour les étudiants :</Typography>
              <ol>
                <li>Inscrivez-vous à un cours</li>
                <li>Accédez à la page d'apprentissage</li>
                <li>Regardez les vidéos des leçons</li>
                <li>Suivez votre progression automatiquement</li>
              </ol>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body1">
            📋 <strong>Note technique :</strong> Le système supporte les formats MP4, WebM, MOV et AVI 
            avec une taille maximale de 500MB par fichier. Les vidéos sont stockées de manière sécurisée 
            et streamées avec support des ranges HTTP pour une lecture optimale.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default VideoDemo;

