import { AppConfig, VenueConfig, TriggerType } from './scraper/types';
import { scrapeVenue } from './scraper/bravo';
import { evaluateStateTransition } from './state-machine';
import { isQuietHours } from './quiet-hours';
import { isInCooldown } from './db';
import { sendSms } from './notifier/sms';
import { renderSmsMessage } from './notifier/templates';
import { logger } from './logger';

let pollCount = 0;

export async function runPollCycle(config: AppConfig): Promise<void> {
  pollCount++;
  logger.info(`Starting poll cycle #${pollCount}`, { venues: config.watchlist.length });

  for (const venueConfig of config.watchlist) {
    try {
      await pollVenue(venueConfig);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error polling venue: ${venueConfig.venue}`, { error: errorMessage });
    }
  }

  logger.info(`Poll cycle #${pollCount} complete`);
}

async function pollVenue(venueConfig: VenueConfig): Promise<void> {
  const { venue, location, bravo_slug, games, notify_when, notification_methods, quiet_hours } = venueConfig;

  if (!bravo_slug) {
    logger.warn(`No Bravo slug configured for venue: ${venue}, skipping`);
    return;
  }

  // Scrape current game data from Bravo
  const currentGames = await scrapeVenue(bravo_slug, venue);

  if (currentGames.length === 0) {
    logger.debug(`No games found for venue: ${venue}`, { slug: bravo_slug });
  }

  // Check each watched game against current data
  for (const watchedGame of games) {
    const matchingGame = currentGames.find(
      (g) => g.game_type === watchedGame.type && g.stakes === watchedGame.stakes
    );

    // If the game isn't in the scraped data, treat it as not running (0 tables)
    const gameData = matchingGame || {
      venue_name: venue,
      game_type: watchedGame.type,
      stakes: watchedGame.stakes,
      tables_running: 0,
      players_seated: 0,
      waitlist_count: 0,
      game_status: 'Not Found',
      data_source: 'bravo' as const,
      timestamp: new Date().toISOString(),
    };

    // Evaluate state transition
    const transition = evaluateStateTransition(gameData, notify_when);

    // If no trigger fired, skip notification
    if (!transition.trigger) continue;

    // Check quiet hours
    if (quiet_hours && isQuietHours(quiet_hours.start, quiet_hours.end)) {
      logger.info('Notification suppressed (quiet hours)', {
        venue,
        game: `${watchedGame.stakes} ${watchedGame.type}`,
        trigger: transition.trigger,
      });
      continue;
    }

    // Check cooldown
    const cooldownMinutes = parseInt(process.env.COOLDOWN_MINUTES || '15', 10);
    if (isInCooldown(venue, watchedGame.type, watchedGame.stakes, transition.trigger, cooldownMinutes)) {
      logger.info('Notification suppressed (cooldown)', {
        venue,
        game: `${watchedGame.stakes} ${watchedGame.type}`,
        trigger: transition.trigger,
        cooldownMinutes,
      });
      continue;
    }

    // Send notifications
    const message = renderSmsMessage({
      gameData,
      location,
      triggerType: transition.trigger,
    });

    for (const method of notification_methods) {
      if (method === 'sms') {
        const userPhone = process.env.USER_PHONE_NUMBER;
        if (!userPhone) {
          logger.warn('USER_PHONE_NUMBER not set, cannot send SMS');
          continue;
        }

        await sendSms({
          to: userPhone,
          message,
          venueName: venue,
          gameType: watchedGame.type,
          stakes: watchedGame.stakes,
          triggerType: transition.trigger,
        });
      } else {
        logger.info(`Notification method "${method}" not yet implemented`, {
          venue,
          game: `${watchedGame.stakes} ${watchedGame.type}`,
          trigger: transition.trigger,
        });
      }
    }
  }
}
