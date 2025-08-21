import axios from 'axios';

const PAYMENT_API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'http://localhost:3005/api/payments';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface Payment {
  _id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'canceled' | 'disputed';
  paymentMethod: string;
  stripePaymentId: string;
  stripeCustomerId: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Créer une intention de paiement
  async createPaymentIntent(courseId: string, amount: number, currency: string = 'EUR'): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${PAYMENT_API_URL}/intent`,
        {
          courseId,
          amount: Math.round(amount * 100), // Convertir en centimes
          currency
        },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'intention de paiement:', error);
      throw error;
    }
  }

  // Confirmer un paiement
  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    try {
      const response = await axios.post(
        `${PAYMENT_API_URL}/confirm/${paymentIntentId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  }

  // Obtenir l'historique des paiements
  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const response = await axios.get(
        `${PAYMENT_API_URL}/history`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  // Obtenir les détails d'un paiement
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    try {
      const response = await axios.get(
        `${PAYMENT_API_URL}/${paymentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du paiement:', error);
      throw error;
    }
  }

  // Demander un remboursement
  async requestRefund(paymentId: string, reason: string): Promise<Payment> {
    try {
      const response = await axios.post(
        `${PAYMENT_API_URL}/refund/${paymentId}`,
        { reason },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la demande de remboursement:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;