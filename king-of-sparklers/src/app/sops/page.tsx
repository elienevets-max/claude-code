'use client';

import { useState, useEffect } from 'react';

interface SOPStep {
  id: string;
  instruction: string;
  videoUrl?: string;
  completed: boolean;
}

interface SOP {
  id: string;
  title: string;
  category: string;
  steps: SOPStep[];
  version: string;
  lastUpdated: string;
}

const CATEGORIES = [
  { key: 'fulfillment', label: 'Order Fulfillment', icon: '📦' },
  { key: 'customer_service', label: 'Customer Service', icon: '🎧' },
  { key: 'b2b_outreach', label: 'B2B Outreach', icon: '🤝' },
  { key: 'inventory', label: 'Inventory', icon: '📊' },
  { key: 'social_media', label: 'Social Media', icon: '📱' },
  { key: 'general', label: 'General', icon: '📋' },
];

export default function SOPManagerPage() {
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'general', steps: [{ id: '1', instruction: '', videoUrl: '', completed: false }] as SOPStep[], version: '1.0',
  });

  useEffect(() => {
    fetchSOPs();
  }, []);

  async function fetchSOPs() {
    try {
      const res = await fetch('/api/sops');
      if (res.ok) {
        const data = await res.json();
        setSOPs(data);
      }
    } catch (e) {
      console.error('Failed to fetch SOPs:', e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSOP() {
    const payload = {
      title: form.title,
      category: form.category,
      steps: form.steps.filter((s) => s.instruction.trim()),
      version: form.version,
    };
    try {
      if (editMode && selectedSOP) {
        const res = await fetch(`/api/sops/${selectedSOP.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedSOP(data);
          setEditMode(false);
          fetchSOPs();
        }
      } else {
        const res = await fetch('/api/sops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowAddModal(false);
          resetForm();
          fetchSOPs();
        }
      }
    } catch (e) {
      console.error('Failed to save SOP:', e);
    }
  }

  async function deleteSOP(id: string) {
    if (!confirm('Delete this SOP?')) return;
    try {
      await fetch(`/api/sops/${id}`, { method: 'DELETE' });
      setSelectedSOP(null);
      fetchSOPs();
    } catch (e) {
      console.error('Failed to delete SOP:', e);
    }
  }

  async function toggleStep(sopId: string, stepId: string) {
    const sop = sops.find((s) => s.id === sopId) || selectedSOP;
    if (!sop) return;
    const updatedSteps = sop.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    try {
      const res = await fetch(`/api/sops/${sopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: updatedSteps }),
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedSOP?.id === sopId) setSelectedSOP(data);
        fetchSOPs();
      }
    } catch (e) {
      console.error('Failed to toggle step:', e);
    }
  }

  function resetForm() {
    setForm({ title: '', category: 'general', steps: [{ id: '1', instruction: '', videoUrl: '', completed: false }], version: '1.0' });
  }

  function addStep() {
    setForm({
      ...form,
      steps: [...form.steps, { id: String(form.steps.length + 1), instruction: '', videoUrl: '', completed: false }],
    });
  }

  function removeStep(idx: number) {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  }

  function updateStep(idx: number, field: string, value: string) {
    const updated = form.steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setForm({ ...form, steps: updated });
  }

  function startEdit(sop: SOP) {
    setForm({ title: sop.title, category: sop.category, steps: [...sop.steps], version: sop.version });
    setEditMode(true);
  }

  const filtered = sops.filter((s) => filterCategory === 'all' || s.category === filterCategory);

  function getCompletionPct(steps: SOPStep[]) {
    if (steps.length === 0) return 0;
    return Math.round((steps.filter((s) => s.completed).length / steps.length) * 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading SOPs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SOP Manager</h1>
          <p className="text-gray-400 mt-1">Standard Operating Procedures — systemize everything</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn-primary">+ New SOP</button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-gray-400 hover:text-white'}`}
        >
          All ({sops.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = sops.filter((s) => s.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCategory === cat.key ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-gray-400 hover:text-white'}`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Two-Column Layout: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOP List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.map((sop) => {
            const cat = CATEGORIES.find((c) => c.key === sop.category);
            const pct = getCompletionPct(sop.steps);
            return (
              <button
                key={sop.id}
                onClick={() => { setSelectedSOP(sop); setEditMode(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedSOP?.id === sop.id ? 'bg-navy-800 border-gold-400 ring-1 ring-gold-400' : 'bg-navy-900 border-navy-700 hover:bg-navy-800'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{cat?.icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{sop.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{cat?.label} • v{sop.version}</p>
                    <div className="progress-bar mt-2">
                      <div
                        className={`progress-fill ${pct === 100 ? 'bg-emerald-500' : 'bg-gold-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {sop.steps.filter((s) => s.completed).length}/{sop.steps.length} steps completed
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No SOPs in this category</p>
            </div>
          )}
        </div>

        {/* SOP Detail */}
        <div className="lg:col-span-2">
          {selectedSOP && !editMode ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedSOP.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {CATEGORIES.find((c) => c.key === selectedSOP.category)?.label} • Version {selectedSOP.version} • Updated {new Date(selectedSOP.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(selectedSOP)} className="btn-secondary text-sm">Edit</button>
                  <button onClick={() => deleteSOP(selectedSOP.id)} className="btn-danger text-sm">Delete</button>
                </div>
              </div>

              <div className="space-y-3">
                {selectedSOP.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${step.completed ? 'bg-navy-800/50' : 'bg-navy-800'}`}
                  >
                    <button
                      onClick={() => toggleStep(selectedSOP.id, step.id)}
                      className={`w-7 h-7 rounded-lg border-2 flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors mt-0.5 ${step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-navy-500 text-gray-500 hover:border-gold-400'}`}
                    >
                      {step.completed ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {step.instruction}
                      </p>
                      {step.videoUrl && (
                        <a
                          href={step.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 mt-2"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                          </svg>
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-navy-700">
                <div className="flex items-center gap-4">
                  <div className="progress-bar flex-1">
                    <div
                      className={`progress-fill ${getCompletionPct(selectedSOP.steps) === 100 ? 'bg-emerald-500' : 'bg-gold-400'}`}
                      style={{ width: `${getCompletionPct(selectedSOP.steps)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{getCompletionPct(selectedSOP.steps)}% complete</span>
                </div>
              </div>
            </div>
          ) : editMode && selectedSOP ? (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Edit SOP</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Title</label>
                    <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Category</label>
                      <select className="select-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Version</label>
                      <input className="input-field" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Steps</label>
                  <div className="space-y-3">
                    {form.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-navy-800 p-3 rounded-lg">
                        <span className="text-sm font-bold text-gray-500 mt-2.5 w-6 text-center">{idx + 1}</span>
                        <div className="flex-1 space-y-2">
                          <input
                            className="input-field"
                            placeholder="Step instruction..."
                            value={step.instruction}
                            onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
                          />
                          <input
                            className="input-field text-xs"
                            placeholder="Video URL (optional, e.g. Loom link)"
                            value={step.videoUrl || ''}
                            onChange={(e) => updateStep(idx, 'videoUrl', e.target.value)}
                          />
                        </div>
                        {form.steps.length > 1 && (
                          <button onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-400 mt-2.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addStep} className="text-sm text-gold-400 hover:text-gold-300 mt-3">
                    + Add Step
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-navy-700">
                <button onClick={saveSOP} className="btn-primary">Save Changes</button>
                <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-navy-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p>Select an SOP to view its steps</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add SOP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">New SOP</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Order Fulfillment Process" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category</label>
                  <select className="select-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Version</label>
                  <input className="input-field" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Steps</label>
                <div className="space-y-3">
                  {form.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-sm font-bold text-gray-500 mt-2.5 w-6 text-center">{idx + 1}</span>
                      <div className="flex-1 space-y-2">
                        <input className="input-field" placeholder="Step instruction..." value={step.instruction} onChange={(e) => updateStep(idx, 'instruction', e.target.value)} />
                        <input className="input-field text-xs" placeholder="Video URL (optional)" value={step.videoUrl || ''} onChange={(e) => updateStep(idx, 'videoUrl', e.target.value)} />
                      </div>
                      {form.steps.length > 1 && (
                        <button onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-400 mt-2.5 text-sm">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addStep} className="text-sm text-gold-400 hover:text-gold-300 mt-3">+ Add Step</button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveSOP} className="btn-primary">Create SOP</button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
