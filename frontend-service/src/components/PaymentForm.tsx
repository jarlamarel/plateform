import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import paymentService from '../services/payment.service';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  courseId,
  courseTitle,
  amount,
  currency = 'EUR',
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé. Veuillez réessayer.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Élément de carte non trouvé.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Créer Payment Intent via notre Payment Service
      const { clientSecret } = await paymentService.createPaymentIntent(
        courseId, 
        amount, 
        currency
      );
      
      // 2. Confirmer le paiement avec Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Student', // Vous pouvez récupérer le nom de l'utilisateur connecté
          },
        }
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Une erreur est survenue lors du paiement.');
        toast.error(stripeError.message || 'Paiement échoué');
        return;
      }
      
      if (paymentIntent?.status === 'succeeded') {
        // 3. Confirmer côté serveur via notre Payment Service
      //  await paymentService.confirmPayment(paymentIntent.id);
        
        toast.success('Paiement réussi ! Vous êtes maintenant inscrit au cours.');
        onSuccess();
      } else {
        setError('Le paiement n\'a pas pu être traité.');
        toast.error('Paiement non traité');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Une erreur est survenue');
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      {/* En-tête */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Finaliser votre inscription
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {courseTitle}
        </Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
          {amount.toFixed(2)} {currency}
        </Typography>
      </Box>

      {/* Informations de sécurité */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon fontSize="small" />
          <Typography variant="body2">
            Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.
          </Typography>
        </Box>
      </Alert>

      {/* Formulaire de paiement */}
      <form onSubmit={handleSubmit}>
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">
              Informations de paiement
            </Typography>
          </Box>
          
          <Box sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 1, 
            p: 2, 
            backgroundColor: '#fafafa',
            '&:focus-within': {
              borderColor: 'primary.main',
              backgroundColor: 'white',
            }
          }}>
            <CardElement options={cardElementOptions} />
          </Box>
        </Paper>

        {/* Affichage des erreurs */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onCancel}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!stripe || loading}
            sx={{ minWidth: 160 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Traitement...
              </Box>
            ) : (
              `Payer ${amount.toFixed(2)} ${currency}`
            )}
          </Button>
        </Box>
      </form>

      {/* Note de bas de page */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', textAlign: 'center', mt: 2 }}
      >
        En procédant au paiement, vous acceptez nos conditions d'utilisation.
      </Typography>
    </Box>
  );
};

export default PaymentForm;
