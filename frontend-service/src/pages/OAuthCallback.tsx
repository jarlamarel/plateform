import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log('Token saved:', token);
    if (token) {
      localStorage.setItem('token', token);
      
      // Optionnel: tu peux appeler login pour rafraîchir le contexte utilisateur
      window.location.href = '/';
    } else {
      navigate('/login');
    }
  }, [navigate, login]);

  return <div>Connexion en cours...</div>;
};

export default OAuthCallback; 