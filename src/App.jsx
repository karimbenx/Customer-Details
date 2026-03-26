import React, { useState } from 'react';
import { 
  Users, 
  Zap, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AccountPlanningDashboard from './AccountPlanningDashboard';
import IntelligenceDashboard from './IntelligenceDashboard';

const App = () => {
  const [activeTab, setActiveTab] = useState('client-details'); // Default to Client Details

  const navItems = [
    { id: 'client-details', label: 'Client Profiles', icon: <Users size={18} /> },
    { id: 'records', label: 'Database', icon: <BarChart3 size={18} /> }
  ];

  React.useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Professional Header - Fixed */}
      <header style={{ 
        height: '72px',
        background: '#fff', 
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        justifyContent: 'space-between',
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ 
            fontWeight: 900, 
            fontSize: '1.4rem', 
            color: 'var(--primary)', 
            letterSpacing: '-0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span>CLIENT<span style={{ color: 'var(--accent)' }}>SYNC</span></span>
          </div>

          <nav style={{ display: 'flex', height: '72px' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '0 1.5rem',
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                  color: activeTab === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === item.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <div style={{ opacity: activeTab === item.id ? 1 : 0.7 }}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-version" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: 'var(--bg-home)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px'
          }}>
            Enterprise / <span style={{ color: 'var(--accent)' }}>v3.0 PRO</span>
          </div>
        </div>
      </header>

      {/* Main Section - Internal Scrolling */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%' }}
          >
            <AccountPlanningDashboard 
              view={activeTab === 'records' ? 'records' : 'form'} 
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};


export default App;
