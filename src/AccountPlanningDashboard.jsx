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
const DEFAULT_FORM_CONFIG = [
  {
    id: 'customerDetails',
    title: 'Customer Overview',
    subtitle: 'Primary contact and profile',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Acme Corp', width: 'half' },
      { key: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Technology', width: 'half' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'Full name of contact', width: 'full' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@company.com', width: 'half' },
      { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: 'WhatsApp number', width: 'half' },
      { key: 'phone', label: 'Phone (Primary)', type: 'text', placeholder: '+1 555-0123', width: 'half' },
      { key: 'mobile2', label: 'Secondary Mobile', type: 'text', placeholder: '+1 555-4567', width: 'half' }
    ]
  },
  {
    id: 'accountPotential',
    title: 'Account Potential',
    subtitle: 'History and strategic goals',
    fields: [
      { key: 'review', label: 'Review & History', type: 'textarea', placeholder: 'Recent milestones and history...', width: 'full' },
      { key: 'expectations', label: 'Expectations', type: 'textarea', placeholder: 'What does the customer expect?', width: 'full' },
      { key: 'goals', label: 'Strategic Goals', type: 'textarea', placeholder: 'Top 3 business goals', width: 'full' },
      { key: 'proposal', label: 'Proposal (Number only)', type: 'number', placeholder: 'Enter proposal amount', width: 'half' },
      { key: 'revisedProposal', label: 'Revised Proposal (Number only)', type: 'number', placeholder: 'Enter revised proposal amount', width: 'half' }
    ]
  },
  {
    id: 'priorities',
    title: 'Customer Priorities',
    subtitle: 'Drivers and tech focus',
    fields: [
      { key: 'xrFocus', label: 'Primary Focus', type: 'select', width: 'full', options: ['None', 'AR', 'VR', 'MR', 'AI', 'Experience Centre'] },
      { key: 'landscape', label: 'Business Landscape', type: 'textarea', placeholder: 'Current market challenges...', width: 'full' },
      { key: 'drivers', label: 'Key Business Drivers', type: 'textarea', placeholder: 'What drives their decisions?', width: 'full' }
    ]
  },
  {
    id: 'opportunity',
    title: 'Opportunities',
    subtitle: 'Sales and strategy',
    fields: [
      { key: 'canSellExtra', label: 'Upsell Potential', type: 'select', width: 'full', options: ['Unsure', 'Definitely', 'Maybe', 'Unlikely'] },
      { key: 'opportunities', label: 'Specific Opportunities', type: 'textarea', placeholder: 'Detail specific growth paths...', width: 'full' },
      { key: 'strategy', label: 'Primary Strategy', type: 'radio', width: 'full', options: ['Protect', 'Grow'], descriptions: { Protect: 'Defend existing accounts and maintain satisfaction.', Grow: 'Expand footprint and increase account value.' } }
    ]
  },
  {
    id: 'relationship',
    title: 'Relationships',
    subtitle: 'Stakeholders and mapping',
    fields: [
      { key: 'stakeholders', label: 'Key Executives & Stakeholders', type: 'textarea', placeholder: 'List influential points of contact...', width: 'full' },
      { key: 'plan', label: 'Advancement Plan', type: 'textarea', placeholder: 'How will we strengthen these ties?', width: 'full' }
    ]
  },
  {
    id: 'action',
    title: 'Action Plan',
    subtitle: 'Critical actions and risk',
    fields: [
      { key: 'actions', label: 'Critical Actions', type: 'textarea', placeholder: 'Immediate steps required...', width: 'full' },
      { key: 'riskMitigation', label: 'Risk Mitigation', type: 'textarea', placeholder: 'Potential blockers and solutions...', width: 'full' }
    ]
  }
];

const sectionIcons = {
  customerDetails: <Briefcase />,
  accountPotential: <TrendingUp />,
  priorities: <Target />,
  opportunity: <Lightbulb />,
  relationship: <Users />,
  action: <ClipboardCheck />
};

const normalizeField = (field, defaultField) => {
  const merged = { ...defaultField, ...(field || {}) };
  if (merged.key === 'xrFocus') {
    return {
      ...merged,
      label: 'Primary Focus',
      options: Array.from(new Set([...(merged.options || []), 'Experience Centre']))
    };
  }
  return merged;
};

const normalizeFormConfig = (config) => {
  const incomingSections = Array.isArray(config) ? config : [];
  return DEFAULT_FORM_CONFIG.map((defaultSection) => {
    const incomingSection = incomingSections.find((section) => section.id === defaultSection.id);
    if (!incomingSection) return defaultSection;

    const incomingFields = Array.isArray(incomingSection.fields) ? incomingSection.fields : [];
    return {
      ...defaultSection,
      ...incomingSection,
      fields: defaultSection.fields.map((defaultField) =>
        normalizeField(incomingFields.find((field) => field.key === defaultField.key), defaultField)
      )
    };
  });
};

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
    proposal: '',
    revisedProposal: '',
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
  const [formConfig, setFormConfig] = useState(DEFAULT_FORM_CONFIG);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState('');

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

  const fetchFormConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/form-config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFormConfig(normalizeFormConfig(data));
      }
    } catch (error) {
      console.error('Error fetching form config:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchPlans(), fetchFormConfig()]).finally(() => setLoading(false));
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

  const sections = formConfig.map((section) => ({
    ...section,
    icon: sectionIcons[section.id] || <Briefcase />
  }));

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select className="select-field" value={formData[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)}>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'radio') {
      const selectedValue = formData[field.key] || field.options?.[0] || '';
      return (
        <>
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.35rem 0 0.1rem', flexWrap: 'wrap' }}>
            {(field.options || []).map((option) => (
              <div key={option}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <input type="radio" style={{ width: '18px', height: '18px' }} checked={selectedValue === option} onChange={() => handleInputChange(field.key, option)} />
                  {option}
                </label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'var(--bg-home)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.5 }}>
            {field.descriptions?.[selectedValue] || ''}
          </div>
        </>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea className="textarea-field" placeholder={field.placeholder || ''} value={formData[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} />
      );
    }

    return (
      <input className="input-field" type={field.type || 'text'} placeholder={field.placeholder || ''} value={formData[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} />
    );
  };

  const renderSectionContent = (section) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
      {section.fields.map((field) => (
        <div key={field.key} className="form-group" style={{ gridColumn: field.width === 'half' ? 'span 1' : '1 / -1' }}>
          <label>{field.label}</label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );

  const updateSectionField = (sectionId, fieldKey, property, value) => {
    setFormConfig((prev) => prev.map((section) => (
      section.id !== sectionId
        ? section
        : {
            ...section,
            fields: section.fields.map((field) => (
              field.key !== fieldKey
                ? field
                : { ...field, [property]: value }
            ))
          }
    )));
  };

  const updateSectionMeta = (sectionId, property, value) => {
    setFormConfig((prev) => prev.map((section) => (
      section.id !== sectionId ? section : { ...section, [property]: value }
    )));
  };

  const handleConfigSave = async () => {
    setIsSavingConfig(true);
    setConfigError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/form-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formConfig)
      });
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setConfigError(data.error || 'Unable to save form configuration');
        return;
      }
      setShowCustomizer(false);
    } catch (error) {
      setConfigError('Unable to save form configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

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
        setActiveSectionId('customerDetails');
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
      proposal: record.proposal || '',
      revisedProposal: record.revisedProposal || '',
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
      proposal: '',
      revisedProposal: '',
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
                  <th>Proposal</th>
                  <th>Revised Proposal</th>
                  <th>Strategy</th>
                  {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pastRecords.length === 0 ? (
                  <tr><td colSpan={user?.role === 'admin' ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No strategic records found.</td></tr>
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
                        <div style={{ fontWeight: 700 }}>{r.proposal || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{r.revisedProposal || r.proposal || 'N/A'}</div>
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
          {user?.role === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
              <button
                onClick={() => setShowCustomizer(true)}
                style={{ padding: '0.65rem 1rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Customize Form
              </button>
            </div>
          )}
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
                    {renderSectionContent(sections.find(s => s.id === activeSectionId))}
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
      <AnimatePresence>
        {showCustomizer && user?.role === 'admin' && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="glass-card" style={{ width: 'min(980px, 100%)', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Customize Form</h2>
                <button onClick={() => setShowCustomizer(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.3rem', cursor: 'pointer' }}>x</button>
              </div>
              {configError && (
                <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontWeight: 700 }}>
                  {configError}
                </div>
              )}
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {formConfig.map((section) => (
                  <div key={section.id} style={{ border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Section Title</label>
                        <input className="input-field" value={section.title} onChange={(e) => updateSectionMeta(section.id, 'title', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Section Subtitle</label>
                        <input className="input-field" value={section.subtitle} onChange={(e) => updateSectionMeta(section.id, 'subtitle', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                      {section.fields.map((field) => (
                        <div key={field.key} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                          <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>{field.key}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Label</label>
                              <input className="input-field" value={field.label || ''} onChange={(e) => updateSectionField(section.id, field.key, 'label', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Placeholder</label>
                              <input className="input-field" value={field.placeholder || ''} onChange={(e) => updateSectionField(section.id, field.key, 'placeholder', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Type</label>
                              <select className="select-field" value={field.type} onChange={(e) => updateSectionField(section.id, field.key, 'type', e.target.value)}>
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="textarea">Paragraph</option>
                                <option value="select">Dropdown</option>
                                <option value="radio">Radio</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Width</label>
                              <select className="select-field" value={field.width || 'full'} onChange={(e) => updateSectionField(section.id, field.key, 'width', e.target.value)}>
                                <option value="full">Full</option>
                                <option value="half">Half</option>
                              </select>
                            </div>
                          </div>
                          {(field.type === 'select' || field.type === 'radio') && (
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '0.75rem' }}>
                              <label>Options (comma separated)</label>
                              <input
                                className="input-field"
                                value={(field.options || []).join(', ')}
                                onChange={(e) => updateSectionField(section.id, field.key, 'options', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button onClick={() => setFormConfig(DEFAULT_FORM_CONFIG)} style={{ padding: '0.7rem 1rem', background: 'var(--bg-home)', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Reset Defaults
                </button>
                <button onClick={handleConfigSave} disabled={isSavingConfig} style={{ padding: '0.7rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                  {isSavingConfig ? 'Saving...' : 'Save Form Config'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPlanningDashboard;
