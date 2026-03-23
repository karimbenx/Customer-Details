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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'client-details', label: 'Client Details', icon: <Users size={18} /> },
    { id: 'records', label: 'Records', icon: <BarChart3 size={18} /> }
  ];

  React.useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      color: '#1e293b', 
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Bright Header */}
      <header style={{ 
        height: 'auto',
        minHeight: '70px',
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '0.5rem 1.5rem',
        justifyContent: 'space-between',
        zIndex: 100,
        position: 'sticky',
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: '1.25rem', 
            color: '#2563eb', 
            letterSpacing: '-0.03em' 
          }}>CLIENT<span style={{ color: '#1e293b' }}>SYNC</span></div>

          <nav style={{ display: 'flex' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '1rem 1.25rem',
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === item.id ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === item.id ? '#2563eb' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === item.id ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-version" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Desktop / <span style={{ color: '#2563eb' }}>v2.0 Light</span>
          </div>
        </div>
      </header>

      {/* Responsive Main Section */}
      <main style={{ flex: 1, width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ width: '100%' }}
          >
            {activeTab === 'client-details' && (
              <AccountPlanningDashboard view="form" />
            )}

            {activeTab === 'records' && (
              <AccountPlanningDashboard view="records" />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
