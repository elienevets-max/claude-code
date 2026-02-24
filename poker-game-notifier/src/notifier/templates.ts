import { DateTime } from 'luxon';
import { GameData, TriggerType } from '../scraper/types';

interface TemplateData {
  gameData: GameData;
  location: string;
  triggerType: TriggerType;
}

export function renderSmsMessage(data: TemplateData): string {
  const { gameData, location, triggerType } = data;

  const timestamp = DateTime.fromISO(gameData.timestamp)
    .setZone('America/Los_Angeles')
    .toFormat('h:mm a ZZZZ');

  const sourceName = gameData.data_source === 'bravo' ? 'Bravo Poker Live' : 'Poker Atlas';

  switch (triggerType) {
    case 'game_starts':
      return [
        `POKER ALERT: ${gameData.stakes} ${gameData.game_type} just started at ${gameData.venue_name} (${location}).`,
        `Tables: ${gameData.tables_running} | Waitlist: ${gameData.waitlist_count}`,
        `Source: ${sourceName} | Updated: ${timestamp}`,
        `Reply STOP to unsubscribe.`,
      ].join('\n');

    case 'game_stops':
      return [
        `POKER UPDATE: ${gameData.stakes} ${gameData.game_type} has stopped at ${gameData.venue_name} (${location}).`,
        `Source: ${sourceName} | Updated: ${timestamp}`,
        `Reply STOP to unsubscribe.`,
      ].join('\n');

    case 'tables_added':
      return [
        `POKER UPDATE: New table added for ${gameData.stakes} ${gameData.game_type} at ${gameData.venue_name} (${location}).`,
        `Tables: ${gameData.tables_running} | Waitlist: ${gameData.waitlist_count}`,
        `Source: ${sourceName} | Updated: ${timestamp}`,
        `Reply STOP to unsubscribe.`,
      ].join('\n');

    case 'waitlist_threshold':
      return [
        `POKER ALERT: Waitlist is short for ${gameData.stakes} ${gameData.game_type} at ${gameData.venue_name} (${location}).`,
        `Tables: ${gameData.tables_running} | Waitlist: ${gameData.waitlist_count}`,
        `Source: ${sourceName} | Updated: ${timestamp}`,
        `Reply STOP to unsubscribe.`,
      ].join('\n');

    default:
      return [
        `POKER UPDATE: ${gameData.stakes} ${gameData.game_type} at ${gameData.venue_name} (${location}).`,
        `Tables: ${gameData.tables_running} | Waitlist: ${gameData.waitlist_count}`,
        `Source: ${sourceName} | Updated: ${timestamp}`,
      ].join('\n');
  }
}
