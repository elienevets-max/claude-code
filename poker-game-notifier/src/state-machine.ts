import { GameData, GameState, StateTransition, TriggerType } from './scraper/types';
import { getLatestGameState, insertGameState } from './db';
import { logger } from './logger';

export function evaluateStateTransition(
  currentData: GameData,
  notifyWhen: TriggerType,
  waitlistThreshold: number = 5
): StateTransition {
  const previous = getLatestGameState(
    currentData.venue_name,
    currentData.game_type,
    currentData.stakes
  );

  const previousTables = previous?.tables_running ?? 0;
  const currentTables = currentData.tables_running;

  const previousState = previousTables > 0 ? GameState.RUNNING : GameState.NOT_RUNNING;
  const currentState = currentTables > 0 ? GameState.RUNNING : GameState.NOT_RUNNING;

  let trigger: TriggerType | null = null;

  switch (notifyWhen) {
    case 'game_starts':
      if (previousState === GameState.NOT_RUNNING && currentState === GameState.RUNNING) {
        trigger = 'game_starts';
      }
      break;

    case 'game_stops':
      if (previousState === GameState.RUNNING && currentState === GameState.NOT_RUNNING) {
        trigger = 'game_stops';
      }
      break;

    case 'tables_added':
      if (
        previousState === GameState.RUNNING &&
        currentState === GameState.RUNNING &&
        currentTables > previousTables
      ) {
        trigger = 'tables_added';
      }
      break;

    case 'waitlist_threshold':
      if (
        currentState === GameState.RUNNING &&
        currentData.waitlist_count < waitlistThreshold &&
        (previous === undefined || previous.waitlist_count >= waitlistThreshold)
      ) {
        trigger = 'waitlist_threshold';
      }
      break;
  }

  // Log state transition if there was a change
  if (previousState !== currentState || trigger) {
    logger.info('State transition detected', {
      venue: currentData.venue_name,
      game: `${currentData.stakes} ${currentData.game_type}`,
      from: `${previousState} (${previousTables} tables)`,
      to: `${currentState} (${currentTables} tables)`,
      trigger: trigger || 'none',
    });
  }

  // Always store the current state
  insertGameState({
    venue_name: currentData.venue_name,
    game_type: currentData.game_type,
    stakes: currentData.stakes,
    tables_running: currentData.tables_running,
    players_seated: currentData.players_seated,
    waitlist_count: currentData.waitlist_count,
    game_status: currentData.game_status,
    data_source: currentData.data_source,
    polled_at: currentData.timestamp,
  });

  return {
    venue_name: currentData.venue_name,
    game_type: currentData.game_type,
    stakes: currentData.stakes,
    previous_state: previousState,
    current_state: currentState,
    previous_tables: previousTables,
    current_tables: currentTables,
    trigger,
  };
}
