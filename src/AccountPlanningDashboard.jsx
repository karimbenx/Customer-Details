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

  const initialFormState = {
    customerDetails: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: ''
    },
    accountPotential: {
      review: '',
      expectations: '',
      goals: ''
    },
    customerPriorities: {
      xrFocus: 'None',
      landscape: '',
      drivers: ''
    },
    opportunityIdentification: {
      canSellExtra: 'Unsure',
      opportunities: '',
      strategy: 'Grow'
    },
    relationshipAlignment: {
      stakeholders: '',
      plan: ''
    },
    actionPlanCoordination: {
      actions: '',
      riskMitigation: ''
    }
  };

  // Form State
  const [formData, setFormData] = useState(initialFormState);

  // Fetch all plans
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

  // Fetch on load
  React.useEffect(() => {
    const init = async () => {
      await fetchPlans();
      setLoading(false);
    };
    init();
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
  };

  const createNewPlan = () => {
    setFormData(initialFormState);
    setSelectedId(null);
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
      title: '00 Customer Overview',
      icon: <Briefcase color="var(--primary)" size={24} />,
      description: 'Primary contact information and company profile.',
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Company Name</label>
            <input 
              className="input-field" 
              placeholder="e.g. Acme Corp"
              value={formData.customerDetails?.companyName || ''}
              onChange={(e) => handleInputChange('customerDetails', 'companyName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Business Industry</label>
            <input 
              className="input-field" 
              placeholder="e.g. Technology, Manufacturing..."
              value={formData.customerDetails?.industry || ''}
              onChange={(e) => handleInputChange('customerDetails', 'industry', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input 
              className="input-field" 
              placeholder="Primary Point of Contact"
              value={formData.customerDetails?.contactPerson || ''}
              onChange={(e) => handleInputChange('customerDetails', 'contactPerson', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="input-field" 
              type="email"
              placeholder="contact@company.com"
              value={formData.customerDetails?.email || ''}
              onChange={(e) => handleInputChange('customerDetails', 'email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone / WhatsApp</label>
            <input 
              className="input-field" 
              placeholder="+1 (555) 000-0000"
              value={formData.customerDetails?.phone || ''}
              onChange={(e) => handleInputChange('customerDetails', 'phone', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'accountPotential',
      title: '01 Account Potential',
      icon: <TrendingUp color="var(--accent-blue)" size={24} />,
      description: 'Review account history, determine "white space" and set goals for the next quarter.',
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Review & History</label>
            <textarea 
              className="textarea-field" 
              placeholder="Enter current status and history..."
              value={formData.accountPotential.review}
              onChange={(e) => handleInputChange('accountPotential', 'review', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Expectations</label>
            <textarea 
              className="textarea-field" 
              placeholder="What are the customer expectations?"
              value={formData.accountPotential.expectations}
              onChange={(e) => handleInputChange('accountPotential', 'expectations', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Goals</label>
            <input 
              className="input-field" 
              placeholder="Set strategic goals..."
              value={formData.accountPotential.goals}
              onChange={(e) => handleInputChange('accountPotential', 'goals', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'customerPriorities',
      title: '02 Customer Priorities',
      icon: <Target color="var(--accent-purple)" size={24} />,
      description: "Understand customer's business drivers and focus areas like AR/VR/XR.",
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Primary XR Focus</label>
            <select 
              className="select-field"
              value={formData.customerPriorities.xrFocus}
              onChange={(e) => handleInputChange('customerPriorities', 'xrFocus', e.target.value)}
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
              value={formData.customerPriorities.landscape}
              onChange={(e) => handleInputChange('customerPriorities', 'landscape', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Key Business Drivers</label>
            <textarea 
              className="textarea-field" 
              placeholder="Primary drivers for innovation..."
              value={formData.customerPriorities.drivers}
              onChange={(e) => handleInputChange('customerPriorities', 'drivers', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'opportunityId',
      title: '03 Opportunity Identification',
      icon: <Lightbulb color="var(--accent-orange)" size={24} />,
      description: 'Determine sales opportunities and decide whether we can upsell/cross-sell.',
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Can we sell extra items?</label>
            <select 
              className="select-field"
              value={formData.opportunityIdentification.canSellExtra}
              onChange={(e) => handleInputChange('opportunityIdentification', 'canSellExtra', e.target.value)}
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
              value={formData.opportunityIdentification.opportunities}
              onChange={(e) => handleInputChange('opportunityIdentification', 'opportunities', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Primary Strategy</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="strategy" 
                  value="Protect" 
                  checked={formData.opportunityIdentification.strategy === 'Protect'}
                  onChange={(e) => handleInputChange('opportunityIdentification', 'strategy', e.target.value)}
                /> Protect
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="strategy" 
                  value="Grow" 
                  checked={formData.opportunityIdentification.strategy === 'Grow'}
                  onChange={(e) => handleInputChange('opportunityIdentification', 'strategy', e.target.value)}
                /> Grow
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'relationship',
      title: '04 Relationship Alignment',
      icon: <Users color="var(--accent-green)" size={24} />,
      description: 'Identify influential relationships critical to account success.',
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Key Executives & Stakeholders</label>
            <textarea 
              className="textarea-field" 
              placeholder="List influential names and their impact..."
              value={formData.relationshipAlignment.stakeholders}
              onChange={(e) => handleInputChange('relationshipAlignment', 'stakeholders', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Advancement Plan</label>
            <textarea 
              className="textarea-field" 
              placeholder="Plan to advance influential relationships..."
              value={formData.relationshipAlignment.plan}
              onChange={(e) => handleInputChange('relationshipAlignment', 'plan', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'actionPlan',
      title: '05 Action Plan Coordination',
      icon: <ClipboardCheck color="var(--accent-red)" size={24} />,
      description: 'Assign critical actions and mitigate risks for the account team.',
      content: (
        <div className="grid gap-4">
          <div className="form-group">
            <label>Critical Actions</label>
            <textarea 
              className="textarea-field" 
              placeholder="What needs to be done immediately?"
              value={formData.actionPlanCoordination.actions}
              onChange={(e) => handleInputChange('actionPlanCoordination', 'actions', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Risk Mitigation</label>
            <textarea 
              className="textarea-field" 
              placeholder="Potential hurdles and how to avoid them..."
              value={formData.actionPlanCoordination.riskMitigation}
              onChange={(e) => handleInputChange('actionPlanCoordination', 'riskMitigation', e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
        <p>Loading Enterprise Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-color)' }}>
      {/* Records View: Professional White Table */}
      {view === 'records' && (
        <div style={{ flex: 1, padding: '2rem 1rem' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Saved Records</h1>
                 <button 
                  onClick={() => {
                     createNewPlan();
                     window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                 >
                    + Add New Entry
                 </button>
              </div>

              {pastRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                   No records discovered yet.
                </div>
              ) : (
                <div className="main-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                         <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>COMPANY</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>INDUSTRY</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>STRATEGY</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>ACTIONS</th>
                         </tr>
                      </thead>
                      <tbody>
                         {pastRecords.map((plan) => (
                            <tr key={plan._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                               <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{plan.customerDetails?.companyName}</td>
                               <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{plan.customerDetails?.contactPerson}</td>
                               <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                  <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                     {plan.customerDetails?.industry}
                                  </span>
                               </td>
                               <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                  <span style={{ color: plan.opportunityIdentification?.strategy === 'Grow' ? 'var(--accent-green)' : 'var(--accent-orange)', fontWeight: 600 }}>
                                     {plan.opportunityIdentification?.strategy}
                                  </span>
                               </td>
                               <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                     <button 
                                      onClick={() => {
                                         loadPlan(plan);
                                         window.dispatchEvent(new CustomEvent('changeTab', { detail: 'client-details' }));
                                      }}
                                      style={{ background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                     >Edit</button>
                                     <button 
                                      onClick={(e) => deletePlan(plan._id, e)}
                                      style={{ background: 'transparent', color: 'var(--accent-red)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
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

      {/* Form View: Professional Clean Input */}
      {view === 'form' && (
        <div style={{ flex: 1, padding: '2rem 1rem' }}>
          <div className="main-card" style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            background: '#fff', 
            padding: '2.5rem', 
            borderRadius: '16px', 
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <AnimatePresence>
              {showToast && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--accent-green)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', zIndex: 1000, fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  Stored Successfully
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{selectedId ? 'Modify Record' : 'Client Profile Intake'}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill out the details below to sync with the central database.</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
              {sections.map((section) => (
                <div key={section.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '2rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ color: 'var(--primary)' }}>{section.icon}</div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{section.title}</h2>
                   </div>
                   <div style={{ paddingLeft: '0' }}>
                     {section.content}
                   </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                  flex: 2,
                  minWidth: '200px',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                {isSaving ? 'Syncing...' : 'Sync to Records'}
              </button>
              
              {selectedId && (
                 <button 
                  onClick={createNewPlan}
                  style={{ 
                    flex: 1,
                    minWidth: '150px',
                    padding: '1rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-light)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                 >
                    Start New
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPlanningDashboard;
