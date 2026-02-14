'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Certification {
  id: string;
  venueName: string;
  venueAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'audit' | 'certified' | 'expired';
  certificationNumber: string;
  certifiedDate: string | null;
  expiryDate: string | null;
  checklistItems: ChecklistItem[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'fire-ext', label: 'Fire extinguisher within 15 feet of sparkler usage area', checked: false },
  { id: 'staff-train', label: 'Staff trained on sparkler lighting procedures', checked: false },
  { id: 'ceiling', label: 'Non-flammable ceiling materials verified', checked: false },
  { id: 'clips', label: 'Sparkler safety clips available for all bottle service', checked: false },
  { id: 'exits', label: 'Emergency exit routes clearly marked and unobstructed', checked: false },
  { id: 'disposal', label: 'Sparkler disposal station set up', checked: false },
  { id: 'insurance', label: 'Venue insurance covers pyrotechnic displays', checked: false },
  { id: 'occupancy', label: 'Maximum occupancy limits posted and enforced', checked: false },
  { id: 'ventilation', label: 'Ventilation adequate for indoor sparkler use', checked: false },
  { id: 'protocol', label: 'Written sparkler handling protocol on file', checked: false },
];

const STATUS_CONFIG: Record<
  Certification['status'],
  { label: string; badge: string; dotColor: string }
> = {
  pending: { label: 'Pending', badge: 'badge-gold', dotColor: 'bg-gold-400' },
  audit: { label: 'In Audit', badge: 'badge-blue', dotColor: 'bg-blue-400' },
  certified: { label: 'Certified', badge: 'badge-green', dotColor: 'bg-emerald-400' },
  expired: { label: 'Expired', badge: 'badge-red', dotColor: 'bg-red-400' },
};

const FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'audit', label: 'In Audit' },
  { key: 'certified', label: 'Certified' },
  { key: 'expired', label: 'Expired' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCertification(raw: Record<string, unknown>): Certification {
  let checklist: ChecklistItem[] = [];
  if (typeof raw.checklistItems === 'string') {
    try {
      checklist = JSON.parse(raw.checklistItems as string);
    } catch {
      checklist = [...DEFAULT_CHECKLIST];
    }
  } else if (Array.isArray(raw.checklistItems)) {
    checklist = raw.checklistItems as ChecklistItem[];
  } else {
    checklist = [...DEFAULT_CHECKLIST];
  }

  return {
    id: raw.id as string,
    venueName: (raw.venueName as string) || '',
    venueAddress: (raw.venueAddress as string) || '',
    contactName: (raw.contactName as string) || '',
    contactEmail: (raw.contactEmail as string) || '',
    contactPhone: (raw.contactPhone as string) || '',
    status: (raw.status as Certification['status']) || 'pending',
    certificationNumber: (raw.certificationNumber as string) || '',
    certifiedDate: (raw.certifiedDate as string) || null,
    expiryDate: (raw.expiryDate as string) || null,
    checklistItems: checklist,
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SafetyPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // New application form
  const [form, setForm] = useState({
    venueName: '',
    venueAddress: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // ---------- Data fetching ----------

  const fetchCertifications = useCallback(async () => {
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/safety${query}`);
      if (res.ok) {
        const data: Record<string, unknown>[] = await res.json();
        setCertifications(data.map(parseCertification));
      }
    } catch (e) {
      console.error('Failed to fetch certifications:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchCertifications();
  }, [fetchCertifications]);

  // ---------- Actions ----------

  async function createApplication() {
    if (!form.venueName.trim() || !form.contactName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'pending',
          checklistItems: JSON.stringify(DEFAULT_CHECKLIST),
        }),
      });
      if (res.ok) {
        setShowNewModal(false);
        setForm({ venueName: '', venueAddress: '', contactName: '', contactEmail: '', contactPhone: '' });
        fetchCertifications();
      }
    } catch (e) {
      console.error('Failed to create application:', e);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCertification(
    id: string,
    updates: Partial<Omit<Certification, 'id' | 'createdAt'>>,
  ) {
    try {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.checklistItems) {
        payload.checklistItems = JSON.stringify(updates.checklistItems);
      }
      const res = await fetch(`/api/safety/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const raw: Record<string, unknown> = await res.json();
        const updated = parseCertification(raw);
        setCertifications((prev) => prev.map((c) => (c.id === id ? updated : c)));
        if (selectedCert?.id === id) setSelectedCert(updated);
      }
    } catch (e) {
      console.error('Failed to update certification:', e);
    }
  }

  function toggleChecklistItem(itemId: string) {
    if (!selectedCert) return;
    const updated = selectedCert.checklistItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    );
    const next = { ...selectedCert, checklistItems: updated };
    setSelectedCert(next);
    updateCertification(selectedCert.id, { checklistItems: updated });
  }

  function changeStatus(newStatus: Certification['status']) {
    if (!selectedCert) return;
    const updates: Partial<Certification> = { status: newStatus };
    if (newStatus === 'certified') {
      const now = new Date();
      updates.certifiedDate = now.toISOString();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      updates.expiryDate = expiry.toISOString();
    }
    updateCertification(selectedCert.id, updates);
  }

  function copyCertificateText() {
    if (!selectedCert) return;
    const text = [
      '======================================',
      '  CERTIFIED SAFE SPARKLER VENUE',
      '  King of Sparklers',
      '======================================',
      '',
      `  Venue: ${selectedCert.venueName}`,
      `  Address: ${selectedCert.venueAddress}`,
      `  Certification #: ${selectedCert.certificationNumber}`,
      `  Certified: ${formatDate(selectedCert.certifiedDate)}`,
      `  Expires: ${formatDate(selectedCert.expiryDate)}`,
      '',
      '  This venue has met all safety standards',
      '  required by King of Sparklers for the safe',
      '  handling and display of sparkler products.',
      '',
      '======================================',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  // ---------- Computed ----------

  const stats = {
    total: certifications.length,
    pending: certifications.filter((c) => c.status === 'pending').length,
    certified: certifications.filter((c) => c.status === 'certified').length,
    expired: certifications.filter((c) => c.status === 'expired').length,
  };

  const checklistProgress = selectedCert
    ? selectedCert.checklistItems.filter((i) => i.checked).length
    : 0;
  const checklistTotal = selectedCert ? selectedCert.checklistItems.length : 0;

  // ---------- Loading state ----------

  if (loading && certifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading safety certifications...</div>
      </div>
    );
  }

  // ---------- Render ----------

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Certified Safe Sparkler Venue Program</h1>
          <p className="text-gray-400 mt-1">
            Manage venue safety certifications, audits, and compliance
          </p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          + New Application
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-navy-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total Certifications</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-navy-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gold-400">{stats.pending}</p>
            <p className="text-xs text-gray-400">Pending Review</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-navy-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">{stats.certified}</p>
            <p className="text-xs text-gray-400">Certified Venues</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-navy-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            <p className="text-xs text-gray-400">Expired</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 mr-2">Filter:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setStatusFilter(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.key
                ? 'bg-gold-400 text-navy-950'
                : 'bg-navy-800 text-gray-400 hover:text-white hover:bg-navy-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Certifications Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-700">
          <h2 className="text-lg font-semibold text-white">Venue Certifications</h2>
        </div>

        {certifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <svg className="w-16 h-16 text-navy-700 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-gray-400 text-lg font-medium mb-1">No certifications found</p>
            <p className="text-gray-500 text-sm mb-4">
              {statusFilter !== 'all'
                ? `No venues with "${FILTER_OPTIONS.find((o) => o.key === statusFilter)?.label}" status.`
                : 'Start by creating a new certification application.'}
            </p>
            {statusFilter !== 'all' ? (
              <button onClick={() => setStatusFilter('all')} className="btn-secondary text-sm">
                Clear Filter
              </button>
            ) : (
              <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
                + New Application
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-700 bg-navy-950/50">
                    <th className="table-header">Venue</th>
                    <th className="table-header">Contact</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Cert #</th>
                    <th className="table-header">Certified</th>
                    <th className="table-header">Expires</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {certifications.map((cert) => {
                    const sc = STATUS_CONFIG[cert.status];
                    return (
                      <tr
                        key={cert.id}
                        className="hover:bg-navy-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <td className="table-cell">
                          <p className="text-white font-medium">{cert.venueName}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {cert.venueAddress}
                          </p>
                        </td>
                        <td className="table-cell">
                          <p className="text-gray-300">{cert.contactName}</p>
                          <p className="text-xs text-gray-500">{cert.contactEmail}</p>
                        </td>
                        <td className="table-cell">
                          <span className={sc.badge}>{sc.label}</span>
                        </td>
                        <td className="table-cell font-mono text-xs">
                          {cert.certificationNumber || '--'}
                        </td>
                        <td className="table-cell text-xs">{formatDate(cert.certifiedDate)}</td>
                        <td className="table-cell text-xs">{formatDate(cert.expiryDate)}</td>
                        <td className="table-cell text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCert(cert);
                            }}
                            className="text-gold-400 hover:text-gold-300 text-sm font-medium"
                          >
                            View
                          </button>
                          {cert.status === 'certified' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCert(cert);
                                setShowCertificate(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium ml-3"
                            >
                              Certificate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-navy-800">
              {certifications.map((cert) => {
                const sc = STATUS_CONFIG[cert.status];
                return (
                  <button
                    key={cert.id}
                    className="w-full text-left px-6 py-4 hover:bg-navy-800/50 transition-colors"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{cert.venueName}</p>
                        <p className="text-xs text-gray-500">{cert.contactName}</p>
                      </div>
                      <span className={sc.badge}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {cert.certificationNumber && (
                        <span className="font-mono">{cert.certificationNumber}</span>
                      )}
                      {cert.certifiedDate && <span>Cert: {formatDate(cert.certifiedDate)}</span>}
                      {cert.expiryDate && <span>Exp: {formatDate(cert.expiryDate)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ================================================================== */}
      {/* NEW APPLICATION MODAL                                              */}
      {/* ================================================================== */}
      {showNewModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Certification Application</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Venue Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. The Grand Ballroom"
                  value={form.venueName}
                  onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Venue Address</label>
                <input
                  className="input-field"
                  placeholder="e.g. 123 Main St, Miami, FL 33101"
                  value={form.venueAddress}
                  onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="Full name"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Contact Phone</label>
                  <input
                    className="input-field"
                    placeholder="(555) 123-4567"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Contact Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="manager@venue.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-navy-700">
              <button
                onClick={createApplication}
                disabled={submitting || !form.venueName.trim() || !form.contactName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button onClick={() => setShowNewModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CERTIFICATION DETAIL DRAWER                                        */}
      {/* ================================================================== */}
      {selectedCert && !showCertificate && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-end z-50"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-navy-900 border-l border-navy-700 w-full max-w-2xl h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white truncate">
                  {selectedCert.venueName}
                </h2>
                <span className={STATUS_CONFIG[selectedCert.status].badge}>
                  {STATUS_CONFIG[selectedCert.status].label}
                </span>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Venue Info */}
              <div className="card">
                <h3 className="card-header flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  Venue Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Venue Name</p>
                    <p className="text-gray-200">{selectedCert.venueName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Address</p>
                    <p className="text-gray-200">{selectedCert.venueAddress || '--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Contact Name</p>
                    <p className="text-gray-200">{selectedCert.contactName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-gray-200">{selectedCert.contactEmail || '--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-gray-200">{selectedCert.contactPhone || '--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Applied</p>
                    <p className="text-gray-200">{formatDate(selectedCert.createdAt)}</p>
                  </div>
                  {selectedCert.certificationNumber && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Certification #</p>
                      <p className="text-gold-400 font-mono font-medium">
                        {selectedCert.certificationNumber}
                      </p>
                    </div>
                  )}
                  {selectedCert.certifiedDate && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Certified / Expires</p>
                      <p className="text-gray-200">
                        {formatDate(selectedCert.certifiedDate)} &mdash; {formatDate(selectedCert.expiryDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Transition */}
              <div className="card">
                <h3 className="card-header flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Status Management
                </h3>
                <div className="flex items-center gap-3">
                  {/* Workflow: pending -> audit -> certified */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['pending', 'audit', 'certified', 'expired'] as Certification['status'][]).map(
                      (status, idx) => {
                        const sc = STATUS_CONFIG[status];
                        const isActive = selectedCert.status === status;
                        return (
                          <div key={status} className="flex items-center gap-2">
                            {idx > 0 && (
                              <svg className="w-4 h-4 text-navy-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            )}
                            <button
                              onClick={() => changeStatus(status)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                  ? 'bg-gold-400 text-navy-950 ring-2 ring-gold-400/30'
                                  : 'bg-navy-800 text-gray-400 hover:text-white hover:bg-navy-700'
                              }`}
                            >
                              {sc.label}
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
                {selectedCert.status === 'certified' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="btn-primary text-sm"
                    >
                      View Certificate
                    </button>
                  </div>
                )}
              </div>

              {/* Safety Audit Checklist */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                    </svg>
                    Safety Audit Checklist
                  </h3>
                  <span className="text-sm text-gray-400">
                    {checklistProgress}/{checklistTotal} complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="progress-bar mb-5">
                  <div
                    className={`progress-fill ${
                      checklistProgress === checklistTotal && checklistTotal > 0
                        ? 'bg-emerald-500'
                        : 'bg-gold-400'
                    }`}
                    style={{
                      width: `${checklistTotal > 0 ? (checklistProgress / checklistTotal) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="space-y-1">
                  {selectedCert.checklistItems.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        item.checked
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'bg-navy-800/50 hover:bg-navy-800'
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-navy-600 hover:border-gold-400'
                          }`}
                        >
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${
                          item.checked ? 'text-emerald-300 line-through' : 'text-gray-300'
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {checklistProgress === checklistTotal && checklistTotal > 0 && selectedCert.status !== 'certified' && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 font-medium">
                      All checklist items complete. This venue is ready for certification.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="sticky bottom-0 bg-navy-900 border-t border-navy-700 px-6 py-4 flex items-center justify-between">
              <button onClick={() => setSelectedCert(null)} className="btn-secondary text-sm">
                Close
              </button>
              {selectedCert.status === 'certified' && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="btn-primary text-sm"
                >
                  View Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CERTIFICATE PREVIEW MODAL                                          */}
      {/* ================================================================== */}
      {showCertificate && selectedCert && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="w-full max-w-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Card */}
            <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 border-2 border-gold-400/40 rounded-2xl overflow-hidden shadow-2xl">
              {/* Gold Top Bar */}
              <div className="h-2 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400" />

              <div className="p-8 sm:p-12 text-center">
                {/* Brand */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-8 h-8 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-1">
                  King of Sparklers
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
                  <svg className="w-4 h-4 text-gold-400/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide mb-1">
                  CERTIFIED SAFE
                </h2>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide mb-6">
                  SPARKLER VENUE
                </h2>

                {/* Venue Name */}
                <div className="bg-navy-800/60 rounded-xl p-5 mb-6 border border-navy-700/50">
                  <p className="text-gold-400 font-bold text-xl sm:text-2xl">
                    {selectedCert.venueName}
                  </p>
                  {selectedCert.venueAddress && (
                    <p className="text-gray-400 text-sm mt-1">{selectedCert.venueAddress}</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Certificate #</p>
                    <p className="text-white font-mono font-semibold">
                      {selectedCert.certificationNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Issued</p>
                    <p className="text-white font-semibold">
                      {formatDate(selectedCert.certifiedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Expires</p>
                    <p className="text-white font-semibold">
                      {formatDate(selectedCert.expiryDate)}
                    </p>
                  </div>
                </div>

                {/* Statement */}
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                  This venue has met all safety standards required by King of Sparklers for the
                  safe handling, storage, and display of sparkler products in a hospitality
                  environment.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
                  <svg className="w-4 h-4 text-gold-400/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
                </div>

                <p className="text-gray-600 text-xs">
                  www.kingofsparklers.com
                </p>
              </div>

              {/* Gold Bottom Bar */}
              <div className="h-2 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400" />
            </div>

            {/* Badge Preview */}
            <div className="flex items-start gap-6">
              <div className="card flex-1 flex flex-col items-center py-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Venue Display Badge</p>
                <div className="w-24 h-24 rounded-full border-4 border-gold-400/50 bg-navy-800 flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-gold-400 mb-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-gold-400 text-[7px] font-bold uppercase leading-tight text-center px-1">
                    Certified Safe
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-2">King of Sparklers</p>
              </div>

              {/* Actions */}
              <div className="card flex-1 flex flex-col gap-3 py-6 px-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Actions</p>
                <button onClick={copyCertificateText} className="btn-primary text-sm w-full">
                  {copySuccess ? 'Copied to Clipboard!' : 'Download Certificate'}
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="btn-secondary text-sm w-full"
                >
                  Back to Details
                </button>
                <button
                  onClick={() => {
                    setShowCertificate(false);
                    setSelectedCert(null);
                  }}
                  className="btn-secondary text-sm w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
