import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
    validationSchema: yup.object({
      firstName: yup.string().required('Le prénom est requis'),
      lastName: yup.string().required('Le nom est requis'),
      email: yup.string().email('Email invalide').required('L\'email est requis'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await updateProfile(values);
        // Afficher un message de succès
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: yup.object({
      currentPassword: yup.string().required('Le mot de passe actuel est requis'),
      newPassword: yup
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
        )
        .required('Le nouveau mot de passe est requis'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
        .required('La confirmation du mot de passe est requise'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await changePassword(values.currentPassword, values.newPassword);
        passwordFormik.resetForm();
        // Afficher un message de succès
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mon Profil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles et vos préférences
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="Informations personnelles" />
          <Tab icon={<LockIcon />} label="Sécurité" />
          <Tab icon={<SchoolIcon />} label="Mes cours" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={profileFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="Prénom"
                  value={profileFormik.values.firstName}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                  helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Nom"
                  value={profileFormik.values.lastName}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                  helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                  helperText={profileFormik.touched.email && profileFormik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<EditIcon />}
                >
                  Mettre à jour le profil
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={passwordFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  label="Mot de passe actuel"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<LockIcon />}
                >
                  Changer le mot de passe
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Cours en cours
              </Typography>
              <List>
                {/* Ajouter la liste des cours en cours */}
              </List>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Cours terminés
              </Typography>
              <List>
                {/* Ajouter la liste des cours terminés */}
              </List>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Profile; 