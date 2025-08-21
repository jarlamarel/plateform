import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PaymentForm from './PaymentForm';

// Clé publique Stripe (à configurer dans les variables d'environnement)
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RcrfTP8JvsmqhfIYXZyUQ9raCR89CMY4YmuCzRo4E0fk3yX4m7scNO77KVppsvwPtC8F1zlAlao6mNF4y96kDtF001D4BXyz0';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  courseId,
  courseTitle,
  amount,
  currency = 'EUR',
  onPaymentSuccess
}) => {
  const handleSuccess = () => {
    onPaymentSuccess();
    onClose();
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1976d2',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    appearance,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500,
        }
      }}
    >
      {/* Bouton de fermeture */}
      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            courseId={courseId}
            courseTitle={courseTitle}
            amount={amount}
            currency={currency}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
