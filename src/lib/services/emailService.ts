import { EMAIL_CONFIG, getEmailTransporter, isEmailConfigured } from '@/lib/email/config';
import { logger } from '@/lib/utils/logger';
import {
  contactConfirmationTemplate,
  contactReplyTemplate,
  adminContactNotificationTemplate,
  bookingConfirmationTemplate,
  adminBookingNotificationTemplate,
  bookingConfirmedTemplate,
  bookingRejectedTemplate,
} from '@/lib/email/templates';
import type {
  ContactConfirmationData,
  ContactReplyData,
  AdminContactNotificationData,
  BookingConfirmationData,
  AdminBookingNotificationData,
  BookingStatusUpdateData,
} from '@/lib/email/types';

class EmailServiceError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'EmailServiceError';
    this.cause = cause;
  }
}

export class EmailService {
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!isEmailConfigured()) {
      logger.warn('SMTP not configured, skipping email', { subject });
      throw new EmailServiceError(`SMTP not configured, cannot send email: ${subject}`);
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      logger.warn('Email transporter unavailable, skipping email', { subject });
      throw new EmailServiceError(`Email transporter unavailable, cannot send email: ${subject}`);
    }

    try {
      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new EmailServiceError(`Failed to send email: ${subject}`, error);
    }
  }

  async sendContactConfirmation(to: string, data: ContactConfirmationData): Promise<void> {
    try {
      await this.sendEmail(to, 'Message received', contactConfirmationTemplate(data));
      logger.info('Contact confirmation sent', { to });
    } catch (error) {
      logger.error('Failed to send contact confirmation', error, { to });
      throw new EmailServiceError('Failed to send confirmation email', error);
    }
  }

  async sendAdminContactNotification(
    to: string,
    data: AdminContactNotificationData
  ): Promise<void> {
    try {
      await this.sendEmail(
        to,
        `New contact message: ${data.contact.subject || data.contact.name}`,
        adminContactNotificationTemplate(data)
      );
      logger.info('Admin contact notification sent', { to });
    } catch (error) {
      logger.error('Failed to send admin contact notification', error, { to });
      throw new EmailServiceError('Failed to send admin notification email', error);
    }
  }

  async sendContactReply(to: string, data: ContactReplyData): Promise<void> {
    try {
      await this.sendEmail(to, data.replySubject, contactReplyTemplate(data));
      logger.info('Contact reply sent', { to });
    } catch (error) {
      logger.error('Failed to send contact reply', error, { to });
      throw new EmailServiceError('Failed to send contact reply email', error);
    }
  }

  async sendBookingConfirmation(to: string, data: BookingConfirmationData): Promise<void> {
    try {
      await this.sendEmail(to, 'Booking request received', bookingConfirmationTemplate(data));
      logger.info('Booking confirmation sent', { to });
    } catch (error) {
      logger.error('Failed to send booking confirmation', error, { to });
      throw new EmailServiceError('Failed to send booking confirmation email', error);
    }
  }

  async sendAdminBookingNotification(
    to: string,
    data: AdminBookingNotificationData
  ): Promise<void> {
    try {
      await this.sendEmail(
        to,
        `New booking request: ${data.booking.name}`,
        adminBookingNotificationTemplate(data)
      );
      logger.info('Admin booking notification sent', { to });
    } catch (error) {
      logger.error('Failed to send admin booking notification', error, { to });
      throw new EmailServiceError('Failed to send admin booking notification email', error);
    }
  }

  async sendBookingConfirmed(to: string, data: BookingStatusUpdateData): Promise<void> {
    try {
      await this.sendEmail(to, 'Booking confirmed', bookingConfirmedTemplate(data));
      logger.info('Booking confirmed email sent', { to });
    } catch (error) {
      logger.error('Failed to send booking confirmed email', error, { to });
      throw new EmailServiceError('Failed to send booking confirmed email', error);
    }
  }

  async sendBookingRejected(to: string, data: BookingStatusUpdateData): Promise<void> {
    try {
      await this.sendEmail(to, 'Booking update', bookingRejectedTemplate(data));
      logger.info('Booking rejected email sent', { to });
    } catch (error) {
      logger.error('Failed to send booking rejected email', error, { to });
      throw new EmailServiceError('Failed to send booking rejected email', error);
    }
  }
}

export const emailService = new EmailService();
