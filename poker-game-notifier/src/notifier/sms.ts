import Twilio from 'twilio';
import { logger } from '../logger';
import { logNotification } from '../db';
import { TriggerType } from '../scraper/types';

let twilioClient: Twilio.Twilio | null = null;
let fromNumber: string = '';

export function initTwilio(): void {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  fromNumber = process.env.TWILIO_FROM_NUMBER || '';

  if (!accountSid || !authToken || !fromNumber) {
    logger.warn(
      'Twilio credentials not configured. SMS notifications will be logged but not sent. ' +
      'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env'
    );
    return;
  }

  twilioClient = Twilio(accountSid, authToken);
  logger.info('Twilio SMS client initialized');
}

export async function sendSms(params: {
  to: string;
  message: string;
  venueName: string;
  gameType: string;
  stakes: string;
  triggerType: TriggerType;
}): Promise<void> {
  const { to, message, venueName, gameType, stakes, triggerType } = params;

  if (!twilioClient) {
    logger.info('SMS (dry run, Twilio not configured):', {
      to,
      message,
      venue: venueName,
      game: `${stakes} ${gameType}`,
    });

    logNotification({
      venue_name: venueName,
      game_type: gameType,
      stakes,
      trigger_type: triggerType,
      channel: 'sms',
      message_body: message,
      twilio_sid: 'DRY_RUN',
      status: 'dry_run',
      sent_at: new Date().toISOString(),
    });
    return;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to,
    });

    logger.info('SMS sent successfully', {
      sid: result.sid,
      to,
      venue: venueName,
      game: `${stakes} ${gameType}`,
    });

    logNotification({
      venue_name: venueName,
      game_type: gameType,
      stakes,
      trigger_type: triggerType,
      channel: 'sms',
      message_body: message,
      twilio_sid: result.sid,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to send SMS', {
      error: errorMessage,
      to,
      venue: venueName,
      game: `${stakes} ${gameType}`,
    });

    logNotification({
      venue_name: venueName,
      game_type: gameType,
      stakes,
      trigger_type: triggerType,
      channel: 'sms',
      message_body: message,
      status: 'failed',
      sent_at: new Date().toISOString(),
    });
  }
}
