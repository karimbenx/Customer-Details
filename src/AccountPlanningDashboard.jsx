import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Lightbulb,
  Users,
  ClipboardCheck,
  ChevronRight,
  PlusCircle,
  Save,
  HelpCircle,
  Briefcase,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Zap,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const EDIT_DRAFT_STORAGE_KEY = 'clientsync-edit-draft';

const AccountPlanningDashboard = ({ view = 'form', user, token }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    mobile2: '',
    whatsapp: '',
    industry: '',
    review: '',
    expectations: '',
    goals: '',
    xrFocus: 'None',
    landscape: '',
    drivers: '',
    canSellExtra: 'Unsure',
    opportunities: '',
    strategy: 'Grow',
    stakeholders: '',
    plan: '',
    actions: '',
    riskMitigation: ''
  });

  const [pastRecords, setPastRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setPastRecords(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    fetchPlans().then(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (view !== 'form') return;

    const savedDraft = window.sessionStorage.getItem(EDIT_DRAFT_STORAGE_KEY);
    if (!savedDraft) return;

    try {
      const parsedDraft = JSON.parse(savedDraft);
      setFormData(prev => ({ ...prev, ...parsedDraft }));
      setActiveSectionId('customerDetails');
    } catch (error) {
      console.error('Failed to restore edit draft:', error);
    } finally {
      window.sessionStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
    }
  }, [view]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    {
      id: 'customerDetails',
      title: 'Customer Overview',
      subtitle: 'Primary contact and profile',
      icon: <Briefcase />,
      content: (
        <div className="grid gap-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Company Name</label>
              <input className="input-field" placeholder="Acme Corp" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input className="input-field" placeholder="e.g. Technology" value={formData.industry} onChange={(e) => handleInputChange('industry', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input className="input-field" placeholder="Full name of contact" value={formData.contactPerson} onChange={(e) => handleInputChange('contactPerson', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="input-field" type="email" placeholder="email@company.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input className="input-field" placeholder="WhatsApp number" value={formData.whatsapp} onChange={(e) => handleInputChange('whatsapp', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Phone (Primary)</label>
              <input className="input-field" placeholder="+1 555-0123" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Secondary Mobile</label>
              <input className="input-field" placeholder="+1 555-4567" value={formData.mobile2} onChange={(e) => handleInputChange('mobile2', e.target.value)} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accountPotential',
      title: 'Account Potential',
      subtitle: 'History and strategic goals',
      icon: <TrendingUp />,
      content: (
        <div className="grid gap-6">
          <div className="form-group">
            <label>Review & History</label>
            <textarea className="textarea-field" placeholder="Recent milestones and history..." value={formData.review} onChange={(e) => handleInputChange('review', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expectations</label>
            <textarea className="textarea-field" placeholder="What does the customer expect?" value={formData.expectations} onChange={(e) => handleInputChange('expectations', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Strategic Goals</label>
            <textarea className="textarea-field" placeholder="Top 3 business goals" value={formData.goals} onChange={(e) => handleInputChange('goals', e.target.value)} />
          </div>
        </div>
      )
    },
    {
      id: 'priorities',
      title: 'Customer Priorities',
      subtitle: 'Drivers and tech focus',
      icon: <Target />,
      content: (
        <div className="grid gap-6">
          <div className="form-group">
            <label>Primary XR Focus</label>
            <select className="select-field" value={formData.xrFocus} onChange={(e) => handleInputChange('xrFocus', e.target.value)}>
              <option value="None">Select Interest...</option>
              <option value="AR">Augmented Reality (AR)</option>
              <option value="VR">Virtual Reality (VR)</option>
              <option value="MR">Mixed Reality (MR)</option>
              <option value="AI">AI / Machine Learning</option>
            </select>
          </div>
          <div className="form-group">
            <label>Business Landscape</label>
            <textarea className="textarea-field" placeholder="Current market challenges..." value={formData.landscape} onChange={(e) => handleInputChange('landscape', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Key Business Drivers</label>
            <textarea className="textarea-field" placeholder="What drives their decisions?" value={formData.drivers} onChange={(e) => handleInputChange('drivers', e.target.value)} />
          </div>
        </div>
      )
    },
    {
      id: 'opportunity',
      title: 'Opportunities',
      subtitle: 'Sales and strategy',
      icon: <Lightbulb />,
      content: (
        <div className="grid gap-6">
          <div className="form-group">
            <label>Upsell Potential</label>
            <select className="select-field" value={formData.canSellExtra} onChange={(e) => handleInputChange('canSellExtra', e.target.value)}>
              <option value="Unsure">Select Potential...</option>
              <option value="Definitely">Definitely (High Potential)</option>
              <option value="Maybe">Maybe (Review Needed)</option>
              <option value="Unlikely">Unlikely (Low Interest)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Specific Opportunities</label>
            <textarea className="textarea-field" placeholder="Detail specific growth paths..." value={formData.opportunities} onChange={(e) => handleInputChange('opportunities', e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Primary Strategy
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', padding: '0.35rem 0 0.1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <input type="radio" style={{ width: '18px', height: '18px' }} checked={formData.strategy === 'Protect'} onChange={() => handleInputChange('strategy', 'Protect')} /> 
                  Protect
                </label>
              </div>
              <div>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <input type="radio" style={{ width: '18px', height: '18px' }} checked={formData.strategy === 'Grow'} onChange={() => handleInputChange('strategy', 'Grow')} /> 
                  Grow
                </label>
              </div>
            </div>
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                background: 'var(--bg-home)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.86rem',
                fontWeight: 600,
                lineHeight: 1.5
              }}
            >
              {formData.strategy === 'Protect'
                ? 'Protect: Defend existing accounts and maintain satisfaction.'
                : 'Grow: Expand footprint and increase account value.'}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'relationship',
      title: 'Relationships',
      subtitle: 'Stakeholders and mapping',
      icon: <Users />,
      content: (
        <div className="grid gap-6">
          <div className="form-group">
            <label>Key Executives & Stakeholders</label>
            <textarea className="textarea-field" placeholder="List influential points of contact..." value={formData.stakeholders} onChange={(e) => handleInputChange('stakeholders', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Advancement Plan</label>
            <textarea className="textarea-field" placeholder="How will we strengthen these ties?" value={formData.plan} onChange={(e) => handleInputChange('plan', e.target.value)} />
          </div>
        </div>
      )
    },
    {
      id: 'action',
      title: 'Action Plan',
      subtitle: 'Critical actions and risk',
      icon: <ClipboardCheck />,
      content: (
        <div className="grid gap-6">
          <div className="form-group">
            <label>Critical Actions</label>
            <textarea className="textarea-field" placeholder="Immediate steps required..." value={formData.actions} onChange={(e) => handleInputChange('actions', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Risk Mitigation</label>
            <textarea className="textarea-field" placeholder="Potential blockers and solutions..." value={formData.riskMitigation} onChange={(e) => handleInputChange('riskMitigation', e.target.value)} />
          </div>
        </div>
      )
    }
  ];

  const currentIndex = sections.findIndex(s => s.id === activeSectionId);

  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSectionId(sections[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setActiveSectionId(sections[currentIndex - 1].id);
    } else {
      setActiveSectionId(null);
    }
  };

  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return;
      }
      const data = await response.json();
      if (response.ok) {
        window.sessionStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
        setShowToast(true);
        fetchPlans();
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setSaveError(data.error || 'Save failed. Check console.');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('Network error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record) => {
    const draft = {
      _id: record._id,
      companyName: record.companyName || '',
      contactPerson: record.contactPerson || '',
      email: record.email || '',
      phone: record.phone || '',
      mobile2: record.mobile2 || '',
      whatsapp: record.whatsapp || '',
      industry: record.industry || '',
      review: record.review || '',
      expectations: record.expectations || '',
      goals: record.goals || '',
      xrFocus: record.xrFocus || 'None',
      landscape: record.landscape || '',
      drivers: record.drivers || '',
      canSellExtra: record.canSellExtra || 'Unsure',
      opportunities: record.opportunities || '',
      strategy: record.strategy || 'Grow',
      stakeholders: record.stakeholders || '',
      plan: record.plan || '',
      actions: record.actions || '',
      riskMitigation: record.riskMitigation || ''
    };
    window.sessionStorage.setItem(EDIT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setFormData(draft);
    // Switch to form view via custom event defined in App.jsx
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
    setActiveSectionId('customerDetails');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this strategic record?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/plan/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return;
      }
      if (response.ok) {
        setPastRecords(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleNewPlan = () => {
    window.sessionStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      mobile2: '',
      whatsapp: '',
      industry: '',
      review: '',
      expectations: '',
      goals: '',
      xrFocus: 'None',
      landscape: '',
      drivers: '',
      canSellExtra: 'Unsure',
      opportunities: '',
      strategy: 'Grow',
      stakeholders: '',
      plan: '',
      actions: '',
      riskMitigation: ''
    });
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
    setActiveSectionId('customerDetails');
  };

  if (loading) return <div className="loader">Initializing Strategic Dashboard...</div>;

  return (
    <div className="main-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="toast-success">
            Strategy Synchronized ✓
          </motion.div>
        )}
        {saveError && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--danger)', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, zIndex: 9999, maxWidth: '500px', textAlign: 'center' }}
          >
            ⚠️ {saveError}
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'records' ? (
        <div className="glass-card animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ margin: 0 }}>Strategic Database</h1>
              {user?.role === 'admin' && (
                <span style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                  <ShieldCheck size={12} /> Admin Mode
                </span>
              )}
              {user?.role !== 'admin' && (
                <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                  <Eye size={12} /> View Mode
                </span>
              )}
            </div>
            {user?.role === 'admin' && (
              <button 
                onClick={handleNewPlan}
                style={{ padding: '0.8rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={18} />
                Create New Plan
              </button>
            )}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Company / Industry</th>
                  <th>Contact Person</th>
                  <th>Primary Contact</th>
                  <th>Extra Contacts</th>
                  <th>Strategy</th>
                  {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pastRecords.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No strategic records found.</td></tr>
                ) : (
                  pastRecords.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{r.companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.industry}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={14} color="var(--accent)" />
                          {r.contactPerson || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <Mail size={12} color="var(--text-muted)" />
                            {r.email || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <Phone size={12} color="var(--text-muted)" />
                            {r.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <Phone size={12} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-muted)' }}>M2:</span> {r.mobile2 || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <Zap size={12} color="var(--success)" fill="var(--success)" />
                            <span style={{ color: 'var(--text-muted)' }}>WA:</span> {r.whatsapp || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.strategy === 'Grow' ? 'badge-primary' : ''}`} style={{ 
                          background: r.strategy === 'Grow' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: r.strategy === 'Grow' ? 'var(--accent)' : 'var(--success)'
                        }}>
                          {r.strategy}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleEdit(r)}
                              className="action-btn edit"
                              title="Edit Plan"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(r._id)}
                              className="action-btn delete"
                              title="Delete Plan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: activeSectionId ? 'center' : 'flex-start',
            gap: activeSectionId ? '0.65rem' : '0.85rem',
            marginBottom: 'clamp(1rem, 2vh, 1.5rem)',
            transition: 'all 0.3s ease'
          }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(activeSectionId === s.id ? null : s.id)}
                className={`accordion-section ${activeSectionId === s.id ? 'active' : ''}`}
                style={{
                  padding: activeSectionId ? 'clamp(0.85rem, 1.4vh, 1rem) clamp(0.9rem, 1.2vw, 1rem)' : 'clamp(1rem, 1.8vh, 1.25rem) clamp(1.05rem, 1.4vw, 1.35rem)',
                  display: 'flex',
                  flexDirection: activeSectionId ? 'row' : 'column',
                  alignItems: activeSectionId ? 'center' : 'flex-start',
                  justifyContent: 'center',
                  gap: activeSectionId ? '0.6rem' : '0.85rem',
                  background: activeSectionId === s.id ? 'var(--accent)' : '#fff',
                  border: activeSectionId === s.id ? 'none' : '1px solid var(--border-light)',
                  color: activeSectionId === s.id ? '#fff' : 'inherit',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  minHeight: activeSectionId ? 'clamp(68px, 9vh, 78px)' : 'clamp(84px, 12vh, 108px)',
                  width: activeSectionId ? 'clamp(150px, 17vw, 180px)' : 'clamp(210px, 18vw, 240px)',
                  maxWidth: '100%'
                }}
              >
                <div style={{ flexShrink: 0 }}>{React.cloneElement(s.icon, { size: activeSectionId ? 16 : 22 })}</div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: activeSectionId ? '0.78rem' : '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.title}</h3>
                  {!activeSectionId && <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.7 }}>{s.subtitle}</p>}
                </div>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              {activeSectionId && (
                <motion.div
                  key={activeSectionId}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="glass-card dashboard-form-card"
                  style={{ display: 'flex', flexDirection: 'column', padding: 'clamp(1.2rem, 2.4vh, 2rem)' }}
                >
                  <div className="dashboard-form-scroll" style={{ overflowY: 'auto', paddingRight: '0.75rem' }}>
                    {sections.find(s => s.id === activeSectionId).content}
                  </div>
                  <div style={{ 
                    marginTop: 'clamp(1rem, 2vh, 1.5rem)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: 'clamp(0.85rem, 1.6vh, 1.1rem)',
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    <button 
                      onClick={goToPrev}
                      style={{ 
                        padding: '0.55rem 0.95rem', 
                        background: 'var(--bg-home)', 
                        border: 'none', 
                        borderRadius: '9px', 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.45rem',
                        fontSize: '0.82rem' 
                      }}
                    >
                      <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
                      {currentIndex === 0 ? 'Home' : 'Back'}
                    </button>

                    {currentIndex < sections.length - 1 ? (
                      <button 
                        onClick={goToNext}
                        style={{ 
                          padding: '0.6rem 1rem', 
                          background: 'var(--accent)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '9px', 
                          fontWeight: 800, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          fontSize: '0.82rem',
                          boxShadow: '0 8px 16px var(--accent-glow)'
                        }}
                      >
                        Next Module
                        <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="save-button"
                        style={{
                          width: 'auto', 
                          padding: '0.62rem 1.05rem', 
                          background: 'var(--success)', 
                          color: '#fff',
                          borderRadius: '9px', 
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.42rem'
                        }}
                      >
                        <Save size={15} />
                        {isSaving ? 'Synchronizing...' : 'Finalize & Sync Strategy'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPlanningDashboard;
