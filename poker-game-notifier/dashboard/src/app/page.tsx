'use client';

import { useEffect, useState, useCallback } from 'react';

interface GameRow {
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

interface VenueGroup {
  venue_name: string;
  games: GameRow[];
}

interface ApiResponse {
  venues: VenueGroup[];
  last_poll: string | null;
  error?: string;
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

function formatTime(iso: string): string {
  try {
    const d = new Date(iso + 'Z'); // SQLite stores UTC without the Z
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles',
    }) + ' PT';
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso + 'Z');
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  } catch {
    return '';
  }
}

function sortStakes(a: string, b: string): number {
  const parse = (s: string) => {
    const parts = s.split('/').map(Number);
    return parts[parts.length - 1] || 0;
  };
  return parse(b) - parse(a);
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/games');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading game data...</div>
      </div>
    );
  }

  const venues = data?.venues ?? [];
  const runningCount = venues.reduce(
    (sum, v) => sum + v.games.filter((g) => g.tables_running > 0).length,
    0
  );

  return (
    <div className="container">
      <header>
        <div>
          <h1>Poker Game Notifier</h1>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {runningCount} game{runningCount !== 1 ? 's' : ''} running across{' '}
            {venues.length} venue{venues.length !== 1 ? 's' : ''}
          </span>
        </div>
        {data?.last_poll && (
          <div className="poll-info">
            <span className="pulse" />
            Last poll: {formatTime(data.last_poll)} ({timeAgo(data.last_poll)})
          </div>
        )}
      </header>

      {error && <div className="error-banner">{error}</div>}

      {venues.length === 0 && !error && (
        <div className="empty-state">
          <p>No game data yet. Is the poller running?</p>
        </div>
      )}

      {venues.map((venue) => {
        const sorted = [...venue.games].sort((a, b) =>
          sortStakes(a.stakes, b.stakes)
        );
        const activeCount = sorted.filter((g) => g.tables_running > 0).length;

        return (
          <div key={venue.venue_name} className="venue-card">
            <div className="venue-header">
              <h2>{venue.venue_name}</h2>
              <span className="venue-summary">
                {activeCount}/{sorted.length} games running
              </span>
            </div>
            <div className="game-grid">
              {sorted.map((game) => {
                const running = game.tables_running > 0;
                return (
                  <div
                    key={`${game.game_type}-${game.stakes}`}
                    className={`game-cell ${running ? 'running' : 'not-running'}`}
                  >
                    <div className="game-stakes">${game.stakes}</div>
                    <div className="game-type">{game.game_type}</div>
                    <div
                      className={`status-badge ${running ? 'running' : 'not-running'}`}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: running
                            ? 'var(--green)'
                            : 'var(--red)',
                          display: 'inline-block',
                        }}
                      />
                      {running ? 'Running' : 'Not Running'}
                    </div>
                    {running && (
                      <div className="game-stats">
                        <div>
                          <div className="stat-value">
                            {game.tables_running}
                          </div>
                          <div className="stat-label">Tables</div>
                        </div>
                        <div>
                          <div className="stat-value">
                            {game.players_seated}
                          </div>
                          <div className="stat-label">Seated</div>
                        </div>
                        <div>
                          <div className="stat-value">
                            {game.waitlist_count}
                          </div>
                          <div className="stat-label">Waitlist</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
