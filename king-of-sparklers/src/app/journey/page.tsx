'use client';

import { useState, useEffect } from 'react';

interface JourneyCustomer {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  notes: string;
  lastAction: string;
  createdAt: string;
}

const STAGES = [
  { key: 'aware', label: 'Aware', color: 'bg-blue-500', description: 'Knows the brand exists' },
  { key: 'engage', label: 'Engage', color: 'bg-indigo-500', description: 'Interacting with content' },
  { key: 'subscribe', label: 'Subscribe', color: 'bg-purple-500', description: 'Joined email list' },
  { key: 'convert', label: 'Convert', color: 'bg-gold-400', description: 'Made first purchase' },
  { key: 'excite', label: 'Excite', color: 'bg-orange-500', description: 'Had great experience' },
  { key: 'ascend', label: 'Ascend', color: 'bg-emerald-500', description: 'Repeat/upsell customer' },
  { key: 'advocate', label: 'Advocate', color: 'bg-teal-500', description: 'Refers others' },
  { key: 'promote', label: 'Promote', color: 'bg-pink-500', description: 'Active promoter' },
];

const STAGE_ACTIONS: Record<string, string[]> = {
  aware: ['Run targeted social ads', 'SEO content for sparkler keywords', 'Trade show presence', 'PR outreach to event publications'],
  engage: ['Retarget with educational content', 'Show product videos on social', 'Invite to live demo/webinar', 'Share customer success stories'],
  subscribe: ['Send welcome email sequence', 'Deliver lead magnet (Safety Guide)', 'Segment by B2B vs B2C', 'Start nurture sequence'],
  convert: ['Send order confirmation with tips', 'Include thank-you card in shipment', 'Request product review after delivery', 'Offer complementary product upsell'],
  excite: ['Share user-generated content request', 'Send exclusive early access to new products', 'Invite to Safety Certification Program', 'Provide VIP customer support line'],
  ascend: ['Offer wholesale/bulk pricing tier', 'Create custom bundle packages', 'Quarterly check-in call for B2B', 'Loyalty rewards program enrollment'],
  advocate: ['Launch referral program (give $10, get $10)', 'Feature in customer spotlight', 'Invite to advisory board', 'Co-create content together'],
  promote: ['Affiliate program enrollment', 'Commission on referral sales', 'Speaking/event partnership opportunities', 'Brand ambassador program'],
};

export default function JourneyPage() {
  const [customers, setCustomers] = useState<JourneyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<JourneyCustomer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', stage: 'aware', notes: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/journey');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error('Failed to fetch journey customers:', e);
    } finally {
      setLoading(false);
    }
  }

  async function addCustomer() {
    try {
      const res = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({ name: '', email: '', company: '', stage: 'aware', notes: '' });
        fetchCustomers();
      }
    } catch (e) {
      console.error('Failed to add customer:', e);
    }
  }

  async function moveCustomer(id: string, newStage: string) {
    try {
      const res = await fetch(`/api/journey/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, lastAction: `Moved to ${newStage}` }),
      });
      if (res.ok) {
        fetchCustomers();
        if (selectedCustomer?.id === id) {
          setSelectedCustomer({ ...selectedCustomer, stage: newStage });
        }
      }
    } catch (e) {
      console.error('Failed to move customer:', e);
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm('Remove this customer from the journey tracker?')) return;
    try {
      await fetch(`/api/journey/${id}`, { method: 'DELETE' });
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (e) {
      console.error('Failed to delete customer:', e);
    }
  }

  function getStageCustomers(stage: string) {
    return customers.filter((c) => c.stage === stage);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading customer journey...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Value Journey</h1>
          <p className="text-gray-400 mt-1">Track customers through 8 stages from awareness to promotion</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add Customer</button>
      </div>

      {/* Funnel Overview */}
      <div className="card">
        <h2 className="card-header">Journey Funnel</h2>
        <div className="space-y-3">
          {STAGES.map((stage) => {
            const count = getStageCustomers(stage.key).length;
            const maxCount = Math.max(...STAGES.map((s) => getStageCustomers(s.key).length), 1);
            const widthPct = Math.max((count / maxCount) * 100, 8);
            return (
              <div key={stage.key} className="flex items-center gap-4">
                <div className="w-24 text-right">
                  <span className="text-sm font-medium text-gray-300">{stage.label}</span>
                </div>
                <div className="flex-1">
                  <div
                    className={`${stage.color} rounded-lg px-3 py-2 flex items-center justify-between transition-all`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="text-white text-sm font-bold">{count}</span>
                  </div>
                </div>
                <div className="w-48 text-xs text-gray-500 hidden lg:block">{stage.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Cards with Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageCustomers = getStageCustomers(stage.key);
          const stageIdx = STAGES.findIndex((s) => s.key === stage.key);
          return (
            <div key={stage.key} className="card !p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                <span className="text-xs text-gray-500 ml-auto">{stageCustomers.length}</span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {stageCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="w-full text-left bg-navy-800 rounded-lg p-3 hover:bg-navy-700 transition-colors"
                  >
                    <p className="text-sm text-white font-medium truncate">{customer.name}</p>
                    {customer.company && (
                      <p className="text-xs text-gray-500 truncate">{customer.company}</p>
                    )}
                    <div className="flex gap-1 mt-2">
                      {stageIdx > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCustomer(customer.id, STAGES[stageIdx - 1].key); }}
                          className="text-xs text-gray-500 hover:text-gold-400 px-1"
                          title={`Move to ${STAGES[stageIdx - 1].label}`}
                        >
                          ←
                        </button>
                      )}
                      {stageIdx < STAGES.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCustomer(customer.id, STAGES[stageIdx + 1].key); }}
                          className="text-xs text-gray-500 hover:text-gold-400 px-1 ml-auto"
                          title={`Move to ${STAGES[stageIdx + 1].label}`}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </button>
                ))}
                {stageCustomers.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">No customers</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Actions */}
      <div className="card">
        <h2 className="card-header">Suggested Actions by Stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.key} className="bg-navy-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
              </div>
              <ul className="space-y-2">
                {(STAGE_ACTIONS[stage.key] || []).map((action, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Add Customer to Journey</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Company</label>
                <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Starting Stage</label>
                <select className="select-field" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Notes</label>
                <textarea className="textarea-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addCustomer} className="btn-primary">Add Customer</button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {selectedCustomer.email && <p className="text-gray-400">Email: <span className="text-gray-200">{selectedCustomer.email}</span></p>}
              {selectedCustomer.company && <p className="text-gray-400">Company: <span className="text-gray-200">{selectedCustomer.company}</span></p>}
              <p className="text-gray-400">Current Stage: <span className="text-gold-400 font-semibold">{STAGES.find((s) => s.key === selectedCustomer.stage)?.label}</span></p>
              {selectedCustomer.notes && <p className="text-gray-400">Notes: <span className="text-gray-200">{selectedCustomer.notes}</span></p>}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Move to Stage</h3>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage) => (
                  <button
                    key={stage.key}
                    onClick={() => moveCustomer(selectedCustomer.id, stage.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCustomer.stage === stage.key
                        ? 'bg-gold-400 text-navy-950'
                        : 'bg-navy-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Suggested Next Actions</h3>
              <ul className="space-y-2">
                {(STAGE_ACTIONS[selectedCustomer.stage] || []).map((action, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-navy-700">
              <button onClick={() => deleteCustomer(selectedCustomer.id)} className="btn-danger text-sm">Remove</button>
              <button onClick={() => setSelectedCustomer(null)} className="btn-secondary text-sm ml-auto">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
