const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.sendgridEnabled = false;
    this.smtpEnabled = false;

    // Configuration SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgridEnabled = true;
        logger.info('SendGrid email service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize SendGrid:', error);
      }
    } else {
      logger.warn('SendGrid API key not found or invalid. SendGrid service will be disabled.');
    }

    // Configuration Nodemailer (fallback)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        this.smtpEnabled = true;
        logger.info('SMTP email service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize SMTP:', error);
      }
    } else {
      logger.warn('SMTP credentials not found. SMTP service will be disabled.');
    }

    if (!this.sendgridEnabled && !this.smtpEnabled) {
      logger.error('No email service configured. Email functionality will be disabled.');
    }
  }

  async sendEmail(to, subject, text, html, from = process.env.DEFAULT_FROM_EMAIL) {
    if (!this.sendgridEnabled && !this.smtpEnabled) {
      logger.warn('Email service is disabled. Skipping email send.');
      return { success: false, error: 'Email service disabled' };
    }

    // Essayer d'abord avec SendGrid
    if (this.sendgridEnabled) {
      try {
        const msg = {
          to,
          from: from || process.env.DEFAULT_FROM_EMAIL,
          subject,
          text,
          html
        };

        await sgMail.send(msg);
        logger.info(`Email sent successfully via SendGrid to ${to}`);
        return { success: true, provider: 'sendgrid' };
      } catch (error) {
        logger.error('SendGrid error:', error);
      }
    }

    // Fallback sur Nodemailer
    if (this.smtpEnabled) {
      try {
        const mailOptions = {
          from: from || process.env.DEFAULT_FROM_EMAIL,
          to,
          subject,
          text,
          html
        };

        await this.transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully via SMTP to ${to}`);
        return { success: true, provider: 'smtp' };
      } catch (error) {
        logger.error('SMTP error:', error);
        throw new Error('Failed to send email via both SendGrid and SMTP');
      }
    }

    throw new Error('No email service available');
  }

  async sendTemplatedEmail(to, templateId, dynamicTemplateData, from = process.env.DEFAULT_FROM_EMAIL) {
    if (!this.sendgridEnabled) {
      logger.warn('SendGrid is disabled. Template emails require SendGrid.');
      return { success: false, error: 'SendGrid service disabled' };
    }

    try {
      const msg = {
        to,
        from: from || process.env.DEFAULT_FROM_EMAIL,
        templateId,
        dynamicTemplateData
      };

      await sgMail.send(msg);
      logger.info(`Template email sent successfully to ${to}`);
      return { success: true };
    } catch (error) {
      logger.error('Error sending template email:', error);
      throw new Error('Failed to send template email');
    }
  }

  async sendBulkEmails(emails) {
    if (!this.sendgridEnabled && !this.smtpEnabled) {
      logger.warn('Email service is disabled. Skipping bulk email send.');
      return { success: false, error: 'Email service disabled' };
    }

    try {
      const promises = emails.map(email => this.sendEmail(
        email.to,
        email.subject,
        email.text,
        email.html,
        email.from
      ));

      await Promise.all(promises);
      logger.info(`${emails.length} emails sent successfully`);
      return { success: true };
    } catch (error) {
      logger.error('Error sending bulk emails:', error);
      throw new Error('Failed to send bulk emails');
    }
  }
}

module.exports = new EmailService(); 