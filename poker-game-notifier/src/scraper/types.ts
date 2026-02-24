export interface GameData {
  venue_name: string;
  game_type: string;
  stakes: string;
  tables_running: number;
  players_seated: number;
  waitlist_count: number;
  game_status: string;
  data_source: 'bravo' | 'poker_atlas';
  timestamp: string;
}

export interface VenueConfig {
  venue: string;
  location: string;
  bravo_slug?: string;
  poker_atlas_slug?: string;
  games: WatchedGameConfig[];
  notify_when: TriggerType;
  notification_methods: NotificationMethod[];
  quiet_hours: {
    start: string;
    end: string;
  };
  poll_interval_seconds?: number;
}

export interface WatchedGameConfig {
  type: string;
  stakes: string;
}

export type TriggerType = 'game_starts' | 'game_stops' | 'waitlist_threshold' | 'tables_added';

export type NotificationMethod = 'sms' | 'call' | 'push';

export interface AppConfig {
  watchlist: VenueConfig[];
}

export interface GameStateRecord {
  id?: number;
  venue_name: string;
  game_type: string;
  stakes: string;
  tables_running: number;
  players_seated: number;
  waitlist_count: number;
  game_status: string;
  data_source: string;
  polled_at: string;
}

export interface NotificationRecord {
  id?: number;
  venue_name: string;
  game_type: string;
  stakes: string;
  trigger_type: string;
  channel: string;
  message_body: string;
  twilio_sid?: string;
  status: string;
  sent_at: string;
}

export enum GameState {
  NOT_RUNNING = 'NOT_RUNNING',
  RUNNING = 'RUNNING',
}

export interface StateTransition {
  venue_name: string;
  game_type: string;
  stakes: string;
  previous_state: GameState;
  current_state: GameState;
  previous_tables: number;
  current_tables: number;
  trigger: TriggerType | null;
}
