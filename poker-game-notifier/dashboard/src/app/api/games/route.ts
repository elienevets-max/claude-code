import { NextResponse } from 'next/server';
import { getLatestGameStates, getLastPollTime } from '@/lib/db';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const games = getLatestGameStates();
    const lastPoll = getLastPollTime();

    // Group by venue
    const venues: Record<string, {
      venue_name: string;
      games: typeof games;
    }> = {};

    for (const game of games) {
      if (!venues[game.venue_name]) {
        venues[game.venue_name] = { venue_name: game.venue_name, games: [] };
      }
      venues[game.venue_name].games.push(game);
    }

    return NextResponse.json({
      venues: Object.values(venues),
      last_poll: lastPoll,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
