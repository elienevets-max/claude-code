# King of Sparklers — Growth Operating System

A full-stack strategic dashboard for **King of Sparklers**, a nationwide e-commerce supplier of sparklers, LED alternatives, and party supplies. This application consolidates 9 business frameworks into a single operational tool the business owner uses daily.

## Architecture

- **Frontend:** Next.js 14 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS with custom brand theme (Navy #1B2A4A + Gold #E8913A)
- **Backend:** Next.js API Routes
- **Database:** SQLite via better-sqlite3
- **Data:** Pre-seeded with King of Sparklers business data

## Features

### 1. Growth Dashboard
Weekly scorecard with all KPIs (website visitors, email list, conversion rate, B2B pipeline value, new accounts, referrals), quarterly Rocks tracker with progress bars, seasonal countdown timers with pre-load checklist status, and pipeline summary.

### 2. Dream 100 CRM
Full B2B contact management with pipeline kanban view (Prospect → Contacted → Sample Sent → Meeting → Proposal → Won/Lost), table view with filters, 8-touch outreach tracker per contact with pre-loaded email templates, contact detail modals, and search/filter by category and status.

### 3. StoryBrand Copy Generator
BrandScript editor with all 12 framework elements (Hero, Problem, Guide, Plan, CTA, Failure, Success). Auto-generates four types of marketing copy: homepage copy, 4-email nurture sequence, ad copy (Facebook, Google, TikTok), and landing page copy. Pre-filled with King of Sparklers BrandScript.

### 4. Seasonal Clockwork Planner
Visual calendar showing all 4 peak seasons (NYE, Wedding Season, July 4th, Holiday Parties) with countdown timers, pre-load checklists with category filtering, completion tracking, and automated reminder milestones at 12, 8, and 4 weeks before each peak.

### 5. Customer Value Journey Tracker
8-stage funnel visualization (Aware → Engage → Subscribe → Convert → Excite → Ascend → Advocate → Promote) with customer cards, stage-by-stage suggested actions, one-click stage transitions, and customer detail modals.

### 6. Safety Certification Program Portal
"Certified Safe Sparkler Venue" program management. Venue application forms, 10-point digital safety audit checklist, certification status tracking (Pending → Audit → Certified → Expired), certificate preview/generator, and certification badge for venues.

### 7. Content Calendar & Idea Generator
Three-pillar content system (Safety, Inspiration, Education) with board view (kanban by status), calendar view for scheduled content, idea bank with 24 pre-loaded content ideas, auto-generated content briefs, and status workflow (Idea → Drafted → Scheduled → Published).

### 8. SOP Manager
Standard Operating Procedures organized by business area (Fulfillment, Customer Service, B2B Outreach, Inventory, Social Media). Checklist-style step tracking, video link embedding (Loom), version control, and 5 pre-loaded template SOPs.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd king-of-sparklers

# Install dependencies
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The app runs at **http://localhost:3000**.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
king-of-sparklers/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # Root layout with sidebar
│   │   ├── globals.css           # Tailwind + custom utilities
│   │   ├── dream100/page.tsx     # Dream 100 CRM
│   │   ├── storybrand/page.tsx   # StoryBrand Copy Generator
│   │   ├── seasonal/page.tsx     # Seasonal Clockwork Planner
│   │   ├── journey/page.tsx      # Customer Value Journey
│   │   ├── safety/page.tsx       # Safety Certification Portal
│   │   ├── content/page.tsx      # Content Calendar
│   │   ├── sops/page.tsx         # SOP Manager
│   │   └── api/                  # 17 API route files
│   ├── components/
│   │   └── Sidebar.tsx           # Navigation sidebar
│   ├── lib/
│   │   ├── db.ts                 # SQLite database module
│   │   └── seed.ts               # Database seeding script
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── data/                         # SQLite database (auto-created)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Strategic Frameworks Implemented

| Framework | Source | Module |
|-----------|--------|--------|
| Bullseye Method | *Traction* (Weinberg & Mares) | Dashboard KPIs |
| Customer Value Journey | *Ecommerce Evolved* (Larsson) | Journey Tracker |
| Dream 100 | *Ultimate Sales Machine* (Holmes) | CRM Module |
| Predictable Revenue | *Predictable Revenue* (Ross) | 8-Touch Outreach |
| Positioning | *Positioning* (Ries & Trout) | StoryBrand |
| StoryBrand | *Building a StoryBrand* (Miller) | Copy Generator |
| E-Myth Franchise Prototype | *E-Myth Revisited* (Gerber) | SOP Manager |
| EOS Model | *Traction* (Wickman) | Rocks + KPIs |
| Clockwork 4D | *Clockwork* (Michalowicz) | Seasonal Planner |

## Brand Colors

- **Navy:** #1B2A4A (backgrounds, text)
- **Gold/Amber:** #E8913A (accents, CTAs, highlights)

## Key Business Context

King of Sparklers operates in a shifting market landscape. The January 2026 Crans-Montana tragedy (deadly fire caused by indoor sparklers) is accelerating a move toward LED and cold spark alternatives. The Safety Certification Program and indoor-safe product push are strategic responses to this market shift.
