import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('summary');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [pastRecords, setPastRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // State for accordion expansion
  const [expandedSections, setExpandedSections] = useState(['customerDetails']);

  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPastRecords(data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await fetchPlans();
      setLoading(false);
    };
    init();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setFormData(result.data);
        setSelectedId(result.data._id);
        setIsSaved(true);
        setShowToast(true);
        await fetchPlans();
        setTimeout(() => {
          setIsSaved(false);
          setShowToast(false);
        }, 5000);
      } else {
        alert('Failed to save: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error connecting to server');
    } finally {
      setIsSaving(false);
    }
  };

  const loadPlan = (plan) => {
    setFormData(plan);
    setSelectedId(plan._id);
    // Expand first section by default when loading
    setExpandedSections(['customerDetails']);
  };

  const createNewPlan = () => {
    setFormData(initialFormState);
    setSelectedId(null);
    setExpandedSections(['customerDetails']);
  };

  const deletePlan = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/plan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPlans();
        if (selectedId === id) createNewPlan();
      }
    } catch (err) {
      alert('Error deleting plan');
    }
  };

  const sections = [
    {
      id: 'customerDetails',
      title: 'Customer Overview',
      subtitle: 'Primary contact information and profile',
      icon: <Briefcase size={20} />,
      content: (
        <div className="grid gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Company Name</label>
              <input
                className="input-field"
                placeholder="e.g. Acme Corp"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Business Industry</label>
              <input
                className="input-field"
                placeholder="e.g. Technology, Manufacturing..."
                value={formData.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input
              className="input-field"
              placeholder="Primary Point of Contact"
              value={formData.contactPerson || ''}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="contact@company.com"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone / WhatsApp</label>
              <input
                className="input-field"
                placeholder="+1 (555) 000-0000"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accountPotential',
      title: 'Account Potential',
      subtitle: 'History, whitespace and strategic goals',
      icon: <TrendingUp size={20} />,
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Review & History</label>
            <textarea
              className="textarea-field"
              placeholder="Enter current status and history..."
              value={formData.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Expectations</label>
            <textarea
              className="textarea-field"
              placeholder="What are the customer expectations?"
              value={formData.expectations}
              onChange={(e) => handleInputChange('expectations', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Goals</label>
            <input
              className="input-field"
              placeholder="Set strategic goals..."
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'customerPriorities',
      title: 'Customer Priorities',
      subtitle: 'Business drivers and technology focus',
      icon: <Target size={20} />,
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Primary XR Focus</label>
            <select
              className="select-field"
              value={formData.xrFocus}
              onChange={(e) => handleInputChange('xrFocus', e.target.value)}
            >
              <option value="None">None</option>
              <option value="AR">Augmented Reality (AR)</option>
              <option value="VR">Virtual Reality (VR)</option>
              <option value="MR">Mixed Reality (MR)</option>
              <option value="AI">AI Integration</option>
            </select>
          </div>
          <div className="form-group">
            <label>Business Landscape</label>
            <textarea
              className="textarea-field"
              placeholder="Describe market landscape..."
              value={formData.landscape}
              onChange={(e) => handleInputChange('landscape', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Key Business Drivers</label>
            <textarea
              className="textarea-field"
              placeholder="Primary drivers for innovation..."
              value={formData.drivers}
              onChange={(e) => handleInputChange('drivers', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'opportunityId',
      title: 'Opportunity Identification',
      subtitle: 'Sales opportunities and strategy',
      icon: <Lightbulb size={20} />,
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Can we sell extra items?</label>
            <select
              className="select-field"
              value={formData.canSellExtra}
              onChange={(e) => handleInputChange('canSellExtra', e.target.value)}
            >
              <option value="Unsure">Select...</option>
              <option value="Definitely">Definitely (High Potential)</option>
              <option value="Maybe">Maybe (Discussion Needed)</option>
              <option value="Unlikely">Unlikely (Currently Satisfied)</option>
              <option value="No">No (Oversold)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Specific Opportunities</label>
            <textarea
              className="textarea-field"
              placeholder="Detail specific products or services..."
              value={formData.opportunities}
              onChange={(e) => handleInputChange('opportunities', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Primary Strategy</label>
            <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="strategy"
                  value="Protect"
                  style={{ width: '18px', height: '18px' }}
                  checked={formData.strategy === 'Protect'}
                  onChange={(e) => handleInputChange('strategy', e.target.value)}
                /> Protect
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="strategy"
                  value="Grow"
                  style={{ width: '18px', height: '18px' }}
                  checked={formData.strategy === 'Grow'}
                  onChange={(e) => handleInputChange('strategy', e.target.value)}
                /> Grow
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'relationship',
      title: 'Relationship Alignment',
      subtitle: 'Stakeholders and influence mapping',
      icon: <Users size={20} />,
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Key Executives & Stakeholders</label>
            <textarea
              className="textarea-field"
              placeholder="List influential names and their impact..."
              value={formData.stakeholders}
              onChange={(e) => handleInputChange('stakeholders', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Advancement Plan</label>
            <textarea
              className="textarea-field"
              placeholder="Plan to advance influential relationships..."
              value={formData.plan}
              onChange={(e) => handleInputChange('plan', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'actionPlan',
      title: 'Action Plan Coordination',
      subtitle: 'Critical actions and risk mitigation',
      icon: <ClipboardCheck size={20} />,
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Critical Actions</label>
            <textarea
              className="textarea-field"
              placeholder="What needs to be done immediately?"
              value={formData.actions}
              onChange={(e) => handleInputChange('actions', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Risk Mitigation</label>
            <textarea
              className="textarea-field"
              placeholder="Potential hurdles and how to avoid them..."
              value={formData.riskMitigation}
              onChange={(e) => handleInputChange('riskMitigation', e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loader">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '2rem 1rem' }}>
      {/* Records View */}
      {view === 'records' && (
        <div className="main-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Strategic Records</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage and review your saved client profiles</p>
            </div>
            <button
              onClick={() => {
                createNewPlan();
                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
              }}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
              }}
            >
              + Create New Profile
            </button>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {pastRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>No records found. Start by creating a new client profile.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Industry</th>
                      <th>Strategy</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastRecords.map((plan) => (
                      <tr key={plan._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{plan.companyName}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{plan.contactPerson}</td>
                        <td>
                          <span className="badge badge-primary">{plan.industry}</span>
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: plan.strategy === 'Grow' ? 'var(--success)' : 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {plan.strategy === 'Grow' ? <TrendingUp size={14} /> : <Target size={14} />}
                            {plan.strategy}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                loadPlan(plan);
                                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
                              }}
                              style={{
                                background: 'var(--bg-home)',
                                color: 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}
                            >Edit</button>
                            <button
                              onClick={(e) => deletePlan(plan._id, e)}
                              style={{
                                background: 'transparent',
                                color: 'var(--danger)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}
                            >Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form View */}
      {view === 'form' && (
        <div className="main-container">
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                  background: 'var(--success)',
                  color: '#fff',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  zIndex: 1000,
                  fontWeight: 700,
                  boxShadow: '0 10px 15px rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <ClipboardCheck size={20} />
                Profile Synchronized
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {selectedId ? 'Edit Profile' : 'Client Profile Intake'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
                Populate all strategic dimensions to synchronize with the enterprise database.
              </p>
            </div>
            {selectedId && (
              <button
                onClick={createNewPlan}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--bg-home)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                + Reset Form
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {sections.map((section) => (
              <div
                key={section.id}
                className={`accordion-section ${expandedSections.includes(section.id) ? 'expanded' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="accordion-title-container">
                    <div className="accordion-icon-box">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="accordion-title">{section.title}</h3>
                      <p className="accordion-description">{section.subtitle}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.includes(section.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={20} color="var(--text-muted)" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="accordion-content">
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                          {section.content}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: '0 -10px 15px -10px rgba(0,0,0,0.05)'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '1.25rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '12px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
            >
              {isSaving ? (
                <>Synchronizing...</>
              ) : (
                <>
                  <Save size={20} />
                  Synchronize to Database
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPlanningDashboard;

