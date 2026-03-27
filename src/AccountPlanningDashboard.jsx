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
    title: 'Overview',
    subtitle: 'Primary contact and profile',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Acme Corp', width: 'half' },
      { key: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Technology', width: 'half' },
      { key: 'contactPerson', label: 'Contact', type: 'text', placeholder: 'Full name', width: 'half' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@company.com', width: 'half' },
      { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: 'WhatsApp number', width: 'half' },
      { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+1 555-0123', width: 'half' }
    ]
  },
  {
    id: 'accountPotential',
    title: 'Potential',
    subtitle: 'History and strategic goals',
    fields: [
      { key: 'review', label: 'History', type: 'textarea', placeholder: 'Recent history...', width: 'half' },
      { key: 'expectations', label: 'Needs', type: 'textarea', placeholder: 'Customer needs...', width: 'half' },
      { key: 'goals', label: 'Goals', type: 'textarea', placeholder: 'Top goals...', width: 'half' },
      { key: 'proposal', label: 'Proposal', type: 'number', placeholder: 'Proposal amount', width: 'half' },
      { key: 'revisedProposal', label: 'Revised', type: 'number', placeholder: 'Revised amount', width: 'half' }
    ]
  },
  {
    id: 'priorities',
    title: 'Priorities',
    subtitle: 'Drivers and tech focus',
    fields: [
      { key: 'xrFocus', label: 'Focus', type: 'select', width: 'half', options: ['None', 'AR', 'VR', 'MR', 'AI', 'Experience Centre'] },
      { key: 'landscape', label: 'Landscape', type: 'textarea', placeholder: 'Market challenges...', width: 'half' },
      { key: 'drivers', label: 'Drivers', type: 'textarea', placeholder: 'What drives decisions?', width: 'half' }
    ]
  },
  {
    id: 'opportunity',
    title: 'Opportunities',
    subtitle: 'Sales and strategy',
    fields: [
      { key: 'canSellExtra', label: 'Upsell', type: 'select', width: 'half', options: ['Unsure', 'Definitely', 'Maybe', 'Unlikely'] },
      { key: 'opportunities', label: 'Opportunities', type: 'textarea', placeholder: 'Growth paths...', width: 'half' },
      { key: 'strategy', label: 'Strategy', type: 'radio', width: 'half', options: ['Protect', 'Grow'], descriptions: { Protect: 'Defend existing accounts and maintain satisfaction.', Grow: 'Expand footprint and increase account value.' } }
    ]
  },
  {
    id: 'relationship',
    title: 'Relations',
    subtitle: 'Stakeholders and mapping',
    fields: [
      { key: 'stakeholders', label: 'Key Executives & Stakeholders', type: 'textarea', placeholder: 'List influential points of contact...', width: 'half' },
      { key: 'plan', label: 'Advancement Plan', type: 'textarea', placeholder: 'How will we strengthen these ties?', width: 'half' }
    ]
  },
  {
    id: 'action',
    title: 'Action',
    subtitle: 'Critical actions and risk',
    fields: [
      { key: 'actions', label: 'Critical Actions', type: 'textarea', placeholder: 'Immediate steps required...', width: 'half' },
      { key: 'riskMitigation', label: 'Risk Mitigation', type: 'textarea', placeholder: 'Potential blockers and solutions...', width: 'half' }
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

const sectionDisplayTitles = {
  customerDetails: 'Overview',
  accountPotential: 'Potential',
  priorities: 'Priorities',
  opportunity: 'Opportunities',
  relationship: 'Relations',
  action: 'Action'
};

const normalizeField = (field, defaultField) => {
  const merged = { ...defaultField, ...(field || {}) };
  if (merged.key === 'xrFocus') {
    return {
      ...merged,
      label: 'Focus',
      width: 'half',
      options: Array.from(new Set([...(merged.options || []), 'Experience Centre']))
    };
  }
  if (merged.key === 'contactPerson') {
    return {
      ...merged,
      label: 'Contact',
      placeholder: 'Full name',
      width: 'half'
    };
  }
  if (merged.key === 'phone') {
    return {
      ...merged,
      label: 'Phone Number',
      placeholder: '+1 555-0123',
      width: 'half'
    };
  }
  if (merged.key === 'goals') {
    return {
      ...merged,
      label: 'Goals',
      placeholder: 'Top goals...',
      width: 'half'
    };
  }
  if (merged.key === 'landscape') {
    return {
      ...merged,
      label: 'Landscape',
      placeholder: 'Market challenges...',
      width: 'half'
    };
  }
  if (merged.key === 'drivers') {
    return {
      ...merged,
      label: 'Drivers',
      placeholder: 'What drives decisions?',
      width: 'half'
    };
  }
  if (merged.key === 'canSellExtra') {
    return {
      ...merged,
      label: 'Upsell',
      width: 'half'
    };
  }
  if (merged.key === 'opportunities') {
    return {
      ...merged,
      label: 'Opportunities',
      placeholder: 'Growth paths...',
      width: 'half'
    };
  }
  if (merged.key === 'strategy') {
    return {
      ...merged,
      label: 'Strategy',
      width: 'half'
    };
  }
  if (['review', 'expectations', 'stakeholders', 'plan', 'actions', 'riskMitigation'].includes(merged.key)) {
    return {
      ...merged,
      width: 'half'
    };
  }
  return merged;
};

const normalizeFormConfig = (config) => {
  const incomingSections = Array.isArray(config) ? config : [];
  const normalizedDefaultSections = DEFAULT_FORM_CONFIG.map((defaultSection) => {
    const incomingSection = incomingSections.find((section) => section.id === defaultSection.id);
    if (!incomingSection) return defaultSection;

    const incomingFields = Array.isArray(incomingSection.fields) ? incomingSection.fields : [];
    const mergedDefaultFields = defaultSection.fields.map((defaultField) =>
      normalizeField(incomingFields.find((field) => field.key === defaultField.key), defaultField)
    );
    const extraFields = incomingFields.filter((field) => !defaultSection.fields.some((defaultField) => defaultField.key === field.key));
    return {
      ...defaultSection,
      ...incomingSection,
      fields: [...mergedDefaultFields, ...extraFields]
    };
  });

  const extraSections = incomingSections.filter((section) => !DEFAULT_FORM_CONFIG.some((defaultSection) => defaultSection.id === section.id));
  return [...normalizedDefaultSections, ...extraSections];
};

const createEmptyField = () => ({
  key: `customField${Date.now()}`,
  label: 'New Field',
  type: 'text',
  placeholder: '',
  width: 'full'
});

const createEmptySection = () => ({
  id: `customSection${Date.now()}`,
  title: 'New Card',
  subtitle: 'Custom section',
  fields: [createEmptyField()]
});

const buildEmptyFormData = (config, source = {}) => {
  const next = { ...source };
  config.forEach((section) => {
    (section.fields || []).forEach((field) => {
      if (!(field.key in next)) {
        next[field.key] = field.type === 'radio' ? field.options?.[0] || '' : '';
      }
    });
  });
  return next;
};

const ensureAdditionalContacts = (value) => (
  Array.isArray(value)
    ? value.map((entry) => ({
        name: entry?.name || '',
        phone: entry?.phone || '',
        email: entry?.email || '',
        whatsapp: entry?.whatsapp || ''
      }))
    : []
);

const AccountPlanningDashboard = ({ view = 'form', user, token }) => {
  const [formData, setFormData] = useState(buildEmptyFormData(DEFAULT_FORM_CONFIG, {
    companyName: '',
    contactPerson: '',
    additionalContacts: [],
    email: '',
    phone: '',
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
  }));

  const [pastRecords, setPastRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [formConfig, setFormConfig] = useState(DEFAULT_FORM_CONFIG);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState('');
  const [optionDrafts, setOptionDrafts] = useState({});

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
        const normalizedConfig = normalizeFormConfig(data);
        setFormConfig(normalizedConfig);
        setFormData((prev) => buildEmptyFormData(normalizedConfig, prev));
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

  useEffect(() => {
    if (!showCustomizer) return;

    const nextDrafts = {};
    formConfig.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'select' || field.type === 'radio') {
          nextDrafts[`${section.id}.${field.key}`] = (field.options || []).join(', ');
        }
      });
    });
    setOptionDrafts(nextDrafts);
  }, [formConfig, showCustomizer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const additionalContacts = ensureAdditionalContacts(formData.additionalContacts);

  const addAdditionalContact = () => {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: [...ensureAdditionalContacts(prev.additionalContacts), { name: '', phone: '', email: '', whatsapp: '' }]
    }));
  };

  const updateAdditionalContact = (index, field, value) => {
    setFormData((prev) => {
      const nextContacts = ensureAdditionalContacts(prev.additionalContacts);
      nextContacts[index] = {
        ...nextContacts[index],
        [field]: value
      };
      return { ...prev, additionalContacts: nextContacts };
    });
  };

  const removeAdditionalContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: ensureAdditionalContacts(prev.additionalContacts).filter((_, contactIndex) => contactIndex !== index)
    }));
  };

  const sections = formConfig.map((section) => ({
    ...section,
    icon: sectionIcons[section.id] || <Briefcase />
  }));

  const renderField = (field, section) => {
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
      const textareaSizeClass = section?.id === 'accountPotential'
        ? field.width === 'half'
          ? 'textarea-field-account-half'
          : 'textarea-field-account-full'
        : field.width === 'half'
          ? 'textarea-field-half'
          : 'textarea-field-full';

      return (
        <textarea
          className={`textarea-field ${textareaSizeClass}`}
          placeholder={field.placeholder || ''}
          value={formData[field.key] || ''}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
        />
      );
    }

    return (
      <input className="input-field" type={field.type || 'text'} placeholder={field.placeholder || ''} value={formData[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} />
    );
  };

  const renderSectionContent = (section) => {
    if (section.id === 'customerDetails') {
      return (
        <div className="customer-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', columnGap: '1.1rem', rowGap: '1rem' }}>
          <div className="form-group">
            <label>Company Name</label>
            <input className="input-field" type="text" placeholder="Acme Corp" value={formData.companyName || ''} onChange={(e) => handleInputChange('companyName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <input className="input-field" type="text" placeholder="e.g. Technology" value={formData.industry || ''} onChange={(e) => handleInputChange('industry', e.target.value)} />
          </div>
          <div />
          <div />

          <div className="form-group">
            <label>Contact</label>
            <input className="input-field" type="text" placeholder="Full name" value={formData.contactPerson || ''} onChange={(e) => handleInputChange('contactPerson', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="input-field" type="text" placeholder="+1 555-0123" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="input-field" type="email" placeholder="email@company.com" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>WhatsApp Number</label>
            <input className="input-field" type="text" placeholder="WhatsApp number" value={formData.whatsapp || ''} onChange={(e) => handleInputChange('whatsapp', e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '-0.15rem' }}>
            <button type="button" className="inline-add-button" onClick={addAdditionalContact}>
              <PlusCircle size={16} />
              Add Contact
            </button>
          </div>

          {additionalContacts.map((contact, index) => (
            <div
              key={`additional-contact-${index}`}
              className="additional-contact-row"
              style={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: '1.15fr 1fr 1.15fr 1fr auto',
                columnGap: '1rem',
                alignItems: 'end'
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{`Contact ${index + 2}`}</label>
                <input className="input-field" type="text" placeholder="Full name" value={contact.name} onChange={(e) => updateAdditionalContact(index, 'name', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{`Phone ${index + 2}`}</label>
                <input className="input-field" type="text" placeholder="+1 555-0000" value={contact.phone} onChange={(e) => updateAdditionalContact(index, 'phone', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{`Email ${index + 2}`}</label>
                <input className="input-field" type="email" placeholder="email@company.com" value={contact.email} onChange={(e) => updateAdditionalContact(index, 'email', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{`WhatsApp ${index + 2}`}</label>
                <input className="input-field" type="text" placeholder="WhatsApp number" value={contact.whatsapp} onChange={(e) => updateAdditionalContact(index, 'whatsapp', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ opacity: 0 }}>Remove</label>
                <button type="button" className="inline-remove-button" onClick={() => removeAdditionalContact(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

        </div>
      );
    }

    if (section.id === 'priorities') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '1.5rem', rowGap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Focus</label>
            <select className="select-field" value={formData.xrFocus || ''} onChange={(e) => handleInputChange('xrFocus', e.target.value)}>
              {(section.fields.find((field) => field.key === 'xrFocus')?.options || []).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Landscape</label>
            <textarea className="textarea-field textarea-field-half" placeholder="Market challenges..." value={formData.landscape || ''} onChange={(e) => handleInputChange('landscape', e.target.value)} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label>Drivers</label>
            <textarea className="textarea-field textarea-field-full" placeholder="What drives decisions?" value={formData.drivers || ''} onChange={(e) => handleInputChange('drivers', e.target.value)} />
          </div>
        </div>
      );
    }

    if (section.id === 'opportunity') {
      const selectedValue = formData.strategy || section.fields.find((field) => field.key === 'strategy')?.options?.[0] || '';
      const strategyField = section.fields.find((field) => field.key === 'strategy');

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '1.5rem', rowGap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Upsell</label>
            <select className="select-field" value={formData.canSellExtra || ''} onChange={(e) => handleInputChange('canSellExtra', e.target.value)}>
              {(section.fields.find((field) => field.key === 'canSellExtra')?.options || []).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Opportunities</label>
            <textarea className="textarea-field textarea-field-half" placeholder="Growth paths..." value={formData.opportunities || ''} onChange={(e) => handleInputChange('opportunities', e.target.value)} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label>Strategy</label>
            <div style={{ display: 'flex', gap: '1.5rem', padding: '0.35rem 0 0.1rem', flexWrap: 'wrap' }}>
              {(strategyField?.options || []).map((option) => (
                <div key={option}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <input type="radio" style={{ width: '18px', height: '18px' }} checked={selectedValue === option} onChange={() => handleInputChange('strategy', option)} />
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'var(--bg-home)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.5 }}>
              {strategyField?.descriptions?.[selectedValue] || ''}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: '1.5rem',
          rowGap: section.id === 'accountPotential' ? '0.75rem' : '1rem'
        }}
      >
        {section.fields.map((field) => (
          <div
            key={field.key}
            className={`form-group ${section.id === 'accountPotential' ? 'form-group-compact' : ''}`}
            style={{ gridColumn: field.width === 'half' ? 'span 1' : '1 / -1' }}
          >
            <label>{field.label}</label>
            {renderField(field, section)}
          </div>
        ))}
      </div>
    );
  };

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

  const addSection = () => {
    const nextConfig = [...formConfig, createEmptySection()];
    setFormConfig(nextConfig);
    setFormData((prev) => buildEmptyFormData(nextConfig, prev));
  };

  const addFieldToSection = (sectionId) => {
    const nextField = createEmptyField();
    const nextConfig = formConfig.map((section) => (
      section.id !== sectionId
        ? section
        : { ...section, fields: [...section.fields, nextField] }
    ));
    setFormConfig(nextConfig);
    setFormData((prev) => ({ ...buildEmptyFormData(nextConfig, prev), [nextField.key]: '' }));
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
      const draft = buildEmptyFormData(formConfig, {
      _id: record._id,
      companyName: record.companyName || '',
      contactPerson: record.contactPerson || '',
      additionalContacts: ensureAdditionalContacts(record.extraData?.additionalContacts),
      email: record.email || '',
      phone: record.phone || '',
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
      });
      Object.assign(draft, record.extraData || {});
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
    setFormData(buildEmptyFormData(formConfig, {
      companyName: '',
      contactPerson: '',
      additionalContacts: [],
      email: '',
      phone: '',
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
    }));
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                          <Zap size={12} color="var(--success)" fill="var(--success)" />
                          <span style={{ color: 'var(--text-muted)' }}>WA:</span> {r.whatsapp || 'N/A'}
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
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.85rem',
            marginBottom: 'clamp(0.8rem, 1.8vh, 1.25rem)',
            transition: 'all 0.3s ease'
          }}>
            <div className="section-tabs" style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              gap: activeSectionId ? '0.65rem' : '0.85rem',
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: user?.role === 'admin' ? 'calc(100% - clamp(180px, 15vw, 210px) - 0.85rem)' : '100%'
            }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSectionId(activeSectionId === s.id ? null : s.id)}
                  className={`accordion-section section-tab-button ${activeSectionId === s.id ? 'active' : ''}`}
                  style={{
                    padding: activeSectionId ? 'clamp(0.68rem, 1.1vh, 0.82rem) clamp(0.72rem, 0.9vw, 0.82rem)' : 'clamp(0.78rem, 1.3vh, 0.9rem) clamp(0.78rem, 0.95vw, 0.9rem)',
                    display: 'flex',
                    flexDirection: activeSectionId ? 'row' : 'column',
                    alignItems: activeSectionId ? 'center' : 'flex-start',
                    justifyContent: 'center',
                    gap: activeSectionId ? '0.45rem' : '0.55rem',
                    background: activeSectionId === s.id ? 'var(--accent)' : '#fff',
                    border: activeSectionId === s.id ? 'none' : '1px solid var(--border-light)',
                    color: activeSectionId === s.id ? '#fff' : 'inherit',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    minHeight: activeSectionId ? 'clamp(54px, 7vh, 62px)' : 'clamp(62px, 8vh, 72px)',
                    width: activeSectionId ? 'clamp(112px, 11vw, 128px)' : 'clamp(148px, 12vw, 164px)',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{React.cloneElement(s.icon, { size: activeSectionId ? 15 : 18 })}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ margin: 0, fontSize: activeSectionId ? '0.72rem' : '0.83rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{sectionDisplayTitles[s.id] || s.title}</h3>
                  </div>
                </button>
              ))}
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowCustomizer(true)}
                className="accordion-section section-tab-button section-tab-customize"
                style={{
                  padding: activeSectionId ? 'clamp(0.72rem, 1.1vh, 0.82rem) clamp(0.82rem, 1vw, 0.92rem)' : 'clamp(0.78rem, 1.3vh, 0.9rem) clamp(0.9rem, 1.1vw, 1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#fff',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  minHeight: activeSectionId ? 'clamp(54px, 7vh, 62px)' : 'clamp(62px, 8vh, 72px)',
                  minWidth: activeSectionId ? 'clamp(142px, 12vw, 156px)' : 'clamp(164px, 13vw, 178px)',
                  flex: '0 0 auto',
                  maxWidth: '100%',
                  boxShadow: 'var(--shadow-sm)',
                  alignSelf: 'flex-start'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {React.cloneElement(<ClipboardCheck />, { size: activeSectionId ? 15 : 18 })}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: activeSectionId ? '0.72rem' : '0.83rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    Customize Form
                  </h3>
                </div>
              </button>
            )}
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                <button onClick={addSection} style={{ padding: '0.7rem 1rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Add New Card
                </button>
              </div>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <button onClick={() => addFieldToSection(section.id)} style={{ padding: '0.55rem 0.85rem', background: 'var(--bg-home)', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}>
                        Add Field
                      </button>
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
                              <textarea
                                className="textarea-field"
                                style={{ minHeight: '88px' }}
                                value={optionDrafts[`${section.id}.${field.key}`] ?? ''}
                                onChange={(e) => setOptionDrafts((prev) => ({ ...prev, [`${section.id}.${field.key}`]: e.target.value }))}
                                onBlur={(e) => updateSectionField(section.id, field.key, 'options', e.target.value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))}
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
