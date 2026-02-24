# Poker Game Start Notifier — App Build Prompt

## Overview

Build a full-stack application that monitors live poker room data from **Bravo Poker Live** and **Poker Atlas**, detects when a specific cash game starts at a target venue, and immediately notifies the user via **SMS text**, **phone call**, or **push notification**.

---

## Prompt

You are an expert full-stack developer. Build me a **Poker Game Start Notifier** application with the following specifications:

### 1. Core Purpose

The app monitors live poker rooms and alerts me the moment a specific cash game type begins running at a venue I care about. For example:

> "10/25 NL Hold'em just started at Green Valley Ranch in Henderson, NV"

I should be able to configure which games and venues to watch, choose my notification method (text, call, or push notification), and set quiet hours.

---

### 2. Data Sources

The app must pull real-time game data from two primary sources:

#### A. Bravo Poker Live (Primary Source)

- **Website:** https://www.bravopokerlive.com
- **App:** BravoPokerLive (iOS / Android) by Genesis Gaming Solutions
- **What it provides:** Real-time cash game tables running, game type, stakes, number of players, waitlist counts, and table counts — for all poker rooms that use the Bravo Poker management system
- **Data access strategy:**
  1. **Web scraping approach:** Navigate to the venue page on `bravopokerlive.com` (e.g., `/venues/green-valley-ranch/`). Use browser DevTools (Network tab → XHR/Fetch filter) to identify the underlying AJAX/API endpoints that serve cash game and waitlist data. These endpoints likely return JSON.
  2. **Mobile API approach (preferred):** Use a proxy tool (mitmproxy, Charles Proxy) to intercept network traffic from the BravoPokerLive mobile app. The app communicates with a backend (historically hosted on `bravopokerlive.appspot.com`) and likely exposes cleaner REST endpoints that return JSON payloads with game status data.
  3. **Headless browser fallback:** If the website renders data client-side with no extractable API, use Puppeteer or Playwright to load venue pages, wait for dynamic content, and parse the DOM for game data.
- **Key data points to extract:**
  - `venue_name` — Name of the poker room
  - `game_type` — e.g., "NL Hold'em", "PLO", "Mixed", "Omaha Hi-Lo"
  - `stakes` — e.g., "1/2", "2/5", "5/10", "10/25", "25/50"
  - `tables_running` — Number of active tables for that game
  - `players_seated` — Number of players currently seated
  - `waitlist_count` — Number of players on the waitlist
  - `game_status` — "Running", "Interest List", "Starting Soon"
  - `timestamp` — When the data was last updated
- **Important note:** Not all poker rooms use Bravo. Only rooms with the Bravo Poker Watch system will appear.

#### B. Poker Atlas (Secondary Source)

- **Website:** https://www.pokeratlas.com
- **App:** PokerAtlas (iOS / Android)
- **What it provides:** Cash game details, tournament schedules, live game counts, waitlists — for rooms using the PokerAtlas TableCaptain system
- **Data access strategy:**
  1. **Web scraping:** Navigate to the venue's cash games page (e.g., `pokeratlas.com/poker-room/green-valley-ranch-henderson/cash-games`). The site uses Cloudflare protection and may load data dynamically — use Playwright with stealth mode or equivalent.
  2. **Mobile API approach:** Intercept the PokerAtlas mobile app traffic to discover REST endpoints serving live game data.
  3. **URL patterns for cash games:** `https://www.pokeratlas.com/poker-room/{venue-slug}/cash-games`
- **Key data points to extract:** Same as Bravo — game type, stakes, tables running, waitlist count, game status.
- **Note:** PokerAtlas uses Cloudflare + reCAPTCHA protections. A headless browser with anti-detection measures may be required.

#### C. Data Merge Strategy

- When both sources report on the same venue, cross-reference by venue name and location
- Use Bravo as the primary/authoritative source (more widespread in Nevada)
- Fall back to Poker Atlas when a venue isn't on Bravo
- Deduplicate games that appear in both sources using (venue + game_type + stakes) as composite key
- Always show the most recent data timestamp so the user knows freshness

---

### 3. User Configuration & Watchlist

The user must be able to configure:

```
{
  "watchlist": [
    {
      "venue": "Green Valley Ranch",
      "location": "Henderson, NV",
      "games": [
        { "type": "NL Hold'em", "stakes": "10/25" },
        { "type": "NL Hold'em", "stakes": "5/10" },
        { "type": "PLO", "stakes": "5/10/25" }
      ],
      "notify_when": "game_starts",
      "notification_methods": ["sms", "push"],
      "quiet_hours": { "start": "02:00", "end": "08:00" }
    },
    {
      "venue": "Bellagio",
      "location": "Las Vegas, NV",
      "games": [
        { "type": "NL Hold'em", "stakes": "5/10" },
        { "type": "NL Hold'em", "stakes": "10/25" }
      ],
      "notify_when": "game_starts",
      "notification_methods": ["sms", "call"],
      "quiet_hours": { "start": "03:00", "end": "09:00" }
    }
  ]
}
```

**Supported `notify_when` triggers:**
- `game_starts` — A game that was NOT running is now running (0 tables → 1+ tables)
- `waitlist_threshold` — Waitlist drops below a certain count (e.g., < 5 players waiting)
- `tables_added` — An additional table opens for a game already running
- `game_stops` — A game stops running (optional, for awareness)

---

### 4. Notification Channels

#### A. SMS Text Messages (via Twilio)

- Use the **Twilio SMS API** to send text notifications
- Message format:
  ```
  POKER ALERT: 10/25 NL Hold'em just started at Green Valley Ranch (Henderson, NV).
  Tables: 1 | Waitlist: 3
  Source: Bravo Poker Live | Updated: 7:42 PM PST
  Reply STOP to unsubscribe.
  ```
- Include a link to the venue on Bravo/Poker Atlas if available

#### B. Phone Call (via Twilio)

- Use the **Twilio Voice API** to make an automated phone call
- Use TwiML or Twilio's `<Say>` verb to read the alert:
  ```
  "Poker alert. A 10-25 No Limit Hold'em game just started at Green Valley Ranch
  in Henderson, Nevada. There is 1 table running with 3 players on the waitlist.
  Press 1 to add yourself to the waitlist. Press 2 to snooze alerts for 2 hours."
  ```
- Allow the user to interact via keypad (DTMF input)

#### C. Push Notification (via Firebase Cloud Messaging or OneSignal)

- Send push notifications to the user's mobile device
- Title: `"Game Started: 10/25 NL Hold'em"`
- Body: `"Green Valley Ranch, Henderson NV — 1 table, 3 on waitlist"`
- Deep link to the app's game detail view

---

### 5. Polling & Detection Logic

```
EVERY 60 SECONDS:
  FOR each venue in user's watchlist:
    FETCH current game data from Bravo Poker Live
    FETCH current game data from Poker Atlas (if venue exists there)
    MERGE data, dedup by (venue + game_type + stakes)

    FOR each watched game in this venue:
      COMPARE current_state vs previous_state:

      IF previous_state.tables_running == 0 AND current_state.tables_running > 0:
        → TRIGGER "game_starts" notification
        → UPDATE previous_state

      IF notify_when == "waitlist_threshold":
        IF current_state.waitlist_count < user.threshold:
          → TRIGGER notification
          → SET cooldown (don't re-alert for 15 min)

      IF notify_when == "tables_added":
        IF current_state.tables_running > previous_state.tables_running:
          → TRIGGER notification

  STORE current_state as previous_state for next cycle
  LOG all state transitions for analytics/debugging
```

**Polling frequency:** Default 60 seconds, configurable per venue (30s–300s).
**Cooldown:** After sending a notification for a trigger, suppress duplicate alerts for that same trigger for a configurable period (default: 15 minutes).
**Backoff:** If the data source is unreachable, use exponential backoff (2s, 4s, 8s, ... up to 5 min) before retrying.

---

### 6. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend** | Node.js + Express (or Python + FastAPI) | Handles polling, state comparison, notification dispatch |
| **Scraping** | Playwright (headless Chromium) | Handles JS-rendered pages, Cloudflare bypass |
| **Database** | PostgreSQL or SQLite | Stores watchlists, game state history, notification logs |
| **Job Scheduler** | node-cron / APScheduler / BullMQ | Runs polling jobs at configurable intervals |
| **SMS/Call** | Twilio (SMS + Voice API) | Industry-standard communication API |
| **Push** | Firebase Cloud Messaging (FCM) | Free, cross-platform push notifications |
| **Frontend** | React or Next.js (optional dashboard) | Manage watchlists, view game history, notification settings |
| **Hosting** | Railway / Render / AWS EC2 | Always-on server for continuous polling |
| **Caching** | Redis (optional) | Cache game state, rate-limit notifications |

---

### 7. Database Schema

```sql
-- Venues the user wants to monitor
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  bravo_slug VARCHAR(255),       -- e.g., "green-valley-ranch"
  poker_atlas_slug VARCHAR(255), -- e.g., "green-valley-ranch-henderson"
  timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Specific games to watch at each venue
CREATE TABLE watched_games (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id),
  user_id INTEGER REFERENCES users(id),
  game_type VARCHAR(100) NOT NULL,   -- "NL Hold'em", "PLO", etc.
  stakes VARCHAR(50) NOT NULL,       -- "10/25", "5/10", etc.
  notify_when VARCHAR(50) DEFAULT 'game_starts',
  waitlist_threshold INTEGER DEFAULT 5,
  notification_methods TEXT[] DEFAULT '{"sms"}',
  quiet_start TIME,
  quiet_end TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Snapshot of game state from each poll cycle
CREATE TABLE game_states (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id),
  game_type VARCHAR(100),
  stakes VARCHAR(50),
  tables_running INTEGER DEFAULT 0,
  players_seated INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  game_status VARCHAR(50),
  data_source VARCHAR(50),  -- 'bravo' or 'poker_atlas'
  polled_at TIMESTAMP DEFAULT NOW()
);

-- Log of all notifications sent
CREATE TABLE notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  watched_game_id INTEGER REFERENCES watched_games(id),
  trigger_type VARCHAR(50),
  channel VARCHAR(20),           -- 'sms', 'call', 'push'
  message_body TEXT,
  twilio_sid VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW()
);

-- User accounts and contact info
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  fcm_token TEXT,                -- Firebase push token
  timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8. Notification Message Templates

#### SMS Template
```
POKER ALERT: {{stakes}} {{game_type}} just started at {{venue_name}} ({{location}}).
Tables: {{tables_running}} | Waitlist: {{waitlist_count}}
Source: {{data_source}} | Updated: {{timestamp}}
Reply STOP to unsubscribe.
```

#### Phone Call Script (TwiML)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Poker alert. A {{stakes}} {{game_type}} game just started at {{venue_name}}
    in {{location}}. There are {{tables_running}} tables running with
    {{waitlist_count}} players on the waitlist.
  </Say>
  <Gather numDigits="1" action="/handle-keypress" method="POST">
    <Say voice="alice">
      Press 1 to snooze alerts for this game for 2 hours.
      Press 2 to hear the alert again.
    </Say>
  </Gather>
</Response>
```

#### Push Notification Payload
```json
{
  "notification": {
    "title": "Game Started: {{stakes}} {{game_type}}",
    "body": "{{venue_name}}, {{location}} — {{tables_running}} table(s), {{waitlist_count}} on waitlist"
  },
  "data": {
    "venue_id": "{{venue_id}}",
    "game_type": "{{game_type}}",
    "stakes": "{{stakes}}",
    "deep_link": "/venue/{{venue_id}}/games"
  }
}
```

---

### 9. Example Venues to Pre-Configure (Nevada)

| Venue | Location | Bravo Slug | Popular Games |
|-------|----------|-----------|---------------|
| Green Valley Ranch | Henderson, NV | `green-valley-ranch` | 1/2, 2/5, 5/10, 10/25 NLH |
| Bellagio | Las Vegas, NV | `bellagio` | 5/10, 10/25, 25/50 NLH; PLO |
| Aria | Las Vegas, NV | `aria` | 5/10, 10/25 NLH |
| Wynn | Las Vegas, NV | `wynn-las-vegas` | 5/10, 10/25, 25/50 NLH |
| The Venetian | Las Vegas, NV | `the-venetian` | 1/3, 2/5, 5/10 NLH |
| South Point | Las Vegas, NV | `south-point` | 1/2, 2/5 NLH |
| Red Rock Casino | Las Vegas, NV | `red-rock-casino` | 1/2, 2/5, 5/10 NLH |
| Resorts World | Las Vegas, NV | `resorts-world` | 1/3, 2/5, 5/10 NLH |

---

### 10. Key Implementation Notes

1. **Rate Limiting:** Be respectful of Bravo and Poker Atlas servers. Poll no more than once per 60 seconds per venue. Rotate user-agents. Add jitter to polling intervals.

2. **Resilience:** If a data source goes down, continue operating on the other source. Log failures. Alert the admin if a source is down for > 10 minutes.

3. **State Machine:** Each watched game should maintain a simple state machine:
   - `NOT_RUNNING` → `RUNNING` (triggers `game_starts`)
   - `RUNNING` → `NOT_RUNNING` (triggers `game_stops`)
   - `RUNNING` → `RUNNING (more tables)` (triggers `tables_added`)

4. **Timezone Handling:** All venues are in Pacific Time. Store all timestamps in UTC internally but display in the venue's local timezone in notifications.

5. **Duplicate Prevention:** Use a notification cooldown window. If a game flip-flops (starts/stops/starts quickly), only send one alert per cooldown period.

6. **Cost Awareness:** Twilio SMS costs ~$0.0079/message, calls ~$0.013/min. Budget for heavy usage. Consider batching multiple game alerts at the same venue into one message.

7. **Legal/Ethical:** Respect the Terms of Service of both Bravo Poker Live and Poker Atlas. Consider reaching out to Genesis Gaming Solutions or Poker Atlas for official API access or partnership before relying on scraping.

---

### 11. MVP Feature Scope

For the first version, build:

- [ ] Data scraper for Bravo Poker Live (1 venue: Green Valley Ranch)
- [ ] Polling loop that checks every 60 seconds
- [ ] State comparison to detect `game_starts` events
- [ ] SMS notification via Twilio when a watched game starts
- [ ] Simple config file (JSON) for watchlist
- [ ] Basic logging of all state transitions and notifications
- [ ] Quiet hours support

**Stretch goals:**
- [ ] Poker Atlas integration
- [ ] Phone call notifications
- [ ] Push notifications via FCM
- [ ] Web dashboard for managing watchlists
- [ ] Historical analytics (when do games typically start?)
- [ ] Predictive alerts ("10/25 usually starts around 7 PM on Fridays")
- [ ] Multi-user support with individual watchlists

---

### 12. Data Source References

- **Bravo Poker Live:** https://www.bravopokerlive.com — by Genesis Gaming Solutions. Mobile app on [iOS](https://apps.apple.com/us/app/bravopokerlive/id470322257) and [Android](https://play.google.com/store/apps/details?id=com.genesisgaming.bravopokerlive). Provides real-time game data for rooms using the Bravo Poker Watch system.

- **Poker Atlas:** https://www.pokeratlas.com — provides live game tracking, waitlists, and tournament schedules via [TableCaptain](https://www.pokeratlas.com/info/table-captain) software. Mobile app on [iOS](https://apps.apple.com/us/app/pokeratlas/id438847152) and Android. Cash games index at https://www.pokeratlas.com/poker-cash-games.

- **Twilio API:** https://www.twilio.com/docs — SMS and Voice APIs for notifications.

- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging — for push notifications.
