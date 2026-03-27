import React, { useCallback, useState } from 'react';
import { 
  Users, 
  BarChart3, 
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AccountPlanningDashboard from './AccountPlanningDashboard';
import IntelligenceDashboard from './IntelligenceDashboard';
import Auth from './Auth';

const AUTH_STORAGE_KEY = 'clientsync-auth-session';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TAB_ID_STORAGE_KEY = 'clientsync-tab-id';
const TAB_HEARTBEAT_MS = 2000;
const TAB_STALE_MS = 6000;
const SESSION_PING_MS = 3000;

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

const getTabId = () => {
  const existingTabId = window.sessionStorage.getItem(TAB_ID_STORAGE_KEY);
  if (existingTabId) return existingTabId;

  const newTabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(TAB_ID_STORAGE_KEY, newTabId);
  return newTabId;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('client-details'); // Default to Client Details
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const tabId = getTabId();

  const notifyServerLogout = useCallback((sessionToken, keepalive = false) => {
    if (!sessionToken) return Promise.resolve();

    return fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`
      },
      keepalive
    });
  }, []);

  const handleLogin = (u, t) => {
    const payload = decodeJwtPayload(t);
    const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;

    setAuthMessage('');
    setUser(u);
    setToken(t);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: u, token: t, expiresAt }));
  };

  const clearSession = useCallback((message = '', options = {}) => {
    const { preserveStoredSession = false } = options;
    setUser(null);
    setToken(null);
    setAuthMessage(message);
    if (!preserveStoredSession) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    try {
      const parsedSession = savedSession ? JSON.parse(savedSession) : null;
      if (parsedSession?.token) {
        await notifyServerLogout(parsedSession.token);
      }
    } catch (error) {
      // Best-effort logout; always clear local state.
    } finally {
      clearSession();
    }
  }, [clearSession, notifyServerLogout]);

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
    if (!user?.username || !token) return undefined;

    const lockKey = `clientsync-active-tab:${user.username}`;
    const readLock = () => {
      try {
        const raw = window.localStorage.getItem(lockKey);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    };

    const claimLock = () => {
      const existingLock = readLock();
      const now = Date.now();
      const lockIsActive =
        existingLock &&
        existingLock.tabId !== tabId &&
        now - existingLock.heartbeatAt < TAB_STALE_MS;

      if (lockIsActive) {
        clearSession('This account is already open in another tab', { preserveStoredSession: true });
        return false;
      }

      window.localStorage.setItem(
        lockKey,
        JSON.stringify({ tabId, heartbeatAt: now })
      );
      return true;
    };

    if (!claimLock()) return undefined;

    const heartbeatId = window.setInterval(() => {
      const currentLock = readLock();
      if (currentLock?.tabId && currentLock.tabId !== tabId) {
        clearSession('This account is already open in another tab', { preserveStoredSession: true });
        return;
      }

      window.localStorage.setItem(
        lockKey,
        JSON.stringify({ tabId, heartbeatAt: Date.now() })
      );
    }, TAB_HEARTBEAT_MS);

    const handleStorage = (event) => {
      if (event.key !== lockKey || !event.newValue) return;

      try {
        const nextLock = JSON.parse(event.newValue);
        if (nextLock.tabId !== tabId) {
          clearSession('This account is already open in another tab', { preserveStoredSession: true });
        }
      } catch (error) {
        // Ignore malformed storage updates.
      }
    };

    const releaseLock = () => {
      const currentLock = readLock();
      if (currentLock?.tabId === tabId) {
        window.localStorage.removeItem(lockKey);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('beforeunload', releaseLock);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('beforeunload', releaseLock);
      releaseLock();
    };
  }, [clearSession, tabId, token, user?.username]);

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

  React.useEffect(() => {
    if (!token || !user) return undefined;

    const pingSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/session/ping`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          clearSession();
        }
      } catch (error) {
        // Ignore transient network issues; auth timeout is handled separately.
      }
    };

    pingSession();
    const intervalId = window.setInterval(pingSession, SESSION_PING_MS);
    return () => window.clearInterval(intervalId);
  }, [clearSession, token, user]);

  React.useEffect(() => {
    if (!token) return undefined;

    const releaseServerSession = () => {
      notifyServerLogout(token, true).catch(() => {
        // Ignore unload-time network failures.
      });
    };

    window.addEventListener('pagehide', releaseServerSession);
    window.addEventListener('beforeunload', releaseServerSession);

    return () => {
      window.removeEventListener('pagehide', releaseServerSession);
      window.removeEventListener('beforeunload', releaseServerSession);
    };
  }, [notifyServerLogout, token]);

  if (!isSessionReady) return <div className="loader">Restoring session...</div>;

  if (!user) return <Auth onLogin={handleLogin} initialError={authMessage} />;

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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <img src="/Logo.svg" alt="ClientSync" className="brand-logo brand-logo-header" />
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
