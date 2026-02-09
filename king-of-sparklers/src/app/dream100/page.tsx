'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = 'nightclub' | 'hotel' | 'wedding' | 'event';
type PipelineStatus = 'prospect' | 'contacted' | 'sample_sent' | 'meeting' | 'proposal' | 'won' | 'lost';
type TouchType = 'email' | 'phone' | 'linkedin' | 'mail';
type TouchStatus = 'completed' | 'pending';
type ViewMode = 'pipeline' | 'table';
type SortField = 'company' | 'contactName' | 'category' | 'status' | 'touches' | 'lastActivity';
type SortDir = 'asc' | 'desc';

interface Touch {
  touchNumber: number;
  type: TouchType;
  status: TouchStatus;
  dateCompleted?: string;
  notes?: string;
}

interface Contact {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  linkedin: string;
  category: Category;
  status: PipelineStatus;
  notes: string;
  touches: Touch[];
  createdAt: string;
  updatedAt: string;
}

interface OutreachTemplate {
  touchNumber: number;
  type: TouchType;
  subject: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: { key: PipelineStatus; label: string; color: string }[] = [
  { key: 'prospect', label: 'Prospect', color: 'bg-gray-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'sample_sent', label: 'Sample Sent', color: 'bg-purple-500' },
  { key: 'meeting', label: 'Meeting', color: 'bg-gold-400' },
  { key: 'proposal', label: 'Proposal', color: 'bg-orange-500' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500' },
];

const CATEGORIES: { key: Category; label: string; badge: string }[] = [
  { key: 'nightclub', label: 'Nightclub', badge: 'badge-blue' },
  { key: 'hotel', label: 'Hotel', badge: 'badge-gold' },
  { key: 'wedding', label: 'Wedding', badge: 'badge-green' },
  { key: 'event', label: 'Event', badge: 'badge-gray' },
];

const DEFAULT_TOUCHES: Touch[] = Array.from({ length: 8 }, (_, i) => ({
  touchNumber: i + 1,
  type: (['email', 'phone', 'linkedin', 'email', 'phone', 'linkedin', 'mail', 'email'] as TouchType[])[i],
  status: 'pending' as TouchStatus,
}));

const TOUCH_TYPE_ICONS: Record<TouchType, string> = {
  email: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  phone: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25',
  linkedin: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  mail: 'M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V21z',
};

const EMPTY_FORM: Omit<Contact, 'id' | 'touches' | 'createdAt' | 'updatedAt'> = {
  company: '',
  contactName: '',
  email: '',
  phone: '',
  linkedin: '',
  category: 'nightclub',
  status: 'prospect',
  notes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function categoryBadge(cat: Category) {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found ? found.badge : 'badge-gray';
}

function categoryLabel(cat: Category) {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found ? found.label : cat;
}

function stageLabel(status: PipelineStatus) {
  const found = PIPELINE_STAGES.find((s) => s.key === status);
  return found ? found.label : status;
}

function stageColor(status: PipelineStatus) {
  const found = PIPELINE_STAGES.find((s) => s.key === status);
  return found ? found.color : 'bg-gray-500';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseTouches(raw: Touch[] | string): Touch[] {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_TOUCHES];
    }
  }
  return raw ?? [...DEFAULT_TOUCHES];
}

function lastTouchInfo(touches: Touch[]): { number: number; date: string } | null {
  const completed = touches.filter((t) => t.status === 'completed').sort((a, b) => a.touchNumber - b.touchNumber);
  if (completed.length === 0) return null;
  const last = completed[completed.length - 1];
  return { number: last.touchNumber, date: last.dateCompleted || '' };
}

function completedTouchCount(touches: Touch[]): number {
  return touches.filter((t) => t.status === 'completed').length;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Dream100Page() {
  // --- State ---
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [filterStatus, setFilterStatus] = useState<PipelineStatus | ''>('');
  const [sortField, setSortField] = useState<SortField>('company');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);

  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [completingTouch, setCompletingTouch] = useState<number | null>(null);
  const [touchNotes, setTouchNotes] = useState('');
  const [touchSaving, setTouchSaving] = useState(false);

  // --- Data Fetching ---
  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const parsed = (Array.isArray(data) ? data : data.contacts ?? []).map((c: Contact) => ({
          ...c,
          touches: parseTouches(c.touches),
        }));
        setContacts(parsed);
      }
    } catch (e) {
      console.error('Failed to fetch contacts:', e);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : data.templates ?? []);
      }
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchTemplates();
  }, [fetchContacts, fetchTemplates]);

  // --- Filtering & Sorting ---
  const filteredContacts = useMemo(() => {
    let list = [...contacts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, search]);

  const sortedContacts = useMemo(() => {
    const list = [...filteredContacts];
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'company':
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case 'contactName':
          aVal = a.contactName.toLowerCase();
          bVal = b.contactName.toLowerCase();
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'status':
          aVal = PIPELINE_STAGES.findIndex((s) => s.key === a.status);
          bVal = PIPELINE_STAGES.findIndex((s) => s.key === b.status);
          break;
        case 'touches':
          aVal = completedTouchCount(a.touches);
          bVal = completedTouchCount(b.touches);
          break;
        case 'lastActivity':
          aVal = a.updatedAt || '';
          bVal = b.updatedAt || '';
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredContacts, sortField, sortDir]);

  const contactsByStage = useMemo(() => {
    const map: Record<PipelineStatus, Contact[]> = {
      prospect: [],
      contacted: [],
      sample_sent: [],
      meeting: [],
      proposal: [],
      won: [],
      lost: [],
    };
    filteredContacts.forEach((c) => {
      if (map[c.status]) map[c.status].push(c);
    });
    return map;
  }, [filteredContacts]);

  // --- Stats ---
  const stats = useMemo(() => {
    const total = contacts.length;
    const byCategory: Record<Category, number> = { nightclub: 0, hotel: 0, wedding: 0, event: 0 };
    let won = 0;
    contacts.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (c.status === 'won') won++;
    });
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';
    return { total, byCategory, won, conversionRate };
  }, [contacts]);

  // --- Handlers ---
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function openAddModal() {
    setEditingContact(null);
    setFormData({ ...EMPTY_FORM });
    setShowFormModal(true);
  }

  function openEditModal(contact: Contact) {
    setEditingContact(contact);
    setFormData({
      company: contact.company,
      contactName: contact.contactName,
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      category: contact.category,
      status: contact.status,
      notes: contact.notes,
    });
    setShowFormModal(true);
  }

  function openDetail(contact: Contact) {
    setDetailContact(contact);
    setCompletingTouch(null);
    setTouchNotes('');
  }

  async function handleSaveContact() {
    setFormSaving(true);
    try {
      const isEdit = !!editingContact;
      const url = isEdit ? `/api/contacts/${editingContact!.id}` : '/api/contacts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowFormModal(false);
        setEditingContact(null);
        await fetchContacts();
      }
    } catch (e) {
      console.error('Failed to save contact:', e);
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteContact() {
    if (!editingContact) return;
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/contacts/${editingContact.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowFormModal(false);
        setEditingContact(null);
        if (detailContact?.id === editingContact.id) setDetailContact(null);
        await fetchContacts();
      }
    } catch (e) {
      console.error('Failed to delete contact:', e);
    }
  }

  async function handleCompleteTouch(contact: Contact, touchNumber: number) {
    setTouchSaving(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}/touches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touchNumber,
          notes: touchNotes,
          dateCompleted: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setCompletingTouch(null);
        setTouchNotes('');
        await fetchContacts();
        // Refresh detail contact
        const updated = await fetch(`/api/contacts/${contact.id}`);
        if (updated.ok) {
          const data = await updated.json();
          setDetailContact({ ...data, touches: parseTouches(data.touches) });
        }
      }
    } catch (e) {
      console.error('Failed to complete touch:', e);
    } finally {
      setTouchSaving(false);
    }
  }

  async function handleStageChange(contact: Contact, newStatus: PipelineStatus) {
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchContacts();
        if (detailContact?.id === contact.id) {
          setDetailContact({ ...detailContact, status: newStatus });
        }
      }
    } catch (e) {
      console.error('Failed to update stage:', e);
    }
  }

  // --- Template lookup ---
  function getTemplate(touchNumber: number): OutreachTemplate | undefined {
    return templates.find((t) => t.touchNumber === touchNumber);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 animate-pulse">Loading Dream 100 CRM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dream 100 CRM</h1>
          <p className="text-gray-400 mt-1">
            Track and nurture your top 100 B2B prospects through the 8-touch outreach sequence
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Contact
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Total Contacts</p>
        </div>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="card !p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.byCategory[cat.key]}</p>
            <p className="text-xs text-gray-400 mt-1">{cat.label}</p>
          </div>
        ))}
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.won}</p>
          <p className="text-xs text-gray-400 mt-1">Won</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-gold-400">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Conversion</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Controls Bar: Search, Filters, View Toggle                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value as Category | ''); setLoading(true); }}
          className="select-field w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as PipelineStatus | ''); setLoading(true); }}
          className="select-field w-full sm:w-auto"
        >
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex bg-navy-800 rounded-lg p-1 border border-navy-700">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-gold-400 text-navy-950 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Pipeline
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-gold-400 text-navy-950 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 15.75h7.5" />
            </svg>
            Table
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pipeline View                                                      */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto pb-4 -mx-2">
          <div className="flex gap-4 min-w-max px-2">
            {PIPELINE_STAGES.map((stage) => {
              const stageContacts = contactsByStage[stage.key];
              return (
                <div
                  key={stage.key}
                  className="w-72 flex-shrink-0 bg-navy-900/50 border border-navy-700 rounded-xl flex flex-col max-h-[calc(100vh-340px)]"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-navy-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-navy-800 rounded-full px-2 py-0.5">
                      {stageContacts.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {stageContacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-600 text-xs">No contacts</div>
                    ) : (
                      stageContacts.map((contact) => {
                        const lt = lastTouchInfo(contact.touches);
                        return (
                          <button
                            key={contact.id}
                            onClick={() => openDetail(contact)}
                            className="w-full text-left bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-navy-600 rounded-lg p-3 transition-all group cursor-pointer"
                          >
                            <p className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors truncate">
                              {contact.company}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{contact.contactName}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={categoryBadge(contact.category)}>
                                {categoryLabel(contact.category)}
                              </span>
                              {lt ? (
                                <span className="text-[10px] text-gray-500">
                                  Touch {lt.number} &middot; {formatDate(lt.date)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-600">No touches yet</span>
                              )}
                            </div>
                            {/* Touch progress bar */}
                            <div className="mt-2 w-full bg-navy-900 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-gold-400 transition-all"
                                style={{ width: `${(completedTouchCount(contact.touches) / 8) * 100}%` }}
                              />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table View                                                         */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'table' && (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  {([
                    { field: 'company' as SortField, label: 'Company' },
                    { field: 'contactName' as SortField, label: 'Contact' },
                    { field: 'category' as SortField, label: 'Category' },
                    { field: 'status' as SortField, label: 'Status' },
                    { field: 'touches' as SortField, label: 'Touches' },
                    { field: 'lastActivity' as SortField, label: 'Last Activity' },
                  ]).map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="table-header cursor-pointer hover:text-gray-200 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortField === col.field && (
                          <svg
                            className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {sortedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {contacts.length === 0
                        ? 'No contacts yet. Add your first Dream 100 prospect!'
                        : 'No contacts match your search or filters.'}
                    </td>
                  </tr>
                ) : (
                  sortedContacts.map((contact) => {
                    const lt = lastTouchInfo(contact.touches);
                    return (
                      <tr
                        key={contact.id}
                        className="hover:bg-navy-800/50 transition-colors cursor-pointer"
                        onClick={() => openDetail(contact)}
                      >
                        <td className="table-cell font-medium text-white">{contact.company}</td>
                        <td className="table-cell">{contact.contactName}</td>
                        <td className="table-cell">
                          <span className={categoryBadge(contact.category)}>
                            {categoryLabel(contact.category)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${stageColor(contact.status)}`} />
                            {stageLabel(contact.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="text-gold-400 font-medium">
                            {completedTouchCount(contact.touches)}
                          </span>
                          <span className="text-gray-500">/8</span>
                        </td>
                        <td className="table-cell text-gray-400">
                          {lt ? formatDate(lt.date) : formatDate(contact.updatedAt)}
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(contact);
                            }}
                            className="text-gray-400 hover:text-gold-400 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State for Pipeline */}
      {viewMode === 'pipeline' && contacts.length === 0 && (
        <div className="card text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Dream 100 Contacts Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your Dream 100 list by adding your top B2B prospects -- nightclubs, hotels, wedding
            venues, and event planners who could become wholesale partners.
          </p>
          <button onClick={openAddModal} className="btn-primary">
            Add Your First Contact
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add / Edit Contact Modal                                           */}
      {/* ------------------------------------------------------------------ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFormModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Company *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. LIV Miami"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. John Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@livmiami.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/johnsmith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                    <select
                      className="select-field"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Pipeline Stage</label>
                    <select
                      className="select-field"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PipelineStatus })}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
                  <textarea
                    className="textarea-field"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Key info about this prospect..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-700">
                <div>
                  {editingContact && (
                    <button onClick={handleDeleteContact} className="btn-danger text-sm">
                      Delete Contact
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowFormModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={formSaving || !formData.company || !formData.contactName}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formSaving ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Contact Detail Drawer                                              */}
      {/* ------------------------------------------------------------------ */}
      {detailContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailContact(null)}
          />
          {/* Drawer */}
          <div className="relative w-full max-w-2xl bg-navy-900 border-l border-navy-700 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{detailContact.company}</h2>
                  <p className="text-gray-400 mt-0.5">{detailContact.contactName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEditModal(detailContact);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDetailContact(null)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="card !bg-navy-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Email</span>
                    <span className="text-gray-200">{detailContact.email || '--'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Phone</span>
                    <span className="text-gray-200">{detailContact.phone || '--'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">LinkedIn</span>
                    {detailContact.linkedin ? (
                      <a
                        href={detailContact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-400 hover:underline"
                      >
                        View Profile
                      </a>
                    ) : (
                      <span className="text-gray-200">--</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Category</span>
                    <span className={categoryBadge(detailContact.category)}>
                      {categoryLabel(detailContact.category)}
                    </span>
                  </div>
                </div>
                {detailContact.notes && (
                  <div className="mt-4 pt-4 border-t border-navy-700">
                    <span className="text-gray-500 text-sm block mb-1">Notes</span>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{detailContact.notes}</p>
                  </div>
                )}
              </div>

              {/* Pipeline Stage Selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Pipeline Stage
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_STAGES.map((stage) => (
                    <button
                      key={stage.key}
                      onClick={() => handleStageChange(detailContact, stage.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        detailContact.status === stage.key
                          ? 'bg-gold-400 text-navy-950 border-gold-400'
                          : 'bg-navy-800 text-gray-400 border-navy-700 hover:border-navy-500 hover:text-white'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                        {stage.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8-Touch Outreach Tracker */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  8-Touch Outreach Sequence
                </h3>
                <div className="space-y-3">
                  {detailContact.touches.map((touch) => {
                    const isCompleting = completingTouch === touch.touchNumber;
                    const template = getTemplate(touch.touchNumber);
                    return (
                      <div
                        key={touch.touchNumber}
                        className={`border rounded-lg transition-all ${
                          touch.status === 'completed'
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : isCompleting
                            ? 'bg-gold-400/5 border-gold-400/30'
                            : 'bg-navy-800 border-navy-700'
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Touch number circle */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                touch.status === 'completed'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-navy-700 text-gray-400'
                              }`}
                            >
                              {touch.status === 'completed' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                touch.touchNumber
                              )}
                            </div>

                            {/* Touch type icon + info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d={TOUCH_TYPE_ICONS[touch.type]} />
                                </svg>
                                <span className="text-sm font-medium text-white capitalize">
                                  Touch {touch.touchNumber}: {touch.type}
                                </span>
                                {touch.status === 'completed' ? (
                                  <span className="badge-green">Completed</span>
                                ) : (
                                  <span className="badge-gray">Pending</span>
                                )}
                              </div>
                              {touch.status === 'completed' && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {touch.dateCompleted && (
                                    <span>Completed {formatDate(touch.dateCompleted)}</span>
                                  )}
                                  {touch.notes && (
                                    <span className="ml-2 text-gray-400">-- {touch.notes}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action button */}
                          {touch.status === 'pending' && (
                            <button
                              onClick={() => {
                                if (isCompleting) {
                                  setCompletingTouch(null);
                                  setTouchNotes('');
                                } else {
                                  setCompletingTouch(touch.touchNumber);
                                  setTouchNotes('');
                                }
                              }}
                              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                isCompleting
                                  ? 'bg-navy-700 text-gray-300'
                                  : 'bg-gold-400/10 text-gold-400 hover:bg-gold-400/20'
                              }`}
                            >
                              {isCompleting ? 'Cancel' : 'Complete'}
                            </button>
                          )}
                        </div>

                        {/* Expanded: completing form + template */}
                        {isCompleting && (
                          <div className="px-4 pb-4 space-y-3 border-t border-navy-700 mt-0 pt-3">
                            {/* Template preview */}
                            {template && (
                              <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                  </svg>
                                  <span className="text-xs font-semibold text-gold-400">
                                    Template: {template.subject}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
                                  {template.body}
                                </p>
                              </div>
                            )}

                            {/* Notes input */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                Notes (optional)
                              </label>
                              <textarea
                                className="textarea-field text-sm"
                                rows={2}
                                value={touchNotes}
                                onChange={(e) => setTouchNotes(e.target.value)}
                                placeholder="What happened during this touch? Any follow-up needed?"
                              />
                            </div>

                            {/* Submit */}
                            <button
                              onClick={() => handleCompleteTouch(detailContact, touch.touchNumber)}
                              disabled={touchSaving}
                              className="btn-primary text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {touchSaving ? (
                                <span className="inline-flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                                  Saving...
                                </span>
                              ) : (
                                <>Mark Touch {touch.touchNumber} as Completed</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Touch Progress Summary */}
              <div className="card !bg-navy-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Outreach Progress</span>
                  <span className="text-sm text-gold-400 font-semibold">
                    {completedTouchCount(detailContact.touches)}/8 touches
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-gold-400"
                    style={{ width: `${(completedTouchCount(detailContact.touches) / 8) * 100}%` }}
                  />
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-600 flex items-center justify-between pt-2 border-t border-navy-800">
                <span>Created {formatDate(detailContact.createdAt)}</span>
                <span>Updated {formatDate(detailContact.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
