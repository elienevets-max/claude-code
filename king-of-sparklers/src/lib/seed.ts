// =============================================================================
// King of Sparklers Growth Operating System - Seed Script
// =============================================================================
// Run with: npm run seed   (uses tsx src/lib/seed.ts)
// =============================================================================

import { v4 as uuid } from 'uuid';
import db, { initDb } from './db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CURRENT_YEAR = new Date().getFullYear();

function id(): string {
  return uuid();
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// 1. Dream 100 Contacts (10 contacts)
// ---------------------------------------------------------------------------

function seedContacts(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO contacts
      (id, company, contact_name, email, phone, linkedin, category, status, touches, notes, created_at, updated_at)
    VALUES
      (@id, @company, @contactName, @email, @phone, @linkedin, @category, @status, @touches, @notes, @createdAt, @updatedAt)
  `);

  const contacts = [
    {
      id: 'contact-001',
      company: 'LIV Nightclub Miami',
      contactName: 'Marcus Rivera',
      email: 'marcus@livnightclub.com',
      phone: '(305) 555-0142',
      linkedin: 'linkedin.com/in/marcusrivera',
      category: 'nightclub',
      status: 'proposal',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-10`, type: 'email', notes: 'Intro email with VIP sparkler catalog', responded: true },
        { touchNumber: 2, date: `${CURRENT_YEAR}-01-17`, type: 'linkedin', notes: 'Connected and commented on their NYE recap post', responded: true },
        { touchNumber: 3, date: `${CURRENT_YEAR}-01-25`, type: 'email', notes: 'Sent safety certification info and case study', responded: false },
        { touchNumber: 4, date: `${CURRENT_YEAR}-02-05`, type: 'phone', notes: 'Left voicemail with promo offer', responded: true },
        { touchNumber: 5, date: `${CURRENT_YEAR}-02-14`, type: 'email', notes: 'Sent proposal with volume pricing', responded: true },
      ]),
      notes: 'High-value target. They go through 500+ sparklers per weekend. Decision maker is the events director.',
      createdAt: `${CURRENT_YEAR}-01-05`,
      updatedAt: `${CURRENT_YEAR}-02-14`,
    },
    {
      id: 'contact-002',
      company: 'The Ritz-Carlton Orlando',
      contactName: 'Sarah Chen',
      email: 'sarah.chen@ritzcarlton.com',
      phone: '(407) 555-0238',
      linkedin: 'linkedin.com/in/sarahchen-events',
      category: 'hotel',
      status: 'sample_sent',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-15`, type: 'email', notes: 'Personalized intro highlighting hotel-safe sparklers', responded: false },
        { touchNumber: 2, date: `${CURRENT_YEAR}-01-22`, type: 'mail', notes: 'Sent physical sample kit with branded packaging', responded: true },
        { touchNumber: 3, date: `${CURRENT_YEAR}-02-01`, type: 'email', notes: 'Follow-up on sample kit - she loved the gold sparklers', responded: true },
      ]),
      notes: 'Interested in 20-inch gold sparklers for ballroom events. Wants safety data sheets before proceeding.',
      createdAt: `${CURRENT_YEAR}-01-12`,
      updatedAt: `${CURRENT_YEAR}-02-01`,
    },
    {
      id: 'contact-003',
      company: 'Elegant Affairs Wedding Planning',
      contactName: 'Jennifer Blackwell',
      email: 'jennifer@elegantaffairsweddings.com',
      phone: '(212) 555-0391',
      linkedin: 'linkedin.com/in/jblackwell-weddings',
      category: 'wedding',
      status: 'won',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR - 1}-10-05`, type: 'email', notes: 'Initial outreach about wedding sparkler packages', responded: true },
        { touchNumber: 2, date: `${CURRENT_YEAR - 1}-10-12`, type: 'phone', notes: 'Discussed bulk pricing for 2024 wedding season', responded: true },
        { touchNumber: 3, date: `${CURRENT_YEAR - 1}-10-20`, type: 'email', notes: 'Sent wedding sparkler lookbook', responded: true },
        { touchNumber: 4, date: `${CURRENT_YEAR - 1}-11-01`, type: 'mail', notes: 'Shipped sample kit with sendoff sparklers', responded: true },
        { touchNumber: 5, date: `${CURRENT_YEAR - 1}-11-15`, type: 'email', notes: 'Proposal for annual partnership', responded: true },
        { touchNumber: 6, date: `${CURRENT_YEAR - 1}-12-01`, type: 'phone', notes: 'Closed deal - annual contract signed', responded: true },
      ]),
      notes: 'Annual contract for 200+ weddings. Orders 36-inch sparklers in bulk. Refers other planners. Key account.',
      createdAt: `${CURRENT_YEAR - 1}-10-01`,
      updatedAt: `${CURRENT_YEAR - 1}-12-01`,
    },
    {
      id: 'contact-004',
      company: 'Hakkasan Las Vegas',
      contactName: 'Derek Tanaka',
      email: 'derek.tanaka@hakkasan.com',
      phone: '(702) 555-0187',
      linkedin: 'linkedin.com/in/derektanaka',
      category: 'nightclub',
      status: 'contacted',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-02-01`, type: 'email', notes: 'Cold outreach with nightclub sparkler highlight reel', responded: false },
        { touchNumber: 2, date: `${CURRENT_YEAR}-02-08`, type: 'linkedin', notes: 'Sent connection request with personalized message', responded: false },
      ]),
      notes: 'Major Vegas venue. Currently sourcing sparklers from a competitor. Need to differentiate on safety certification.',
      createdAt: `${CURRENT_YEAR}-01-28`,
      updatedAt: `${CURRENT_YEAR}-02-08`,
    },
    {
      id: 'contact-005',
      company: 'Four Seasons Resort Maui',
      contactName: 'Leilani Kapua',
      email: 'leilani.kapua@fourseasons.com',
      phone: '(808) 555-0264',
      linkedin: 'linkedin.com/in/leilanikapua',
      category: 'hotel',
      status: 'meeting',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-08`, type: 'email', notes: 'Intro email about resort-safe sparklers for beach events', responded: true },
        { touchNumber: 2, date: `${CURRENT_YEAR}-01-15`, type: 'phone', notes: 'Great call - they need wind-resistant sparklers for outdoor ceremonies', responded: true },
        { touchNumber: 3, date: `${CURRENT_YEAR}-01-25`, type: 'mail', notes: 'Sent samples of outdoor sparklers with wind guards', responded: true },
        { touchNumber: 4, date: `${CURRENT_YEAR}-02-05`, type: 'email', notes: 'Scheduled Zoom demo for events team', responded: true },
      ]),
      notes: 'Meeting scheduled for Feb 20. They host 15+ beachside weddings per month. Huge opportunity.',
      createdAt: `${CURRENT_YEAR}-01-05`,
      updatedAt: `${CURRENT_YEAR}-02-05`,
    },
    {
      id: 'contact-006',
      company: 'Dream Makers Event Co.',
      contactName: 'Antonio Vargas',
      email: 'antonio@dreammakersevents.com',
      phone: '(713) 555-0429',
      linkedin: 'linkedin.com/in/antoniovargas-events',
      category: 'event',
      status: 'prospect',
      touches: json([]),
      notes: 'Found through Instagram. They do large-scale corporate events in Houston. Over 50 events per year.',
      createdAt: `${CURRENT_YEAR}-02-10`,
      updatedAt: `${CURRENT_YEAR}-02-10`,
    },
    {
      id: 'contact-007',
      company: 'Bliss Bridal Studio',
      contactName: 'Natalie Morgan',
      email: 'natalie@blissbridalstudio.com',
      phone: '(615) 555-0318',
      linkedin: 'linkedin.com/in/nataliemorgan-bridal',
      category: 'wedding',
      status: 'contacted',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-20`, type: 'email', notes: 'Sent wedding sparkler catalog with Nashville venue photos', responded: true },
      ]),
      notes: 'Nashville-based, does 100+ weddings per year. Interested in our heart-shaped sparkler line.',
      createdAt: `${CURRENT_YEAR}-01-18`,
      updatedAt: `${CURRENT_YEAR}-01-20`,
    },
    {
      id: 'contact-008',
      company: 'Marquee Nightclub NYC',
      contactName: 'Jason Park',
      email: 'jason.park@marqueeny.com',
      phone: '(917) 555-0156',
      linkedin: 'linkedin.com/in/jasonpark-nightlife',
      category: 'nightclub',
      status: 'sample_sent',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-05`, type: 'email', notes: 'Intro with VIP bottle service sparkler demo video', responded: false },
        { touchNumber: 2, date: `${CURRENT_YEAR}-01-12`, type: 'phone', notes: 'Spoke with assistant, Jason interested in gold champions', responded: true },
        { touchNumber: 3, date: `${CURRENT_YEAR}-01-20`, type: 'mail', notes: 'Overnighted sample pack of VIP bottle sparklers', responded: false },
      ]),
      notes: 'High-profile NYC venue. If we land this account, it opens doors to their sister venues.',
      createdAt: `${CURRENT_YEAR}-01-02`,
      updatedAt: `${CURRENT_YEAR}-01-20`,
    },
    {
      id: 'contact-009',
      company: 'Grand Hyatt Atlanta',
      contactName: 'Priya Patel',
      email: 'priya.patel@hyatt.com',
      phone: '(404) 555-0273',
      linkedin: 'linkedin.com/in/priyapatel-hospitality',
      category: 'hotel',
      status: 'prospect',
      touches: json([]),
      notes: 'Large convention hotel. They host 200+ events per year including galas and corporate celebrations.',
      createdAt: `${CURRENT_YEAR}-02-12`,
      updatedAt: `${CURRENT_YEAR}-02-12`,
    },
    {
      id: 'contact-010',
      company: 'Pinnacle Productions',
      contactName: 'Rachel Torres',
      email: 'rachel@pinnacleproductions.com',
      phone: '(310) 555-0492',
      linkedin: 'linkedin.com/in/racheltorres-events',
      category: 'event',
      status: 'contacted',
      touches: json([
        { touchNumber: 1, date: `${CURRENT_YEAR}-01-28`, type: 'email', notes: 'Outreach about sparkler packages for award shows and premieres', responded: true },
        { touchNumber: 2, date: `${CURRENT_YEAR}-02-04`, type: 'phone', notes: 'Brief call. She wants a quote for their spring gala season.', responded: true },
      ]),
      notes: 'LA event production company. Works with celebrity clientele. Premium pricing is not an issue.',
      createdAt: `${CURRENT_YEAR}-01-25`,
      updatedAt: `${CURRENT_YEAR}-02-04`,
    },
  ];

  const insertMany = db.transaction((items: typeof contacts) => {
    for (const c of items) {
      insert.run(c);
    }
  });

  insertMany(contacts);
  console.log(`  Seeded ${contacts.length} contacts`);
}

// ---------------------------------------------------------------------------
// 2. Quarterly Rocks (4 rocks for the current year)
// ---------------------------------------------------------------------------

function seedRocks(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO rocks
      (id, title, description, quarter, year, progress, status, owner, due_date)
    VALUES
      (@id, @title, @description, @quarter, @year, @progress, @status, @owner, @dueDate)
  `);

  const rocks = [
    {
      id: 'rock-001',
      title: 'Launch B2B Dream 100 Outreach Program',
      description: 'Identify and begin outreach to the top 100 venue, hotel, nightclub, and wedding planner prospects. Complete at least 5 touches for 25 contacts by end of Q1.',
      quarter: 'Q1',
      year: CURRENT_YEAR,
      progress: 42,
      status: 'on_track',
      owner: 'Sales Team',
      dueDate: `${CURRENT_YEAR}-03-31`,
    },
    {
      id: 'rock-002',
      title: 'Grow Email List to 5,000 Subscribers',
      description: 'Build out lead magnets (Wedding Sparkler Guide, Safety Checklist, Venue Sparkler Lookbook), run targeted ads, and implement exit-intent popups to grow the email list.',
      quarter: 'Q2',
      year: CURRENT_YEAR,
      progress: 18,
      status: 'behind',
      owner: 'Marketing Team',
      dueDate: `${CURRENT_YEAR}-06-30`,
    },
    {
      id: 'rock-003',
      title: 'Achieve Sparkler Safety Certification for 20 Venues',
      description: 'Roll out the King of Sparklers Venue Safety Certification program. Conduct on-site audits and certify 20 partner venues to differentiate from competitors.',
      quarter: 'Q3',
      year: CURRENT_YEAR,
      progress: 10,
      status: 'on_track',
      owner: 'Operations',
      dueDate: `${CURRENT_YEAR}-09-30`,
    },
    {
      id: 'rock-004',
      title: 'Hit $500K in Q4 Revenue (Peak Season)',
      description: 'Execute the seasonal playbook for NYE and Holiday Parties. Pre-load inventory by October 15. Activate all B2B accounts and run holiday-themed D2C campaigns.',
      quarter: 'Q4',
      year: CURRENT_YEAR,
      progress: 0,
      status: 'on_track',
      owner: 'Leadership',
      dueDate: `${CURRENT_YEAR}-12-31`,
    },
  ];

  const insertMany = db.transaction((items: typeof rocks) => {
    for (const r of items) {
      insert.run(r);
    }
  });

  insertMany(rocks);
  console.log(`  Seeded ${rocks.length} rocks`);
}

// ---------------------------------------------------------------------------
// 3. KPIs
// ---------------------------------------------------------------------------

function seedKPIs(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO kpis
      (id, name, value, target, unit, period, category)
    VALUES
      (@id, @name, @value, @target, @unit, @period, @category)
  `);

  const kpis = [
    { id: 'kpi-001', name: 'Website Visitors', value: 12450, target: 15000, unit: 'visitors', period: 'monthly', category: 'marketing' },
    { id: 'kpi-002', name: 'Email List Size', value: 2340, target: 5000, unit: 'subscribers', period: 'cumulative', category: 'marketing' },
    { id: 'kpi-003', name: 'Conversion Rate', value: 3.2, target: 4.0, unit: '%', period: 'monthly', category: 'sales' },
    { id: 'kpi-004', name: 'B2B Pipeline Value', value: 145000, target: 250000, unit: '$', period: 'quarterly', category: 'sales' },
    { id: 'kpi-005', name: 'New B2B Accounts', value: 8, target: 15, unit: 'accounts', period: 'quarterly', category: 'sales' },
    { id: 'kpi-006', name: 'Referrals Generated', value: 12, target: 20, unit: 'referrals', period: 'quarterly', category: 'growth' },
  ];

  const insertMany = db.transaction((items: typeof kpis) => {
    for (const k of items) {
      insert.run(k);
    }
  });

  insertMany(kpis);
  console.log(`  Seeded ${kpis.length} KPIs`);
}

// ---------------------------------------------------------------------------
// 4. BrandScript
// ---------------------------------------------------------------------------

function seedBrandScript(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO brand_scripts
      (id, hero, external_problem, internal_problem, philosophical_problem, guide, empathy, authority, plan, direct_cta, transitional_cta, failure, success, created_at)
    VALUES
      (@id, @hero, @externalProblem, @internalProblem, @philosophicalProblem, @guide, @empathy, @authority, @plan, @directCta, @transitionalCta, @failure, @success, @createdAt)
  `);

  insert.run({
    id: 'bs-001',
    hero: 'Event professionals, venue owners, wedding planners, and celebration enthusiasts who want to create breathtaking, memorable moments with sparklers.',
    externalProblem: 'Finding high-quality, reliable sparklers that are safe for indoor and outdoor events is difficult. Many suppliers offer cheap, smoky products with inconsistent burn times that can ruin a celebration.',
    internalProblem: 'They feel anxious about safety risks, embarrassed when sparklers fizzle out during the big moment, and frustrated by unreliable suppliers who do not understand the events industry.',
    philosophicalProblem: 'Every celebration deserves a spectacular, safe, show-stopping moment. People should not have to choose between an amazing sparkler experience and the safety of their guests.',
    guide: 'King of Sparklers is the trusted sparkler authority, combining premium products with deep expertise in event safety and celebration design.',
    empathy: 'We understand the pressure of creating a perfect event. One bad sparkler moment can overshadow months of planning. Your reputation is on the line every time.',
    authority: 'Over 10,000 events supplied, trusted by top venues nationwide, proprietary safety certification program, premium smokeless sparkler technology, and dedicated event support team.',
    plan: json([
      { step: 1, description: 'Choose your sparklers: Browse our curated collection by event type (wedding, nightclub, corporate, or celebration).' },
      { step: 2, description: 'Get expert guidance: Our team helps you select the right size, quantity, and style for your specific venue and event.' },
      { step: 3, description: 'Receive your order with a safety kit: Every order includes our Sparkler Safety Guide, venue-specific usage tips, and compliance documentation.' },
    ]),
    directCta: 'Shop Sparklers Now',
    transitionalCta: 'Download the Free Wedding Sparkler Planning Guide',
    failure: 'Without the right sparklers, events fall flat. Cheap sparklers smoke out the venue, fizzle before the photo op, or worse, create safety hazards that put guests and your reputation at risk. Venues get fined, planners lose clients, and celebrations are remembered for the wrong reasons.',
    success: 'With King of Sparklers, every event becomes unforgettable. Stunning photo opportunities with clean, bright, long-lasting sparklers. Venues stay safe and compliant. Planners build their reputation as creators of magical moments. Guests leave in awe, sharing photos and videos that generate organic buzz for your brand.',
    createdAt: `${CURRENT_YEAR}-01-01`,
  });

  console.log('  Seeded 1 BrandScript');
}

// ---------------------------------------------------------------------------
// 5. Seasonal Peaks (4 peaks with 8-10 checklist items each)
// ---------------------------------------------------------------------------

function seedSeasonalPeaks(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO seasonal_peaks
      (id, name, peak_start, peak_end, preload_weeks, checklist_items)
    VALUES
      (@id, @name, @peakStart, @peakEnd, @preloadWeeks, @checklistItems)
  `);

  const peaks = [
    {
      id: 'peak-nye',
      name: 'New Year\'s Eve',
      peakStart: `${CURRENT_YEAR}-11-15`,
      peakEnd: `${CURRENT_YEAR + 1}-01-01`,
      preloadWeeks: 8,
      checklistItems: json([
        { id: 'nye-1', task: 'Order NYE inventory (gold, silver, multicolor sparklers) from manufacturer', category: 'inventory', completed: false, dueDate: `${CURRENT_YEAR}-09-15` },
        { id: 'nye-2', task: 'Design and print NYE-themed packaging and inserts', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-10-01` },
        { id: 'nye-3', task: 'Launch NYE email campaign series (5-email sequence)', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-11-01` },
        { id: 'nye-4', task: 'Contact all B2B nightclub accounts with NYE bulk pricing', category: 'sales', completed: false, dueDate: `${CURRENT_YEAR}-10-15` },
        { id: 'nye-5', task: 'Update website homepage with NYE hero banner and countdown', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-11-01` },
        { id: 'nye-6', task: 'Run Facebook/Instagram ads targeting NYE party planners', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-11-15` },
        { id: 'nye-7', task: 'Hire and train seasonal fulfillment staff (2-3 temps)', category: 'operations', completed: false, dueDate: `${CURRENT_YEAR}-11-01` },
        { id: 'nye-8', task: 'Pre-pack popular NYE bundles for fast shipping', category: 'fulfillment', completed: false, dueDate: `${CURRENT_YEAR}-11-10` },
        { id: 'nye-9', task: 'Set shipping cutoff dates and communicate to customers', category: 'operations', completed: false, dueDate: `${CURRENT_YEAR}-12-01` },
        { id: 'nye-10', task: 'Prepare post-NYE clearance sale and retargeting campaign', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-12-20` },
      ]),
    },
    {
      id: 'peak-wedding',
      name: 'Wedding Season',
      peakStart: `${CURRENT_YEAR}-05-01`,
      peakEnd: `${CURRENT_YEAR}-09-30`,
      preloadWeeks: 6,
      checklistItems: json([
        { id: 'wed-1', task: 'Stock up on 36-inch and 20-inch gold sparklers (top wedding sellers)', category: 'inventory', completed: false, dueDate: `${CURRENT_YEAR}-03-15` },
        { id: 'wed-2', task: 'Launch "Wedding Sparkler Guide" lead magnet campaign', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-03-01` },
        { id: 'wed-3', task: 'Partner with 10 wedding blogs/influencers for sponsored content', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-04-01` },
        { id: 'wed-4', task: 'Create wedding sparkler bundle pages on website', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-03-15` },
        { id: 'wed-5', task: 'Contact all wedding planner accounts with season pricing', category: 'sales', completed: false, dueDate: `${CURRENT_YEAR}-03-01` },
        { id: 'wed-6', task: 'Prepare wedding-themed social media content calendar (20 posts)', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-04-15` },
        { id: 'wed-7', task: 'Set up Google Ads campaigns targeting wedding sparkler keywords', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-04-01` },
        { id: 'wed-8', task: 'Print and ship wedding sparkler lookbooks to top 50 planners', category: 'sales', completed: false, dueDate: `${CURRENT_YEAR}-03-15` },
        { id: 'wed-9', task: 'Test and QA wedding sparkler photo booth display kits', category: 'product', completed: false, dueDate: `${CURRENT_YEAR}-04-01` },
      ]),
    },
    {
      id: 'peak-july4',
      name: 'July 4th / Independence Day',
      peakStart: `${CURRENT_YEAR}-06-15`,
      peakEnd: `${CURRENT_YEAR}-07-05`,
      preloadWeeks: 6,
      checklistItems: json([
        { id: 'jul-1', task: 'Order red, white, and blue sparkler inventory', category: 'inventory', completed: false, dueDate: `${CURRENT_YEAR}-05-01` },
        { id: 'jul-2', task: 'Design patriotic-themed packaging and website banners', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-05-15` },
        { id: 'jul-3', task: 'Launch July 4th email blast to full subscriber list', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-06-15` },
        { id: 'jul-4', task: 'Create "July 4th Party Pack" bundles with quantity discounts', category: 'product', completed: false, dueDate: `${CURRENT_YEAR}-05-15` },
        { id: 'jul-5', task: 'Run social media contest: best sparkler photo from last July 4th', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-06-01` },
        { id: 'jul-6', task: 'Publish July 4th sparkler safety blog post', category: 'content', completed: false, dueDate: `${CURRENT_YEAR}-06-10` },
        { id: 'jul-7', task: 'Contact event companies about July 4th corporate event orders', category: 'sales', completed: false, dueDate: `${CURRENT_YEAR}-05-15` },
        { id: 'jul-8', task: 'Set express shipping options for last-minute orders', category: 'operations', completed: false, dueDate: `${CURRENT_YEAR}-06-20` },
      ]),
    },
    {
      id: 'peak-holiday',
      name: 'Holiday Parties',
      peakStart: `${CURRENT_YEAR}-11-01`,
      peakEnd: `${CURRENT_YEAR}-12-31`,
      preloadWeeks: 6,
      checklistItems: json([
        { id: 'hol-1', task: 'Stock holiday-themed sparklers (gold, silver, champagne)', category: 'inventory', completed: false, dueDate: `${CURRENT_YEAR}-09-15` },
        { id: 'hol-2', task: 'Create corporate holiday party sparkler packages', category: 'product', completed: false, dueDate: `${CURRENT_YEAR}-09-30` },
        { id: 'hol-3', task: 'Launch "Holiday Celebration" email nurture sequence', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-10-15` },
        { id: 'hol-4', task: 'Contact hotel and venue B2B accounts for holiday event inventory', category: 'sales', completed: false, dueDate: `${CURRENT_YEAR}-10-01` },
        { id: 'hol-5', task: 'Design gift-ready sparkler sets with premium packaging', category: 'product', completed: false, dueDate: `${CURRENT_YEAR}-10-01` },
        { id: 'hol-6', task: 'Plan Black Friday / Cyber Monday sparkler promotions', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-10-15` },
        { id: 'hol-7', task: 'Create holiday party planning content for blog and social', category: 'content', completed: false, dueDate: `${CURRENT_YEAR}-10-15` },
        { id: 'hol-8', task: 'Coordinate with shipping carriers for holiday delivery guarantees', category: 'operations', completed: false, dueDate: `${CURRENT_YEAR}-10-30` },
        { id: 'hol-9', task: 'Launch retargeting campaigns for abandoned carts from Q3', category: 'marketing', completed: false, dueDate: `${CURRENT_YEAR}-11-01` },
      ]),
    },
  ];

  const insertMany = db.transaction((items: typeof peaks) => {
    for (const p of items) {
      insert.run(p);
    }
  });

  insertMany(peaks);
  console.log(`  Seeded ${peaks.length} seasonal peaks`);
}

// ---------------------------------------------------------------------------
// 6. Outreach Templates (8-touch sequence)
// ---------------------------------------------------------------------------

function seedOutreachTemplates(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO outreach_templates
      (id, touch_number, subject, body, channel)
    VALUES
      (@id, @touchNumber, @subject, @body, @channel)
  `);

  const templates = [
    {
      id: 'template-001',
      touchNumber: 1,
      subject: 'Premium Sparklers for {{company}} Events',
      body: `Hi {{contactName}},

I came across {{company}} and was impressed by the events you produce. I am reaching out from King of Sparklers -- we supply premium, safety-certified sparklers to top venues and event professionals nationwide.

Our sparklers are smokeless, long-burning, and designed specifically for indoor and outdoor events. We work with venues like The Ritz-Carlton and LIV Nightclub to create unforgettable moments.

Would you be open to a quick chat about how we could enhance your events with our sparkler products?

Best regards,
King of Sparklers Team`,
      channel: 'email',
    },
    {
      id: 'template-002',
      touchNumber: 2,
      subject: '',
      body: `Connect on LinkedIn. Like and comment on 2-3 of their recent posts before sending a connection request.

Connection message: "Hi {{contactName}}, I am with King of Sparklers. I loved seeing the events at {{company}} and would love to connect. We help venues create stunning sparkler moments safely."`,
      channel: 'linkedin',
    },
    {
      id: 'template-003',
      touchNumber: 3,
      subject: 'A Quick Idea for {{company}} + King of Sparklers',
      body: `Hi {{contactName}},

I wanted to follow up on my previous email. I put together a quick case study showing how venues similar to {{company}} have used our sparklers to boost their event experience and increase their bottle service revenue by 15-20%.

I have attached our Venue Sparkler Lookbook with photos and videos from recent events.

Would it be helpful if I sent over a complimentary sample kit so you can see the quality firsthand?

Best,
King of Sparklers Team`,
      channel: 'email',
    },
    {
      id: 'template-004',
      touchNumber: 4,
      subject: '',
      body: `Phone call script:

"Hi {{contactName}}, this is [Name] from King of Sparklers. I have been in touch via email about our premium sparkler products for {{company}}.

I wanted to quickly share that we are currently offering complimentary sample kits to select venues in your area. The kit includes our top-selling 20-inch and 36-inch gold sparklers plus our safety certification documentation.

Would you like me to send one over? It is completely free and there is no obligation."

If voicemail: Leave a brief message mentioning the free sample offer and that you will follow up by email.`,
      channel: 'phone',
    },
    {
      id: 'template-005',
      touchNumber: 5,
      subject: 'Your Complimentary Sparkler Sample Kit',
      body: `Hi {{contactName}},

Great news! I have put together a complimentary King of Sparklers sample kit for {{company}}. The kit includes:

- 20-inch Gold Sparklers (12 count)
- 36-inch Premium Sparklers (6 count)
- VIP Bottle Sparklers (6 count)
- Safety Data Sheet and Venue Usage Guide
- Volume pricing sheet

I will ship it out this week. Could you confirm the best shipping address?

Looking forward to your feedback!

Best,
King of Sparklers Team`,
      channel: 'email',
    },
    {
      id: 'template-006',
      touchNumber: 6,
      subject: '',
      body: `Send a physical mailer / handwritten note:

"{{contactName}},

Thanks for taking the time to explore King of Sparklers. We take pride in being the go-to sparkler partner for top venues across the country.

Enclosed is a small token of our appreciation. We would love to earn {{company}}'s business and help you create those jaw-dropping sparkler moments your guests will never forget.

Let us schedule a quick call to discuss how we can work together.

Warmly,
King of Sparklers Team"

Include: Branded notecard, 2 sample sparklers in premium packaging, business card with QR code to catalog.`,
      channel: 'mail',
    },
    {
      id: 'template-007',
      touchNumber: 7,
      subject: 'Special Offer for {{company}} - Volume Pricing Inside',
      body: `Hi {{contactName}},

I wanted to reach out one more time with something special. Based on the size and frequency of events at {{company}}, I have put together a custom volume pricing proposal:

- 10% off orders over 500 units
- 15% off orders over 1,000 units
- Free shipping on all B2B orders
- Dedicated account manager
- Priority fulfillment during peak seasons

This pricing is reserved for our partner venues and I would love to include {{company}} in that group.

Can we schedule a 15-minute call this week to walk through the details?

Best,
King of Sparklers Team`,
      channel: 'email',
    },
    {
      id: 'template-008',
      touchNumber: 8,
      subject: 'Staying in Touch - King of Sparklers',
      body: `Hi {{contactName}},

I know timing is everything, and right now may not be the best moment for {{company}} to explore a sparkler partnership.

I will keep you on our radar and reach out again before your next peak season. In the meantime, feel free to:

- Browse our catalog: kingofsparklers.com/catalog
- Download our free Venue Safety Guide: kingofsparklers.com/safety-guide
- Follow us on Instagram for event inspiration: @kingofsparklers

Whenever the timing is right, we would love to work with you.

All the best,
King of Sparklers Team

P.S. If you know any other event professionals who might benefit from premium sparklers, we offer a referral bonus for introductions that turn into partnerships.`,
      channel: 'email',
    },
  ];

  const insertMany = db.transaction((items: typeof templates) => {
    for (const t of items) {
      insert.run(t);
    }
  });

  insertMany(templates);
  console.log(`  Seeded ${templates.length} outreach templates`);
}

// ---------------------------------------------------------------------------
// 7. Content Items (15 ideas across safety / inspiration / education)
// ---------------------------------------------------------------------------

function seedContentItems(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO content_items
      (id, title, pillar, platform, audience, status, scheduled_date, brief, created_at)
    VALUES
      (@id, @title, @pillar, @platform, @audience, @status, @scheduledDate, @brief, @createdAt)
  `);

  const items = [
    // Safety pillar (5)
    {
      id: 'content-001',
      title: 'The Complete Guide to Indoor Sparkler Safety',
      pillar: 'safety',
      platform: 'Blog',
      audience: 'Venue owners, event planners',
      status: 'published',
      scheduledDate: `${CURRENT_YEAR}-01-15`,
      brief: 'Comprehensive guide covering ventilation requirements, approved sparkler types for indoor use, fire marshal regulations by state, and best practices for safe indoor sparkler displays.',
      createdAt: `${CURRENT_YEAR}-01-05`,
    },
    {
      id: 'content-002',
      title: '5 Sparkler Safety Mistakes That Can Shut Down Your Venue',
      pillar: 'safety',
      platform: 'Instagram Reel / TikTok',
      audience: 'Nightclub and bar owners',
      status: 'scheduled',
      scheduledDate: `${CURRENT_YEAR}-02-20`,
      brief: 'Short-form video listing common safety mistakes: wrong sparkler size, no ventilation, no safety briefing, cheap imports without certifications, and no fire extinguisher nearby.',
      createdAt: `${CURRENT_YEAR}-02-01`,
    },
    {
      id: 'content-003',
      title: 'How to Get Your Venue Sparkler-Certified',
      pillar: 'safety',
      platform: 'Blog + Email',
      audience: 'Venue owners, hotel event managers',
      status: 'drafted',
      scheduledDate: `${CURRENT_YEAR}-03-01`,
      brief: 'Step-by-step walkthrough of the King of Sparklers Venue Safety Certification program. Include testimonials from certified venues and the benefits of certification for insurance and marketing.',
      createdAt: `${CURRENT_YEAR}-02-10`,
    },
    {
      id: 'content-004',
      title: 'Sparkler Safety Checklist (Downloadable PDF)',
      pillar: 'safety',
      platform: 'Website lead magnet',
      audience: 'All B2B prospects',
      status: 'published',
      scheduledDate: `${CURRENT_YEAR}-01-01`,
      brief: 'One-page printable PDF checklist covering pre-event safety checks, during-event protocols, and post-event cleanup procedures. Used as a lead magnet for email capture.',
      createdAt: `${CURRENT_YEAR}-01-01`,
    },
    {
      id: 'content-005',
      title: 'What Fire Marshals Want You to Know About Event Sparklers',
      pillar: 'safety',
      platform: 'YouTube',
      audience: 'Event professionals',
      status: 'idea',
      scheduledDate: '',
      brief: 'Interview with a fire marshal about sparkler regulations, what venues get wrong, and how King of Sparklers products meet compliance standards.',
      createdAt: `${CURRENT_YEAR}-02-15`,
    },
    // Inspiration pillar (5)
    {
      id: 'content-006',
      title: '20 Stunning Wedding Sparkler Send-Off Photos',
      pillar: 'inspiration',
      platform: 'Blog + Pinterest',
      audience: 'Brides, wedding planners',
      status: 'published',
      scheduledDate: `${CURRENT_YEAR}-01-20`,
      brief: 'Curated gallery of the best wedding sparkler photos from real King of Sparklers customers. Include sparkler sizes used, venue details, and photographer credits.',
      createdAt: `${CURRENT_YEAR}-01-10`,
    },
    {
      id: 'content-007',
      title: 'Behind the Scenes: Setting Up a VIP Bottle Service Sparkler Display',
      pillar: 'inspiration',
      platform: 'Instagram Reel / TikTok',
      audience: 'Nightclub owners, event planners',
      status: 'scheduled',
      scheduledDate: `${CURRENT_YEAR}-02-25`,
      brief: 'Time-lapse video of setting up a VIP sparkler display at a nightclub. Show the full process from unpacking to the final "wow" moment when sparklers light up.',
      createdAt: `${CURRENT_YEAR}-02-05`,
    },
    {
      id: 'content-008',
      title: 'How This Hotel Increased Event Bookings 30% with Sparkler Packages',
      pillar: 'inspiration',
      platform: 'Blog + LinkedIn',
      audience: 'Hotel event managers',
      status: 'drafted',
      scheduledDate: `${CURRENT_YEAR}-03-10`,
      brief: 'Case study featuring a partner hotel that added sparkler packages as an upsell to their event offerings, resulting in a 30% increase in premium event bookings.',
      createdAt: `${CURRENT_YEAR}-02-12`,
    },
    {
      id: 'content-009',
      title: 'July 4th Sparkler Party Ideas for Every Budget',
      pillar: 'inspiration',
      platform: 'Blog + Email',
      audience: 'D2C consumers, party hosts',
      status: 'idea',
      scheduledDate: '',
      brief: 'Roundup of July 4th party ideas featuring sparklers: budget-friendly backyard celebrations, mid-range neighborhood block parties, and premium patriotic galas.',
      createdAt: `${CURRENT_YEAR}-02-18`,
    },
    {
      id: 'content-010',
      title: 'Sparkler Entrance Ideas for Corporate Galas',
      pillar: 'inspiration',
      platform: 'LinkedIn + Blog',
      audience: 'Corporate event planners',
      status: 'idea',
      scheduledDate: '',
      brief: 'Showcase creative ways to use sparklers at corporate events: entrance tunnels, stage reveals, award ceremony moments, and grand finale displays.',
      createdAt: `${CURRENT_YEAR}-02-20`,
    },
    // Education pillar (5)
    {
      id: 'content-011',
      title: 'Gold vs Silver vs Multicolor: Which Sparkler Is Right for Your Event?',
      pillar: 'education',
      platform: 'Blog',
      audience: 'All customers',
      status: 'published',
      scheduledDate: `${CURRENT_YEAR}-01-25`,
      brief: 'Product comparison guide covering the differences between sparkler types, burn times, smoke levels, and which events each is best suited for.',
      createdAt: `${CURRENT_YEAR}-01-15`,
    },
    {
      id: 'content-012',
      title: 'How to Calculate the Right Number of Sparklers for Your Event',
      pillar: 'education',
      platform: 'Blog + Calculator tool',
      audience: 'Event planners, brides',
      status: 'drafted',
      scheduledDate: `${CURRENT_YEAR}-03-05`,
      brief: 'Educational post with a formula and interactive calculator for determining sparkler quantities based on guest count, event type, and desired display duration.',
      createdAt: `${CURRENT_YEAR}-02-08`,
    },
    {
      id: 'content-013',
      title: 'Sparkler Size Guide: 10-inch vs 20-inch vs 36-inch',
      pillar: 'education',
      platform: 'Instagram carousel',
      audience: 'All customers',
      status: 'scheduled',
      scheduledDate: `${CURRENT_YEAR}-02-28`,
      brief: 'Visual carousel comparing sparkler sizes side by side. Include burn time, brightness, best use cases, and price points for each size.',
      createdAt: `${CURRENT_YEAR}-02-10`,
    },
    {
      id: 'content-014',
      title: 'The Difference Between Consumer and Commercial-Grade Sparklers',
      pillar: 'education',
      platform: 'YouTube + Blog',
      audience: 'B2B prospects, venue owners',
      status: 'idea',
      scheduledDate: '',
      brief: 'Educational deep-dive comparing consumer sparklers from big-box stores to commercial-grade King of Sparklers products. Cover composition, safety testing, burn consistency, and smoke output.',
      createdAt: `${CURRENT_YEAR}-02-14`,
    },
    {
      id: 'content-015',
      title: 'How to Store Sparklers Properly: A Guide for Venues',
      pillar: 'education',
      platform: 'Email + Blog',
      audience: 'Venue owners, hotel staff',
      status: 'idea',
      scheduledDate: '',
      brief: 'Practical guide on proper sparkler storage: temperature requirements, humidity considerations, shelf life, and OSHA/fire code compliance for on-site storage.',
      createdAt: `${CURRENT_YEAR}-02-16`,
    },
  ];

  const insertMany = db.transaction((rows: typeof items) => {
    for (const item of rows) {
      insert.run(item);
    }
  });

  insertMany(items);
  console.log(`  Seeded ${items.length} content items`);
}

// ---------------------------------------------------------------------------
// 8. SOPs (5 SOPs with 5-8 steps each)
// ---------------------------------------------------------------------------

function seedSOPs(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO sops
      (id, title, category, steps, version, last_updated)
    VALUES
      (@id, @title, @category, @steps, @version, @lastUpdated)
  `);

  const sops = [
    {
      id: 'sop-001',
      title: 'Order Fulfillment Process',
      category: 'fulfillment',
      steps: json([
        { id: 'sop1-s1', instruction: 'Check the order queue in Shopify admin. Print the packing slip for each new order.', completed: false },
        { id: 'sop1-s2', instruction: 'Verify inventory availability in the warehouse management spreadsheet. If an item is out of stock, flag the order and notify the customer within 2 hours.', completed: false },
        { id: 'sop1-s3', instruction: 'Pick items from warehouse shelves using the packing slip. Double-check SKU numbers and quantities against the order.', completed: false },
        { id: 'sop1-s4', instruction: 'Pack sparklers using approved packaging materials. Use bubble wrap for 36-inch sparklers. Include the safety insert card and branded thank-you note in every package.', completed: false },
        { id: 'sop1-s5', instruction: 'Weigh the package, generate the shipping label via ShipStation, and apply the label. Use UPS Ground for standard orders and UPS 2-Day for expedited orders.', completed: false },
        { id: 'sop1-s6', instruction: 'Scan the tracking number into Shopify to trigger the shipment notification email to the customer.', completed: false },
        { id: 'sop1-s7', instruction: 'Place the package in the outbound staging area organized by carrier. Ensure all packages are picked up by end of business day.', completed: false },
        { id: 'sop1-s8', instruction: 'Update the daily fulfillment log with order numbers, ship dates, and carrier information. Flag any issues for the fulfillment manager.', completed: false },
      ]),
      version: '2.1',
      lastUpdated: `${CURRENT_YEAR}-01-15`,
    },
    {
      id: 'sop-002',
      title: 'Customer Service Response Protocol',
      category: 'customer_service',
      steps: json([
        { id: 'sop2-s1', instruction: 'Check all support channels (email, phone, live chat, social media DMs) at the start of each shift. Prioritize inquiries by urgency: safety concerns first, then order issues, then general questions.', completed: false },
        { id: 'sop2-s2', instruction: 'Respond to all inquiries within 2 hours during business hours. Use the approved response templates in the shared Google Drive folder as starting points.', completed: false },
        { id: 'sop2-s3', instruction: 'For order status inquiries, look up the order in Shopify and provide the tracking number and estimated delivery date. If there is a delay, proactively offer a resolution.', completed: false },
        { id: 'sop2-s4', instruction: 'For product questions (burn time, sizes, safety), refer to the Product Knowledge Base. If unsure, escalate to the product team rather than guessing.', completed: false },
        { id: 'sop2-s5', instruction: 'For returns or damaged products, follow the Returns SOP. Offer a replacement or refund within 1 business day. Take photos of damaged items for quality tracking.', completed: false },
        { id: 'sop2-s6', instruction: 'Log every customer interaction in the CRM with a summary, resolution, and any follow-up needed. Tag the interaction by category (order, product, safety, complaint, praise).', completed: false },
        { id: 'sop2-s7', instruction: 'For B2B customers, CC the account manager on all communications. B2B accounts get priority response (within 1 hour during business hours).', completed: false },
      ]),
      version: '1.4',
      lastUpdated: `${CURRENT_YEAR}-01-20`,
    },
    {
      id: 'sop-003',
      title: 'B2B Dream 100 Outreach Process',
      category: 'b2b_outreach',
      steps: json([
        { id: 'sop3-s1', instruction: 'Research the prospect using LinkedIn, their website, and social media. Note their event types, venue size, and any current sparkler usage. Log findings in the Dream 100 CRM.', completed: false },
        { id: 'sop3-s2', instruction: 'Select the appropriate outreach template based on the touch number and channel. Personalize every template with specific details about the prospect and their business.', completed: false },
        { id: 'sop3-s3', instruction: 'Send Touch 1 (intro email). Wait 7 days. If no response, proceed to Touch 2 (LinkedIn connection). Continue the 8-touch sequence with 5-7 days between each touch.', completed: false },
        { id: 'sop3-s4', instruction: 'Log every touch in the CRM immediately after sending. Update the contact status as the relationship progresses (prospect -> contacted -> sample_sent -> meeting -> proposal -> won/lost).', completed: false },
        { id: 'sop3-s5', instruction: 'When a prospect responds positively, schedule a discovery call within 48 hours. Use the Discovery Call Script from the shared drive to guide the conversation.', completed: false },
        { id: 'sop3-s6', instruction: 'After the discovery call, send a follow-up email summarizing the conversation and next steps within 24 hours. If they want samples, ship within 2 business days.', completed: false },
      ]),
      version: '1.0',
      lastUpdated: `${CURRENT_YEAR}-02-01`,
    },
    {
      id: 'sop-004',
      title: 'Inventory Reorder Process',
      category: 'inventory',
      steps: json([
        { id: 'sop4-s1', instruction: 'Run the weekly inventory report every Monday morning. Compare current stock levels against the reorder point (ROP) for each SKU. ROP = (average daily sales x lead time in days) + safety stock.', completed: false },
        { id: 'sop4-s2', instruction: 'For any SKU below its reorder point, calculate the reorder quantity using the Economic Order Quantity (EOQ) formula or the pre-set reorder quantity in the inventory system.', completed: false },
        { id: 'sop4-s3', instruction: 'Submit purchase orders to approved suppliers. For sparklers, use our primary manufacturer. For packaging materials, use the approved packaging vendor list.', completed: false },
        { id: 'sop4-s4', instruction: 'Confirm order acknowledgment from the supplier within 48 hours. Verify lead times and expected delivery dates. Update the inventory system with the incoming PO details.', completed: false },
        { id: 'sop4-s5', instruction: 'When inventory arrives, conduct a receiving inspection: check quantities against the PO, inspect for damage, and verify product quality (burn test 2 random sparklers per shipment).', completed: false },
        { id: 'sop4-s6', instruction: 'Update inventory counts in the system. Shelve products in their designated warehouse locations. Update the bin location map if any changes are made.', completed: false },
        { id: 'sop4-s7', instruction: 'For seasonal peaks, multiply standard reorder quantities by the seasonal factor: NYE (3x), Wedding Season (2.5x), July 4th (2x), Holiday Parties (2x). Place seasonal orders 8 weeks before peak start.', completed: false },
      ]),
      version: '1.2',
      lastUpdated: `${CURRENT_YEAR}-01-25`,
    },
    {
      id: 'sop-005',
      title: 'Social Media Posting Process',
      category: 'social_media',
      steps: json([
        { id: 'sop5-s1', instruction: 'Review the content calendar every Monday. Identify the posts scheduled for the week across all platforms (Instagram, TikTok, Facebook, LinkedIn, Pinterest).', completed: false },
        { id: 'sop5-s2', instruction: 'Create or finalize visual assets for each post. Use the King of Sparklers brand kit (colors: gold #D4AF37, black #1a1a1a, white #ffffff). All photos must be high-resolution and show sparklers in action.', completed: false },
        { id: 'sop5-s3', instruction: 'Write captions using the StoryBrand framework. Each post should address a problem, position King of Sparklers as the guide, and include a clear call to action. Use 5-10 relevant hashtags.', completed: false },
        { id: 'sop5-s4', instruction: 'Schedule posts using the social media management tool. Optimal posting times: Instagram 11am and 7pm EST, TikTok 9am and 5pm EST, LinkedIn 8am and 12pm EST.', completed: false },
        { id: 'sop5-s5', instruction: 'Monitor engagement within the first 2 hours of each post. Respond to all comments within 1 hour. Like and reply to every comment to boost algorithm visibility.', completed: false },
        { id: 'sop5-s6', instruction: 'Track weekly metrics: impressions, engagement rate, follower growth, link clicks, and DMs received. Log metrics in the Social Media Tracker spreadsheet every Friday.', completed: false },
      ]),
      version: '1.1',
      lastUpdated: `${CURRENT_YEAR}-02-05`,
    },
  ];

  const insertMany = db.transaction((items: typeof sops) => {
    for (const s of items) {
      insert.run(s);
    }
  });

  insertMany(sops);
  console.log(`  Seeded ${sops.length} SOPs`);
}

// ---------------------------------------------------------------------------
// 9. Journey Customers (5 at various stages)
// ---------------------------------------------------------------------------

function seedJourneyCustomers(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO journey_customers
      (id, name, email, company, stage, notes, last_action, created_at)
    VALUES
      (@id, @name, @email, @company, @stage, @notes, @lastAction, @createdAt)
  `);

  const customers = [
    {
      id: 'journey-001',
      name: 'Amanda Foster',
      email: 'amanda.foster@gmail.com',
      company: '',
      stage: 'advocate',
      notes: 'Ordered 36-inch sparklers for her wedding. Left a 5-star review and posted photos on Instagram tagging us. Has referred 3 friends who are getting married.',
      lastAction: 'Posted sparkler photos on Instagram and tagged @kingofsparklers',
      createdAt: `${CURRENT_YEAR - 1}-06-15`,
    },
    {
      id: 'journey-002',
      name: 'David Kim',
      email: 'david@eliteeventschi.com',
      company: 'Elite Events Chicago',
      stage: 'convert',
      notes: 'Downloaded the Wedding Sparkler Guide, subscribed to the newsletter, and just placed his first B2B order of 500 sparklers for a corporate event.',
      lastAction: 'Placed first B2B order ($1,250)',
      createdAt: `${CURRENT_YEAR}-01-10`,
    },
    {
      id: 'journey-003',
      name: 'Michelle Santos',
      email: 'michelle.santos@outlook.com',
      company: '',
      stage: 'subscribe',
      notes: 'Found us through a Google search for "wedding sparkler ideas." Signed up for the email list after reading the blog post about sparkler send-off photos.',
      lastAction: 'Subscribed to email list via Wedding Sparkler Guide lead magnet',
      createdAt: `${CURRENT_YEAR}-02-01`,
    },
    {
      id: 'journey-004',
      name: 'Robert Chang',
      email: 'rchang@changhospitality.com',
      company: 'Chang Hospitality Group',
      stage: 'ascend',
      notes: 'Started with a small order of VIP bottle sparklers. Now orders monthly for his 3 restaurant/lounge locations. Recently upgraded to our Premium Partner tier with volume pricing.',
      lastAction: 'Upgraded to Premium Partner tier and signed annual contract',
      createdAt: `${CURRENT_YEAR - 1}-03-20`,
    },
    {
      id: 'journey-005',
      name: 'Brittany Wells',
      email: 'brittany.w@luminousevents.com',
      company: 'Luminous Events',
      stage: 'engage',
      notes: 'Followed us on Instagram and engaged with several posts. Watched our sparkler safety reel. Has not subscribed or visited the website yet.',
      lastAction: 'Commented on our Instagram post about indoor sparkler safety',
      createdAt: `${CURRENT_YEAR}-02-08`,
    },
  ];

  const insertMany = db.transaction((items: typeof customers) => {
    for (const c of items) {
      insert.run(c);
    }
  });

  insertMany(customers);
  console.log(`  Seeded ${customers.length} journey customers`);
}

// ---------------------------------------------------------------------------
// 10. Safety Certifications (2 sample certifications)
// ---------------------------------------------------------------------------

function seedSafetyCertifications(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO safety_certifications
      (id, venue_name, venue_address, contact_name, contact_email, contact_phone, certification_number, certified_date, expiry_date, status, checklist_items)
    VALUES
      (@id, @venueName, @venueAddress, @contactName, @contactEmail, @contactPhone, @certificationNumber, @certifiedDate, @expiryDate, @status, @checklistItems)
  `);

  const certifications = [
    {
      id: 'cert-001',
      venueName: 'The Grand Ballroom at The Westin',
      venueAddress: '123 Peachtree Street NE, Atlanta, GA 30303',
      contactName: 'Karen Mitchell',
      contactEmail: 'karen.mitchell@westin.com',
      contactPhone: '(404) 555-0198',
      certificationNumber: 'KOS-CERT-2025-001',
      certifiedDate: `${CURRENT_YEAR}-01-15`,
      expiryDate: `${CURRENT_YEAR + 1}-01-15`,
      status: 'certified',
      checklistItems: json([
        { id: 'cert1-1', item: 'Venue has adequate ventilation system (minimum 6 air changes per hour in sparkler use areas)', completed: true },
        { id: 'cert1-2', item: 'Fire extinguishers (ABC-rated) within 50 feet of sparkler use areas', completed: true },
        { id: 'cert1-3', item: 'Ceiling height is at least 12 feet in sparkler use areas', completed: true },
        { id: 'cert1-4', item: 'Non-flammable flooring or approved floor coverings in sparkler zones', completed: true },
        { id: 'cert1-5', item: 'Staff trained on sparkler safety protocol (minimum 2 trained staff per event)', completed: true },
        { id: 'cert1-6', item: 'Emergency exit routes clear and marked in sparkler use areas', completed: true },
        { id: 'cert1-7', item: 'Sparkler disposal buckets (sand or water) available at all sparkler stations', completed: true },
        { id: 'cert1-8', item: 'Local fire marshal approval or notification on file', completed: true },
        { id: 'cert1-9', item: 'Insurance coverage includes indoor pyrotechnic / sparkler use', completed: true },
        { id: 'cert1-10', item: 'Guest safety briefing protocol documented and staff-approved', completed: true },
      ]),
    },
    {
      id: 'cert-002',
      venueName: 'Skyline Rooftop Lounge',
      venueAddress: '450 S Miami Ave, Miami, FL 33130',
      contactName: 'Carlos Mendez',
      contactEmail: 'carlos@skylinemiami.com',
      contactPhone: '(305) 555-0347',
      certificationNumber: '',
      certifiedDate: '',
      expiryDate: '',
      status: 'audit',
      checklistItems: json([
        { id: 'cert2-1', item: 'Outdoor area wind assessment completed (sparklers rated for winds up to 15 mph)', completed: true },
        { id: 'cert2-2', item: 'Fire extinguishers (ABC-rated) within 50 feet of sparkler use areas', completed: true },
        { id: 'cert2-3', item: 'Designated sparkler zones marked and separated from guest seating by minimum 4 feet', completed: false },
        { id: 'cert2-4', item: 'Non-flammable barriers around sparkler zones (for rooftop/outdoor)', completed: false },
        { id: 'cert2-5', item: 'Staff trained on sparkler safety protocol (minimum 2 trained staff per event)', completed: true },
        { id: 'cert2-6', item: 'Emergency exit routes clear and marked in sparkler use areas', completed: true },
        { id: 'cert2-7', item: 'Sparkler disposal buckets (sand or water) available at all sparkler stations', completed: false },
        { id: 'cert2-8', item: 'Local fire marshal approval or notification on file', completed: false },
        { id: 'cert2-9', item: 'Insurance coverage includes outdoor pyrotechnic / sparkler use', completed: true },
        { id: 'cert2-10', item: 'Guest safety briefing protocol documented and staff-approved', completed: false },
      ]),
    },
  ];

  const insertMany = db.transaction((items: typeof certifications) => {
    for (const c of items) {
      insert.run(c);
    }
  });

  insertMany(certifications);
  console.log(`  Seeded ${certifications.length} safety certifications`);
}

// ---------------------------------------------------------------------------
// 11. TikTok Shop Products (6 products)
// ---------------------------------------------------------------------------

function seedTikTokShopProducts(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tiktok_shop_products
      (id, name, sku, category, price, commission_rate, status, sample_status, tiktok_url, notes, created_at)
    VALUES
      (@id, @name, @sku, @category, @price, @commissionRate, @status, @sampleStatus, @tiktokUrl, @notes, @createdAt)
  `);

  const products = [
    {
      id: 'ttshop-prod-001',
      name: 'Wedding Sparkler Starter Pack (12pc)',
      sku: 'KOS-WED-12',
      category: 'wedding',
      price: 19.99,
      commissionRate: 15,
      status: 'active',
      sampleStatus: 'filming',
      tiktokUrl: '',
      notes: 'Loss-leader for GMV momentum. Target brides and wedding planners. Best-seller potential.',
      createdAt: `${CURRENT_YEAR}-01-15`,
    },
    {
      id: 'ttshop-prod-002',
      name: 'Gold VIP Bottle Sparklers (6pc)',
      sku: 'KOS-VIP-6',
      category: 'vip',
      price: 14.99,
      commissionRate: 20,
      status: 'active',
      sampleStatus: 'filming',
      tiktokUrl: '',
      notes: 'Nightlife audience. Great for trending sound mashups and VIP setup tutorials.',
      createdAt: `${CURRENT_YEAR}-01-15`,
    },
    {
      id: 'ttshop-prod-003',
      name: '36-Inch Premium Gold Sparklers (24pc)',
      sku: 'KOS-PREM-24',
      category: 'wedding',
      price: 34.99,
      commissionRate: 15,
      status: 'active',
      sampleStatus: 'received',
      tiktokUrl: '',
      notes: 'Premium wedding send-off product. Higher AOV driver. Side-by-side comparison content.',
      createdAt: `${CURRENT_YEAR}-01-22`,
    },
    {
      id: 'ttshop-prod-004',
      name: 'Sparkler Safety Kit',
      sku: 'KOS-SAFE-01',
      category: 'starter',
      price: 9.99,
      commissionRate: 25,
      status: 'draft',
      sampleStatus: 'none',
      tiktokUrl: '',
      notes: 'Trust-building product. Pairs with safety demo videos. High commission to attract affiliates.',
      createdAt: `${CURRENT_YEAR}-02-01`,
    },
    {
      id: 'ttshop-prod-005',
      name: 'July 4th Party Pack (48pc)',
      sku: 'KOS-JUL4-48',
      category: 'holiday',
      price: 29.99,
      commissionRate: 15,
      status: 'draft',
      sampleStatus: 'none',
      tiktokUrl: '',
      notes: 'Seasonal product. Launch in May for summer content push. Red, white, and blue mix.',
      createdAt: `${CURRENT_YEAR}-02-10`,
    },
    {
      id: 'ttshop-prod-006',
      name: 'VIP Experience Bundle',
      sku: 'KOS-VIPX-01',
      category: 'vip',
      price: 49.99,
      commissionRate: 12,
      status: 'draft',
      sampleStatus: 'none',
      tiktokUrl: '',
      notes: 'Premium bundle for nightclub/event accounts. Bottle sparklers + safety kit + branded packaging.',
      createdAt: `${CURRENT_YEAR}-02-10`,
    },
  ];

  const insertMany = db.transaction((items: typeof products) => {
    for (const p of items) {
      insert.run(p);
    }
  });

  insertMany(products);
  console.log(`  Seeded ${products.length} TikTok Shop products`);
}

// ---------------------------------------------------------------------------
// 12. TikTok Shop Videos (10 videos across various formats)
// ---------------------------------------------------------------------------

function seedTikTokShopVideos(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tiktok_shop_videos
      (id, product_id, title, hook, format, status, views, likes, comments, shares, orders_generated, gmv_generated, posted_date, notes, created_at)
    VALUES
      (@id, @productId, @title, @hook, @format, @status, @views, @likes, @comments, @shares, @ordersGenerated, @gmvGenerated, @postedDate, @notes, @createdAt)
  `);

  const videos = [
    {
      id: 'ttshop-vid-001',
      productId: 'ttshop-prod-001',
      title: '$3 sparklers vs $20 sparklers for your wedding',
      hook: 'Stop buying sparklers from Amazon for your wedding',
      format: 'showcase',
      status: 'posted',
      views: 12400,
      likes: 890,
      comments: 67,
      shares: 23,
      ordersGenerated: 8,
      gmvGenerated: 159.92,
      postedDate: `${CURRENT_YEAR}-01-20`,
      notes: 'First video posted. Strong hook performance. Comment section full of wedding questions.',
      createdAt: `${CURRENT_YEAR}-01-18`,
    },
    {
      id: 'ttshop-vid-002',
      productId: 'ttshop-prod-002',
      title: 'How nightclubs set up VIP bottle sparklers',
      hook: 'POV: You ordered bottle service and this happens',
      format: 'tutorial',
      status: 'posted',
      views: 8700,
      likes: 620,
      comments: 45,
      shares: 31,
      ordersGenerated: 5,
      gmvGenerated: 74.95,
      postedDate: `${CURRENT_YEAR}-01-25`,
      notes: 'Nightlife audience responded well. Several DMs from club promoters.',
      createdAt: `${CURRENT_YEAR}-01-23`,
    },
    {
      id: 'ttshop-vid-003',
      productId: 'ttshop-prod-003',
      title: 'The sparkler that made 200 wedding guests cry',
      hook: 'The difference between a $3 sparkler and a $25 sparkler',
      format: 'showcase',
      status: 'posted',
      views: 34200,
      likes: 2800,
      comments: 189,
      shares: 87,
      ordersGenerated: 22,
      gmvGenerated: 769.78,
      postedDate: `${CURRENT_YEAR}-02-01`,
      notes: 'Best performer so far. Slow-motion wedding exit footage. Generated 15 comment reply opportunities.',
      createdAt: `${CURRENT_YEAR}-01-30`,
    },
    {
      id: 'ttshop-vid-004',
      productId: 'ttshop-prod-001',
      title: 'Reply: Are these safe for indoor weddings?',
      hook: 'Replying to @bridezilla2026 — are sparklers safe indoors?',
      format: 'tutorial',
      status: 'posted',
      views: 6300,
      likes: 410,
      comments: 52,
      shares: 14,
      ordersGenerated: 4,
      gmvGenerated: 79.96,
      postedDate: `${CURRENT_YEAR}-02-05`,
      notes: 'Comment reply video from vid-003. Safety demo format. Good trust builder.',
      createdAt: `${CURRENT_YEAR}-02-03`,
    },
    {
      id: 'ttshop-vid-005',
      productId: 'ttshop-prod-002',
      title: 'Unboxing the King of Sparklers VIP kit',
      hook: 'What $15 bottle sparklers actually look like',
      format: 'unboxing',
      status: 'posted',
      views: 4100,
      likes: 290,
      comments: 28,
      shares: 9,
      ordersGenerated: 3,
      gmvGenerated: 44.97,
      postedDate: `${CURRENT_YEAR}-02-08`,
      notes: 'Unboxing format testing. Lower views but solid conversion rate.',
      createdAt: `${CURRENT_YEAR}-02-06`,
    },
    {
      id: 'ttshop-vid-006',
      productId: 'ttshop-prod-003',
      title: 'How many sparklers do you need for your wedding?',
      hook: 'Things I wish I knew before my wedding sparkler send-off',
      format: 'tutorial',
      status: 'editing',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      ordersGenerated: 0,
      gmvGenerated: 0,
      postedDate: '',
      notes: 'Calculator walkthrough video. Addresses most common comment question.',
      createdAt: `${CURRENT_YEAR}-02-10`,
    },
    {
      id: 'ttshop-vid-007',
      productId: 'ttshop-prod-001',
      title: 'Wedding sparkler fails compilation',
      hook: 'When you buy $3 sparklers for your wedding...',
      format: 'trending',
      status: 'scripted',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      ordersGenerated: 0,
      gmvGenerated: 0,
      postedDate: '',
      notes: 'Humor angle with trending sound. Show cheap sparkler fails then KoS sparklers as the solution.',
      createdAt: `${CURRENT_YEAR}-02-12`,
    },
    {
      id: 'ttshop-vid-008',
      productId: 'ttshop-prod-002',
      title: 'Behind the scenes: Packing 500 sparklers for a Miami club',
      hook: 'Ever wonder how nightclubs get their sparklers?',
      format: 'behind_scenes',
      status: 'filmed',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      ordersGenerated: 0,
      gmvGenerated: 0,
      postedDate: '',
      notes: 'Warehouse BTS content. Shows scale and professionalism. Scheduled for next week.',
      createdAt: `${CURRENT_YEAR}-02-13`,
    },
    {
      id: 'ttshop-vid-009',
      productId: 'ttshop-prod-003',
      title: '10-inch vs 20-inch vs 36-inch sparklers',
      hook: 'Which sparkler size is right for YOUR event?',
      format: 'showcase',
      status: 'idea',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      ordersGenerated: 0,
      gmvGenerated: 0,
      postedDate: '',
      notes: 'Size guide visual. Hold all three sizes side by side. Film at dusk for best contrast.',
      createdAt: `${CURRENT_YEAR}-02-14`,
    },
    {
      id: 'ttshop-vid-010',
      productId: 'ttshop-prod-001',
      title: 'What a $500 sparkler send-off looks like',
      hook: 'Wait for it...',
      format: 'testimonial',
      status: 'idea',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      ordersGenerated: 0,
      gmvGenerated: 0,
      postedDate: '',
      notes: 'Customer testimonial. Request footage from Elegant Affairs (contact-003). Premium feel.',
      createdAt: `${CURRENT_YEAR}-02-15`,
    },
  ];

  const insertMany = db.transaction((items: typeof videos) => {
    for (const v of items) {
      insert.run(v);
    }
  });

  insertMany(videos);
  console.log(`  Seeded ${videos.length} TikTok Shop videos`);
}

// ---------------------------------------------------------------------------
// 13. TikTok Shop Metrics (daily snapshots for past 2 weeks)
// ---------------------------------------------------------------------------

function seedTikTokShopMetrics(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tiktok_shop_metrics
      (id, date, period, total_gmv, total_orders, total_views, total_videos_posted, commission_earned, top_product, notes)
    VALUES
      (@id, @date, @period, @totalGmv, @totalOrders, @totalViews, @totalVideosPosted, @commissionEarned, @topProduct, @notes)
  `);

  const metrics = [
    { id: 'ttm-w1', date: `${CURRENT_YEAR}-01-26`, period: 'weekly', totalGmv: 234.87, totalOrders: 13, totalViews: 21100, totalVideosPosted: 3, commissionEarned: 35.23, topProduct: 'Wedding Sparkler Starter Pack', notes: 'First full week. 2 videos posted.' },
    { id: 'ttm-w2', date: `${CURRENT_YEAR}-02-02`, period: 'weekly', totalGmv: 849.74, totalOrders: 30, totalViews: 42500, totalVideosPosted: 5, commissionEarned: 127.46, topProduct: '36-Inch Premium Gold Sparklers', notes: 'Viral video (vid-003) drove most GMV. Algorithm picking up.' },
    { id: 'ttm-w3', date: `${CURRENT_YEAR}-02-09`, period: 'weekly', totalGmv: 124.93, totalOrders: 7, totalViews: 10400, totalVideosPosted: 2, commissionEarned: 18.74, topProduct: 'Wedding Sparkler Starter Pack', notes: 'Slower week. Need more content variety. Only 2 videos posted.' },
    { id: 'ttm-m1', date: `${CURRENT_YEAR}-01-31`, period: 'monthly', totalGmv: 459.82, totalOrders: 22, totalViews: 33500, totalVideosPosted: 5, commissionEarned: 68.97, topProduct: 'Wedding Sparkler Starter Pack', notes: 'January launch month. Exceeded $400 GMV target.' },
  ];

  const insertMany = db.transaction((items: typeof metrics) => {
    for (const m of items) {
      insert.run(m);
    }
  });

  insertMany(metrics);
  console.log(`  Seeded ${metrics.length} TikTok Shop metrics`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('King of Sparklers - Database Seed');
  console.log('=================================');
  console.log('');

  console.log('Initializing database...');
  initDb();
  console.log('  Database tables created.');
  console.log('');

  console.log('Seeding data...');
  seedContacts();
  seedRocks();
  seedKPIs();
  seedBrandScript();
  seedSeasonalPeaks();
  seedOutreachTemplates();
  seedContentItems();
  seedSOPs();
  seedJourneyCustomers();
  seedSafetyCertifications();
  seedTikTokShopProducts();
  seedTikTokShopVideos();
  seedTikTokShopMetrics();

  console.log('');
  console.log('Seed complete!');
}

main();
