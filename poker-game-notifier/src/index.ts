import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import * as path from 'path';
import { loadConfig } from './config';
import { initDatabase, closeDatabase } from './db';
import { initBrowser, closeBrowser } from './scraper/bravo';
import { initTwilio } from './notifier/sms';
import { initLogger, closeLogger, logger } from './logger';
import { runPollCycle } from './poller';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function main(): Promise<void> {
  // Initialize logger
  initLogger({
    filePath: process.env.LOG_FILE_PATH || './data/poker-notifier.log',
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  });

  logger.info('=== Poker Game Start Notifier ===');
  logger.info('Starting up...');

  // Load configuration
  let config;
  try {
    config = loadConfig();
    logger.info(`Loaded watchlist with ${config.watchlist.length} venues`);
    for (const v of config.watchlist) {
      logger.info(`  - ${v.venue} (${v.location}): watching ${v.games.length} games`);
    }
  } catch (error) {
    logger.error('Failed to load config', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }

  // Initialize database
  try {
    const dbPath = process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'poker.db');
    initDatabase(dbPath);
    logger.info('Database initialized');
  } catch (error) {
    logger.error('Failed to initialize database', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }

  // Initialize Twilio
  initTwilio();

  // Initialize Playwright browser
  try {
    await initBrowser();
  } catch (error) {
    logger.error('Failed to initialize browser', {
      error: error instanceof Error ? error.message : String(error),
    });
    logger.error(
      'Make sure Playwright browsers are installed. Run: npx playwright install chromium'
    );
    process.exit(1);
  }

  // Get poll interval
  const pollSeconds = parseInt(process.env.POLL_INTERVAL_SECONDS || '60', 10);
  const cronExpression = `*/${pollSeconds} * * * * *`;

  // Validate cron expression — node-cron uses 6-field (with seconds) format
  // For intervals > 59 seconds, fall back to setInterval
  if (pollSeconds <= 59) {
    logger.info(`Starting poll loop: every ${pollSeconds} seconds (cron: ${cronExpression})`);

    // Run immediately on startup
    await runPollCycle(config);

    // Schedule recurring polls
    cron.schedule(cronExpression, async () => {
      try {
        await runPollCycle(config);
      } catch (error) {
        logger.error('Poll cycle failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  } else {
    logger.info(`Starting poll loop: every ${pollSeconds} seconds (setInterval)`);

    // Run immediately on startup
    await runPollCycle(config);

    // Schedule recurring polls via setInterval for longer intervals
    setInterval(async () => {
      try {
        await runPollCycle(config);
      } catch (error) {
        logger.error('Poll cycle failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, pollSeconds * 1000);
  }

  logger.info('Poker Game Notifier is running. Press Ctrl+C to stop.');
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    await closeBrowser();
  } catch (error) {
    logger.error('Error closing browser', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    closeDatabase();
  } catch (error) {
    logger.error('Error closing database', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  closeLogger();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
