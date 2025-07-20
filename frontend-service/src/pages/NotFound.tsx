import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', mb: 2 }}>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Page non trouvée
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound; 