import React, { useCallback, useState } from 'react';
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
import Auth from './Auth';

const AUTH_STORAGE_KEY = 'clientsync-auth-session';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch (error) {
    return null;
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState('client-details'); // Default to Client Details
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const handleLogin = (u, t) => {
    const payload = decodeJwtPayload(t);
    const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;

    setUser(u);
    setToken(t);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: u, token: t, expiresAt }));
  };

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const handleLogout = useCallback(async () => {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    try {
      const parsedSession = savedSession ? JSON.parse(savedSession) : null;
      if (parsedSession?.token) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parsedSession.token}`
          }
        });
      }
    } catch (error) {
      // Best-effort logout; always clear local state.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const navItems = [
    { id: 'client-details', label: 'Client Profiles', icon: <Users size={18} /> },
    { id: 'records', label: 'Database', icon: <BarChart3 size={18} /> }
  ];

  React.useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    const handleForceLogout = () => {
      clearSession();
    };
    window.addEventListener('changeTab', handleTabChange);
    window.addEventListener('forceLogout', handleForceLogout);
    return () => {
      window.removeEventListener('changeTab', handleTabChange);
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, [clearSession]);

  React.useEffect(() => {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!savedSession) {
      setIsSessionReady(true);
      return;
    }

    try {
      const parsedSession = JSON.parse(savedSession);
      if (!parsedSession?.token || !parsedSession?.user || !parsedSession?.expiresAt) {
        clearSession();
      } else if (Date.now() >= parsedSession.expiresAt) {
        clearSession();
      } else {
        setUser(parsedSession.user);
        setToken(parsedSession.token);
      }
    } catch (error) {
      clearSession();
    } finally {
      setIsSessionReady(true);
    }
  }, [clearSession]);

  React.useEffect(() => {
    if (!token) return undefined;

    const payload = decodeJwtPayload(token);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null;
    if (!expiresAt) return undefined;

    const timeoutMs = expiresAt - Date.now();
    if (timeoutMs <= 0) {
      clearSession();
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearSession();
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [clearSession, token]);

  if (!isSessionReady) return <div className="loader">Restoring session...</div>;

  if (!user) return <Auth onLogin={handleLogin} />;

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
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {user.role} / <span style={{ color: 'var(--accent)' }}>v3.0 PRO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-light)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{user.username}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user.role.toUpperCase()}</div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.05)',
                color: 'var(--danger)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Section - Internal Scrolling */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%' }}
          >
            <AccountPlanningDashboard 
              view={activeTab === 'records' ? 'records' : 'form'} 
              user={user}
              token={token}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};


export default App;
