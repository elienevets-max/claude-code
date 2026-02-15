'use client';

import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  completed: boolean;
  dueDate: string;
}

interface SeasonalPeak {
  id: string;
  name: string;
  peakStart: string;
  peakEnd: string;
  preloadWeeks: number;
  checklistItems: ChecklistItem[];
}

export default function SeasonalPlannerPage() {
  const [peaks, setPeaks] = useState<SeasonalPeak[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeak, setSelectedPeak] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchPeaks();
  }, []);

  async function fetchPeaks() {
    try {
      const res = await fetch('/api/seasonal');
      if (res.ok) {
        const data = await res.json();
        setPeaks(data);
        if (data.length > 0) setSelectedPeak(data[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch seasonal peaks:', e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleChecklistItem(peakId: string, itemId: string) {
    const peak = peaks.find((p) => p.id === peakId);
    if (!peak) return;
    const updated = peak.checklistItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    try {
      const res = await fetch(`/api/seasonal/${peakId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItems: updated }),
      });
      if (res.ok) {
        setPeaks(peaks.map((p) => (p.id === peakId ? { ...p, checklistItems: updated } : p)));
      }
    } catch (e) {
      console.error('Failed to update checklist:', e);
    }
  }

  function getSeasonStatus(peak: SeasonalPeak) {
    const now = new Date();
    const start = new Date(peak.peakStart);
    const end = new Date(peak.peakEnd);
    const preloadStart = new Date(start);
    preloadStart.setDate(preloadStart.getDate() - peak.preloadWeeks * 7);

    if (now > end) return { label: 'COMPLETED', color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-700' };
    if (now >= start && now <= end) return { label: 'IN SEASON', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };

    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 30) return { label: `${daysUntil} DAYS`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    if (daysUntil <= 60) return { label: `${daysUntil} DAYS`, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/30' };
    return { label: `${daysUntil} DAYS`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
  }

  function getCompletionPct(items: ChecklistItem[]) {
    if (items.length === 0) return 0;
    return Math.round((items.filter((i) => i.completed).length / items.length) * 100);
  }

  function getPreloadReminders(peak: SeasonalPeak) {
    const start = new Date(peak.peakStart);
    const now = new Date();
    const reminders = [12, 8, 4].map((weeks) => {
      const d = new Date(start);
      d.setDate(d.getDate() - weeks * 7);
      const isPast = now > d;
      return { weeks, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isPast };
    });
    return reminders;
  }

  const activePeak = peaks.find((p) => p.id === selectedPeak);
  const categories = activePeak
    ? ['all', ...new Set(activePeak.checklistItems.map((i) => i.category))]
    : ['all'];
  const filteredItems = activePeak
    ? activePeak.checklistItems.filter((i) => filterCategory === 'all' || i.category === filterCategory)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading seasonal planner...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Seasonal Clockwork Planner</h1>
        <p className="text-gray-400 mt-1">Pre-load checklists and countdown timers for every peak season</p>
      </div>

      {/* Season Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {peaks.map((peak) => {
          const status = getSeasonStatus(peak);
          const pct = getCompletionPct(peak.checklistItems);
          return (
            <button
              key={peak.id}
              onClick={() => { setSelectedPeak(peak.id); setFilterCategory('all'); }}
              className={`text-left p-5 rounded-xl border transition-all ${
                selectedPeak === peak.id
                  ? 'bg-navy-800 border-gold-400 ring-1 ring-gold-400'
                  : `bg-navy-900 ${status.bg} hover:bg-navy-800`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{peak.name}</h3>
                <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(peak.peakStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                {new Date(peak.peakEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-gold-400' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {peak.checklistItems.filter((i) => i.completed).length}/{peak.checklistItems.length} tasks — {pct}%
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Season Detail */}
      {activePeak && (
        <>
          {/* Pre-load Reminders */}
          <div className="card">
            <h2 className="card-header">Pre-Load Reminders — {activePeak.name}</h2>
            <div className="flex gap-6">
              {getPreloadReminders(activePeak).map((r) => (
                <div key={r.weeks} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${r.isPast ? 'bg-emerald-500' : 'bg-navy-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${r.isPast ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {r.weeks} weeks before
                    </p>
                    <p className="text-xs text-gray-500">{r.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="card-header mb-0">Pre-Load Checklist</h2>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterCategory === cat
                        ? 'bg-gold-400 text-navy-950'
                        : 'bg-navy-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    item.completed ? 'bg-navy-800/50' : 'bg-navy-800'
                  }`}
                >
                  <button
                    onClick={() => toggleChecklistItem(activePeak.id, item.id)}
                    className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-navy-500 hover:border-gold-400'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {item.task}
                    </p>
                  </div>
                  <span className="badge-gray text-xs">{item.category}</span>
                  {item.dueDate && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
