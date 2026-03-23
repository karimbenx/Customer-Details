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
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const AccountPlanningDashboard = ({ view = 'form' }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
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
      const res = await fetch(`${API_BASE_URL}/api/plans`);
      const data = await res.json();
      if (Array.isArray(data)) setPastRecords(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    fetchPlans().then(() => setLoading(false));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowToast(true);
        fetchPlans();
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
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
              <label>Phone / WhatsApp</label>
              <input className="input-field" placeholder="+1 555-0123" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
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
            <input className="input-field" placeholder="Top 3 business goals" value={formData.goals} onChange={(e) => handleInputChange('goals', e.target.value)} />
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
              <HelpCircle size={14} color="var(--text-muted)" />
            </label>
            <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
              <div className="tooltip-container">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                  <input type="radio" style={{ width: '18px', height: '18px' }} checked={formData.strategy === 'Protect'} onChange={() => handleInputChange('strategy', 'Protect')} /> 
                  Protect
                </label>
                <span className="tooltip-text">Defend existing accounts and maintain satisfaction.</span>
              </div>
              <div className="tooltip-container">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                  <input type="radio" style={{ width: '18px', height: '18px' }} checked={formData.strategy === 'Grow'} onChange={() => handleInputChange('strategy', 'Grow')} /> 
                  Grow
                </label>
                <span className="tooltip-text">Expand footprint and increase account value.</span>
              </div>
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

  if (loading) return <div className="loader">Initializing Strategic Dashboard...</div>;

  return (
    <div className="main-container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="toast-success">
            Strategy Synchronized
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'records' ? (
        <div className="glass-card animate-in">
          <h1 style={{ marginBottom: '2rem' }}>Strategic Records</h1>
          <table className="pro-table">
            <thead>
              <tr><th>Company</th><th>Industry</th><th>Strategy</th></tr>
            </thead>
            <tbody>
              {pastRecords.map(r => (
                <tr key={r._id}><td>{r.companyName}</td><td>{r.industry}</td><td>{r.strategy}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: activeSectionId ? '1rem' : '2.5rem' }}>
            <h1 style={{ fontSize: activeSectionId ? '1.8rem' : '2.5rem', margin: 0 }}>Client Intelligence Dashboard</h1>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: activeSectionId ? 'repeat(6, 1fr)' : 'repeat(3, 1fr)',
            gap: activeSectionId ? '0.5rem' : '1.5rem',
            marginBottom: '1.5rem',
            transition: 'all 0.3s ease'
          }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(activeSectionId === s.id ? null : s.id)}
                className={`accordion-section ${activeSectionId === s.id ? 'active' : ''}`}
                style={{
                  padding: activeSectionId ? '0.75rem' : '2rem',
                  display: 'flex',
                  flexDirection: activeSectionId ? 'row' : 'column',
                  alignItems: 'center',
                  gap: activeSectionId ? '0.5rem' : '1rem',
                  background: activeSectionId === s.id ? 'var(--accent)' : '#fff',
                  border: activeSectionId === s.id ? 'none' : '1px solid var(--border-light)',
                  color: activeSectionId === s.id ? '#fff' : 'inherit',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
              >
                <div style={{ flexShrink: 0 }}>{React.cloneElement(s.icon, { size: activeSectionId ? 16 : 24 })}</div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: activeSectionId ? '0.7rem' : '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.title}</h3>
                  {!activeSectionId && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{s.subtitle}</p>}
                </div>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <AnimatePresence mode="wait">
              {activeSectionId && (
                <motion.div
                  key={activeSectionId}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="glass-card"
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}
                >
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                    <h2 style={{ marginBottom: '2rem' }}>{sections.find(s => s.id === activeSectionId).title}</h2>
                    {sections.find(s => s.id === activeSectionId).content}
                  </div>
                  <div style={{ 
                    marginTop: '2rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    <button 
                      onClick={goToPrev}
                      style={{ 
                        padding: '1rem 2rem', 
                        background: 'var(--bg-home)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem' 
                      }}
                    >
                      <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                      {currentIndex === 0 ? 'Home' : 'Back'}
                    </button>

                    {currentIndex < sections.length - 1 ? (
                      <button 
                        onClick={goToNext}
                        style={{ 
                          padding: '1rem 2.5rem', 
                          background: 'var(--accent)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontWeight: 800, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          boxShadow: '0 8px 16px var(--accent-glow)'
                        }}
                      >
                        Next Module
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="save-button"
                        style={{
                          width: 'auto', 
                          padding: '1.1rem 3.5rem', 
                          background: 'var(--success)', 
                          color: '#fff',
                          borderRadius: '14px', 
                          fontWeight: 900,
                          boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.8rem'
                        }}
                      >
                        <Save size={20} />
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
