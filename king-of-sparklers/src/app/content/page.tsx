'use client';

import { useState, useEffect } from 'react';

interface ContentItem {
  id: string;
  title: string;
  pillar: string;
  platform: string;
  audience: string;
  status: string;
  scheduledDate: string;
  brief: string;
  createdAt: string;
}

const PILLARS = [
  { key: 'safety', label: 'Safety', color: 'bg-red-500', textColor: 'text-red-400', description: 'Authority building — position as safety leader' },
  { key: 'inspiration', label: 'Inspiration', color: 'bg-purple-500', textColor: 'text-purple-400', description: 'Viral content — TikTok/IG sparkler moments' },
  { key: 'education', label: 'Education', color: 'bg-blue-500', textColor: 'text-blue-400', description: 'Mid-funnel — help customers choose right products' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'Blog', 'Email', 'YouTube', 'LinkedIn', 'Pinterest'];
const AUDIENCES = ['B2B Nightclubs', 'B2B Hotels', 'B2B Wedding Planners', 'B2C Brides', 'B2C Party Hosts', 'General'];
const STATUSES = ['idea', 'drafted', 'scheduled', 'published'];

const IDEA_TEMPLATES: Record<string, string[]> = {
  safety: [
    'Post-Crans-Montana: What Every Venue Needs to Know About Indoor Sparkler Safety',
    '5 Sparkler Safety Mistakes That Could Cost Your Liquor License',
    'Indoor vs Outdoor Sparkler Protocols — A Complete Guide',
    'Why Safety Clips Are Non-Negotiable for Bottle Service',
    'Cold Spark Machines: The Zero-Risk Alternative Explained',
    'How to Train Your Staff on Sparkler Handling in 15 Minutes',
    'Sparkler Disposal Best Practices — Don\'t Skip This Step',
    'Insurance & Sparklers: What Your Venue Policy Actually Covers',
  ],
  inspiration: [
    'Epic NYE Countdown with VIP Bottle Sparklers [Video]',
    'Wedding Sparkler Exit — Slow Motion Magic [Reel]',
    'Before & After: How Sparklers Transform Bottle Service',
    'Top 10 Sparkler Moments of the Month [User Generated]',
    'Cold Spark Machine at Rooftop Bar — Cinematic Edit',
    'Bride\'s Reaction to 36-Inch Sparkler Exit [Emotional]',
    'Behind the Scenes: How We Pack 2,880 Sparklers for Shipping',
    'LED vs Traditional Sparklers — Side by Side Comparison',
  ],
  education: [
    'Sparkler Size Guide: 10" vs 20" vs 36" — Which Is Right for You?',
    'How Many Sparklers Do I Need? Calculator for Every Event Size',
    'Wedding Sparkler Exit Planning: Complete Step-by-Step Guide',
    'VIP Bottle Sparkler Setup Guide for Nightclub Managers',
    'Cake Sparklers: Food-Safe Certification & How to Use Them',
    'Bulk Ordering 101: How Wholesale Pricing Works',
    'Photography Tips: How to Capture Perfect Sparkler Photos',
    'Seasonal Buying Guide: When to Order for Best Pricing',
  ],
};

export default function ContentCalendarPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'board' | 'ideas'>('board');
  const [filterPillar, setFilterPillar] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [form, setForm] = useState({
    title: '', pillar: 'safety', platform: 'Instagram', audience: 'General',
    status: 'idea', scheduledDate: '', brief: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to fetch content:', e);
    } finally {
      setLoading(false);
    }
  }

  async function saveItem() {
    try {
      if (editItem) {
        const res = await fetch(`/api/content/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setEditItem(null);
          fetchItems();
        }
      } else {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setShowAddModal(false);
          fetchItems();
        }
      }
      setForm({ title: '', pillar: 'safety', platform: 'Instagram', audience: 'General', status: 'idea', scheduledDate: '', brief: '' });
    } catch (e) {
      console.error('Failed to save content:', e);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this content item?')) return;
    try {
      await fetch(`/api/content/${id}`, { method: 'DELETE' });
      setEditItem(null);
      fetchItems();
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchItems();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  }

  function generateBrief(pillar: string, title: string, platform: string, audience: string): string {
    return `CONTENT BRIEF
=============
Title: ${title}
Pillar: ${pillar.charAt(0).toUpperCase() + pillar.slice(1)}
Platform: ${platform}
Target Audience: ${audience}

OBJECTIVE:
${pillar === 'safety' ? 'Position King of Sparklers as the #1 safety authority in event sparklers. Build trust with venue operators and event planners.' : ''}${pillar === 'inspiration' ? 'Create viral, shareable content that showcases the magic of sparkler moments. Drive brand awareness and engagement.' : ''}${pillar === 'education' ? 'Help potential customers make informed purchasing decisions. Reduce pre-sale questions and increase conversion rate.' : ''}

KEY MESSAGES:
- King of Sparklers: The Gold Standard in Event Sparklers since 2008
- Premium, event-grade quality with safety-first approach
- Same-day shipping, 14-day money-back guarantee

CALL TO ACTION:
- Primary: Shop at kingofsparklers.com
- Secondary: Download Free Safety Guide

BRAND VOICE:
Professional, authoritative, but approachable. Expert without being condescending.

VISUAL DIRECTION:
- Brand colors: Navy (#1B2A4A) and Gold (#E8913A)
- High-quality product photography or event footage
- Clean, premium aesthetic

HASHTAGS:
#KingOfSparklers #EventSparklers #VIPBottleService #WeddingSparklers #SparklerExit #ColdSparkMachine #EventSafety #NightlifeEvents`;
  }

  function addIdeaToCalendar(title: string, pillar: string) {
    setForm({ ...form, title, pillar, status: 'idea' });
    setShowAddModal(true);
  }

  const filtered = items.filter((i) => {
    if (filterPillar !== 'all' && i.pillar !== filterPillar) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    idea: 'badge-gray',
    drafted: 'badge-blue',
    scheduled: 'badge-gold',
    published: 'badge-green',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading content calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Calendar & Ideas</h1>
          <p className="text-gray-400 mt-1">Three pillars: Safety, Inspiration, Education</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ New Content</button>
        </div>
      </div>

      {/* Pillar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PILLARS.map((pillar) => {
          const count = items.filter((i) => i.pillar === pillar.key).length;
          const published = items.filter((i) => i.pillar === pillar.key && i.status === 'published').length;
          return (
            <div key={pillar.key} className="card !p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${pillar.color}`} />
                <h3 className="font-semibold text-white">{pillar.label}</h3>
                <span className="text-xs text-gray-500 ml-auto">{count} items</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{pillar.description}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-400">{items.filter((i) => i.pillar === pillar.key && i.status === 'idea').length} ideas</span>
                <span className="text-blue-400">{items.filter((i) => i.pillar === pillar.key && i.status === 'drafted').length} drafted</span>
                <span className="text-gold-400">{items.filter((i) => i.pillar === pillar.key && i.status === 'scheduled').length} scheduled</span>
                <span className="text-emerald-400">{published} published</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Toggles & Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-navy-800 rounded-lg p-1">
          {(['board', 'calendar', 'ideas'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-gold-400 text-navy-950' : 'text-gray-400 hover:text-white'}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <select className="select-field !w-auto" value={filterPillar} onChange={(e) => setFilterPillar(e.target.value)}>
          <option value="all">All Pillars</option>
          {PILLARS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select className="select-field !w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUSES.map((status) => {
            const statusItems = filtered.filter((i) => i.status === status);
            return (
              <div key={status} className="card !p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white capitalize">{status}</h3>
                  <span className="text-xs text-gray-500">{statusItems.length}</span>
                </div>
                <div className="space-y-2">
                  {statusItems.map((item) => {
                    const pillar = PILLARS.find((p) => p.key === item.pillar);
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setEditItem(item); setForm({ title: item.title, pillar: item.pillar, platform: item.platform, audience: item.audience, status: item.status, scheduledDate: item.scheduledDate || '', brief: item.brief || '' }); }}
                        className="w-full text-left bg-navy-800 rounded-lg p-3 hover:bg-navy-700 transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pillar?.color || 'bg-gray-500'}`} />
                          <p className="text-sm text-gray-200 leading-tight">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.platform}</span>
                          {item.scheduledDate && <span>• {new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </div>
                        {/* Status advance buttons */}
                        <div className="flex gap-1 mt-2">
                          {status !== 'published' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIdx = STATUSES.indexOf(status) + 1;
                                if (nextIdx < STATUSES.length) updateStatus(item.id, STATUSES[nextIdx]);
                              }}
                              className="text-xs text-gold-400 hover:text-gold-300"
                            >
                              → {STATUSES[STATUSES.indexOf(status) + 1]}
                            </button>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {statusItems.length === 0 && (
                    <p className="text-xs text-gray-600 text-center py-4">No items</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          <h2 className="card-header">Scheduled Content</h2>
          <div className="space-y-2">
            {filtered
              .filter((i) => i.scheduledDate)
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .map((item) => {
                const pillar = PILLARS.find((p) => p.key === item.pillar);
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-navy-800 rounded-lg">
                    <div className="w-16 text-center">
                      <p className="text-lg font-bold text-white">
                        {new Date(item.scheduledDate).getDate()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div className={`w-1 h-12 rounded-full ${pillar?.color || 'bg-gray-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500">{item.platform}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className={`text-xs ${pillar?.textColor || 'text-gray-500'}`}>{pillar?.label}</span>
                      </div>
                    </div>
                    <span className={statusColors[item.status] || 'badge-gray'}>{item.status}</span>
                  </div>
                );
              })}
            {filtered.filter((i) => i.scheduledDate).length === 0 && (
              <p className="text-center text-gray-500 py-8">No scheduled content. Add dates to your content items.</p>
            )}
          </div>
        </div>
      )}

      {/* Ideas Generator View */}
      {view === 'ideas' && (
        <div className="space-y-6">
          {PILLARS.map((pillar) => (
            <div key={pillar.key} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${pillar.color}`} />
                <h2 className="card-header mb-0">{pillar.label} Content Ideas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {IDEA_TEMPLATES[pillar.key]?.map((idea, i) => {
                  const alreadyAdded = items.some((item) => item.title === idea);
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${alreadyAdded ? 'bg-navy-800/50' : 'bg-navy-800'}`}>
                      <span className={`text-sm mt-0.5 ${pillar.textColor}`}>{i + 1}.</span>
                      <p className={`text-sm flex-1 ${alreadyAdded ? 'text-gray-500' : 'text-gray-300'}`}>{idea}</p>
                      {alreadyAdded ? (
                        <span className="badge-green text-xs">Added</span>
                      ) : (
                        <button
                          onClick={() => addIdeaToCalendar(idea, pillar.key)}
                          className="text-xs text-gold-400 hover:text-gold-300 whitespace-nowrap"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editItem) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAddModal(false); setEditItem(null); }}>
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{editItem ? 'Edit Content' : 'New Content Item'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Pillar</label>
                  <select className="select-field" value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })}>
                    {PILLARS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Platform</label>
                  <select className="select-field" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Audience</label>
                  <select className="select-field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                    {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Status</label>
                  <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Scheduled Date</label>
                <input className="input-field" type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Brief / Notes</label>
                <textarea className="textarea-field" rows={4} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} />
                {form.title && (
                  <button
                    onClick={() => setForm({ ...form, brief: generateBrief(form.pillar, form.title, form.platform, form.audience) })}
                    className="text-xs text-gold-400 hover:text-gold-300 mt-2"
                  >
                    Auto-generate brief
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveItem} className="btn-primary">{editItem ? 'Update' : 'Create'}</button>
              {editItem && <button onClick={() => deleteItem(editItem.id)} className="btn-danger">Delete</button>}
              <button onClick={() => { setShowAddModal(false); setEditItem(null); }} className="btn-secondary ml-auto">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
