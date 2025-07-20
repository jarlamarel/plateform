const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    // Vérifier si les variables Twilio sont définies
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      logger.warn('Twilio credentials not found. SMS service will be disabled.');
      this.enabled = false;
      return;
    }

    try {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      this.enabled = true;
      logger.info('Twilio SMS service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Twilio client:', error);
      this.enabled = false;
    }
  }

  async sendSMS(to, message) {
    if (!this.enabled) {
      logger.warn('SMS service is disabled. Skipping SMS send.');
      return { success: false, error: 'SMS service disabled' };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      logger.info(`SMS sent successfully to ${to}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      logger.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendBulkSMS(messages) {
    if (!this.enabled) {
      logger.warn('SMS service is disabled. Skipping bulk SMS send.');
      return { success: false, error: 'SMS service disabled' };
    }

    try {
      const promises = messages.map(msg => this.sendSMS(msg.to, msg.message));
      const results = await Promise.all(promises);

      logger.info(`${messages.length} SMS sent successfully`);
      return {
        success: true,
        results
      };
    } catch (error) {
      logger.error('Error sending bulk SMS:', error);
      throw new Error('Failed to send bulk SMS');
    }
  }

  async sendVerificationCode(to) {
    if (!this.enabled || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      logger.warn('SMS verification service is disabled.');
      return { success: false, error: 'SMS verification service disabled' };
    }

    try {
      const verification = await this.client.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to, channel: 'sms' });

      logger.info(`Verification code sent to ${to}`);
      return {
        success: true,
        verificationId: verification.sid
      };
    } catch (error) {
      logger.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code');
    }
  }

  async verifyCode(to, code) {
    if (!this.enabled || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      logger.warn('SMS verification service is disabled.');
      return { success: false, error: 'SMS verification service disabled' };
    }

    try {
      const verification = await this.client.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to, code });

      logger.info(`Code verified for ${to}`);
      return {
        success: true,
        valid: verification.status === 'approved'
      };
    } catch (error) {
      logger.error('Error verifying code:', error);
      throw new Error('Failed to verify code');
    }
  }
}

module.exports = new SMSService(); 