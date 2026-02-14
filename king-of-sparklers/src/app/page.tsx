'use client';

import { useState, useEffect } from 'react';
import type { KPI, Rock, SeasonalPeak, Contact, ContactStatus } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number with locale-appropriate thousand separators. */
function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

/** Format a number as US-dollar currency ($145,000). */
function fmtCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

/** Format a number as a percentage string (e.g. "3.2%"). */
function fmtPct(n: number): string {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Return the ratio of value/target clamped to [0, 100]. */
function pctOfTarget(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

/** Choose a colour tier based on percent-of-target thresholds. */
function tierColor(pct: number): 'green' | 'gold' | 'red' {
  if (pct >= 80) return 'green';
  if (pct >= 50) return 'gold';
  return 'red';
}

/** Tailwind bg class for a given tier colour (used on progress fills). */
function fillBg(tier: 'green' | 'gold' | 'red'): string {
  if (tier === 'green') return 'bg-emerald-500';
  if (tier === 'gold') return 'bg-gold-400';
  return 'bg-red-500';
}

/** Human-readable date string for today. */
function todayString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Compute days from today to a target date string (YYYY-MM-DD or ISO). */
function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Determine the current quarter string, e.g. "Q1". */
function currentQuarter(): string {
  const m = new Date().getMonth(); // 0-11
  if (m < 3) return 'Q1';
  if (m < 6) return 'Q2';
  if (m < 9) return 'Q3';
  return 'Q4';
}

/** Format a KPI value depending on unit. */
function formatKpiValue(value: number, unit: string): string {
  const u = unit.toLowerCase();
  if (u === '$' || u === 'usd' || u === 'dollars' || u === 'currency') return fmtCurrency(value);
  if (u === '%' || u === 'percent' || u === 'percentage') return fmtPct(value);
  return fmt(value);
}

// Canonical KPI ordering & icon mapping
const KPI_META: Record<string, { icon: JSX.Element; order: number }> = {
  'Website Visitors': { order: 0, icon: <GlobeIcon /> },
  'Email List Size': { order: 1, icon: <EnvelopeIcon /> },
  'Conversion Rate': { order: 2, icon: <ChartIcon /> },
  'B2B Pipeline Value': { order: 3, icon: <DollarIcon /> },
  'New B2B Accounts': { order: 4, icon: <BuildingIcon /> },
  'Referrals Generated': { order: 5, icon: <ShareIcon /> },
};

// Pipeline stage metadata
const PIPELINE_STAGES: { key: ContactStatus; label: string; color: string }[] = [
  { key: 'prospect', label: 'Prospect', color: 'bg-gray-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'sample_sent', label: 'Sample Sent', color: 'bg-indigo-500' },
  { key: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-gold-400' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500' },
];

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [peaks, setPeaks] = useState<SeasonalPeak[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingRocks, setLoadingRocks] = useState(true);
  const [loadingPeaks, setLoadingPeaks] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Fetch all data in parallel on mount
  useEffect(() => {
    fetch('/api/kpis')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setKpis(data); })
      .catch(console.error)
      .finally(() => setLoadingKpis(false));

    fetch('/api/rocks')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRocks(data); })
      .catch(console.error)
      .finally(() => setLoadingRocks(false));

    fetch('/api/seasonal')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPeaks(data); })
      .catch(console.error)
      .finally(() => setLoadingPeaks(false));

    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContacts(data); })
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  // Derived data
  const quarter = currentQuarter();
  const year = new Date().getFullYear();
  const currentRocks = rocks.filter(
    (r) => r.quarter === quarter && r.year === year,
  );

  // Sort KPIs into canonical order
  const sortedKpis = [...kpis].sort((a, b) => {
    const oa = KPI_META[a.name]?.order ?? 99;
    const ob = KPI_META[b.name]?.order ?? 99;
    return oa - ob;
  });

  // Pipeline counts
  const pipelineCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: contacts.filter((c) => c.status === stage.key).length,
  }));
  const maxPipelineCount = Math.max(1, ...pipelineCounts.map((s) => s.count));

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                       */}
      {/* ----------------------------------------------------------------- */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Growth Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            King of Sparklers Operating System
          </p>
        </div>
        <p className="text-sm text-gray-500">{todayString()}</p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* KPI Scorecard                                                     */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <ScorecardIcon />
          KPI Scorecard
        </h2>

        {loadingKpis ? (
          <LoadingGrid cols={3} />
        ) : sortedKpis.length === 0 ? (
          <EmptyState message="No KPIs configured yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedKpis.map((kpi) => {
              const pct = pctOfTarget(kpi.value, kpi.target);
              const tier = tierColor(pct);
              return (
                <div key={kpi.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-gold-400">
                        {KPI_META[kpi.name]?.icon ?? <FallbackIcon />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">
                          {kpi.name}
                        </p>
                        <p className="text-2xl font-bold text-white leading-tight">
                          {formatKpiValue(kpi.value, kpi.unit)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        tier === 'green'
                          ? 'badge-green'
                          : tier === 'gold'
                            ? 'badge-gold'
                            : 'badge-red'
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${fillBg(tier)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Target: {formatKpiValue(kpi.target, kpi.unit)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Quarterly Rocks                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <RockIcon />
          {quarter} {year} Rocks
        </h2>

        {loadingRocks ? (
          <LoadingGrid cols={2} />
        ) : currentRocks.length === 0 ? (
          <EmptyState message={`No rocks found for ${quarter} ${year}.`} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentRocks.map((rock) => (
              <div key={rock.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="card-header mb-0">{rock.title}</h3>
                  <StatusBadge status={rock.status} />
                </div>
                {rock.owner && (
                  <p className="text-sm text-gray-400 mb-3">
                    Owner: <span className="text-gray-300">{rock.owner}</span>
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <div className="progress-bar flex-1">
                    <div
                      className={`progress-fill ${
                        rock.progress >= 80
                          ? 'bg-emerald-500'
                          : rock.progress >= 50
                            ? 'bg-gold-400'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${rock.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-300 w-12 text-right">
                    {rock.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Seasonal Countdown                                                */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CalendarCountdownIcon />
          Seasonal Countdown
        </h2>

        {loadingPeaks ? (
          <LoadingGrid cols={2} />
        ) : peaks.length === 0 ? (
          <EmptyState message="No seasonal peaks configured." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {peaks.map((peak) => {
              // Handle both camelCase (type) and snake_case (raw DB) field names
              const p = peak as unknown as Record<string, unknown>;
              const startField = (peak.peakStart ?? p.peak_start) as string | undefined;
              const endField = (peak.peakEnd ?? p.peak_end) as string | undefined;
              const start = startField ?? '';
              const end = endField ?? '';
              const dStart = daysUntil(start);
              const dEnd = daysUntil(end);

              let countdownLabel: string;
              let isActive = false;
              let isCompleted = false;

              if (dEnd < 0) {
                countdownLabel = 'COMPLETED';
                isCompleted = true;
              } else if (dStart <= 0) {
                countdownLabel = 'IN SEASON';
                isActive = true;
              } else {
                countdownLabel = `${dStart} day${dStart === 1 ? '' : 's'} away`;
              }

              // Border colour based on urgency
              let borderClass = 'border-emerald-500/50';
              if (!isCompleted && !isActive) {
                if (dStart < 30) borderClass = 'border-red-500/70';
                else if (dStart < 60) borderClass = 'border-gold-400/60';
              }
              if (isActive) borderClass = 'border-gold-400';
              if (isCompleted) borderClass = 'border-gray-600';

              // Checklist progress
              const items = (peak.checklistItems ?? p.checklist_items) as { completed: boolean }[] | undefined ?? [];
              const total = Array.isArray(items) ? items.length : 0;
              const done = Array.isArray(items)
                ? items.filter((i: { completed: boolean }) => i.completed).length
                : 0;
              const preloadPct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={peak.id}
                  className={`card border-l-4 ${borderClass}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {peak.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {start && end
                          ? `${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2013 ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : 'Dates TBD'}
                      </p>
                    </div>
                    <span
                      className={
                        isActive
                          ? 'badge-gold'
                          : isCompleted
                            ? 'badge-gray'
                            : dStart < 30
                              ? 'badge-red'
                              : 'badge-green'
                      }
                    >
                      {countdownLabel}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Pre-load Progress</span>
                      <span>
                        {done}/{total} tasks ({preloadPct}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          preloadPct >= 80
                            ? 'bg-emerald-500'
                            : preloadPct >= 50
                              ? 'bg-gold-400'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${preloadPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Pipeline Summary                                                  */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <PipelineIcon />
          Dream 100 Pipeline
        </h2>

        {loadingContacts ? (
          <div className="card animate-pulse h-48" />
        ) : contacts.length === 0 ? (
          <EmptyState message="No Dream 100 contacts yet." />
        ) : (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                {fmt(contacts.length)} total contacts
              </p>
            </div>
            <div className="space-y-3">
              {pipelineCounts.map((stage) => (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-28 shrink-0 text-right">
                    {stage.label}
                  </span>
                  <div className="flex-1 bg-navy-800 rounded-full h-6 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{
                        width: `${Math.max(
                          stage.count > 0 ? 4 : 0,
                          (stage.count / maxPipelineCount) * 100,
                        )}%`,
                      }}
                    />
                    {stage.count > 0 && (
                      <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-white drop-shadow">
                        {stage.count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    on_track: { cls: 'badge-green', label: 'On Track' },
    behind: { cls: 'badge-gold', label: 'Behind' },
    at_risk: { cls: 'badge-red', label: 'At Risk' },
    completed: { cls: 'badge-green', label: 'Completed' },
  };
  const m = map[status] ?? { cls: 'badge-gray', label: status };
  return <span className={m.cls}>{m.label}</span>;
}

function LoadingGrid({ cols }: { cols: number }) {
  return (
    <div
      className={`grid gap-4 ${
        cols === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 lg:grid-cols-2'
      }`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-navy-700 rounded w-2/3 mb-3" />
          <div className="h-8 bg-navy-700 rounded w-1/3 mb-4" />
          <div className="progress-bar">
            <div className="progress-fill bg-navy-600 w-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex items-center justify-center py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Icon Components
// ---------------------------------------------------------------------------

function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.433 1.401-4.83" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function FallbackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
    </svg>
  );
}

function ScorecardIcon() {
  return (
    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function RockIcon() {
  return (
    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

function CalendarCountdownIcon() {
  return (
    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );
}
