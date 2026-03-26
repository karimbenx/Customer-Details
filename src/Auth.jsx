import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogIn, UserPlus, Lock, User, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin ? { username, password } : { username, password, role };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (isLogin) {
          onLogin(data.user, data.token);
        } else {
          setIsLogin(true);
          setError('Signup successful! Please login.');
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection refused. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (isLogin && newRole === 'admin') {
      setUsername('admin');
      setPassword('admin');
    } else if (isLogin && newRole === 'employee') {
      setUsername('');
      setPassword('');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-home)',
      padding: '1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent)', 
            borderRadius: '10px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 16px var(--accent-glow)'
          }}>
            <Zap size={22} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>ClientSync</h1>
        </div>

        {/* Tab Control */}
        <div style={{ 
          display: 'flex', 
          background: 'var(--bg-home)', 
          padding: '0.4rem', 
          borderRadius: '12px', 
          marginBottom: '2rem' 
        }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              background: isLogin ? '#fff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: isLogin ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: isLogin ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              background: !isLogin ? '#fff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: !isLogin ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ 
            background: error.includes('successful') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: error.includes('successful') ? 'var(--success)' : 'var(--danger)',
            padding: '0.75rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem' }}>Username</label>
            <input 
              className="input-field" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              style={{ padding: '0.65rem 1rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem' }}>Password</label>
            <input 
              className="input-field" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: '0.65rem 1rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem' }}>{isLogin ? 'Role Access' : 'Assign Role'}</label>
            <select 
              className="select-field"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{ padding: '0.65rem 1rem' }}
            >
              <option value="employee">Employee / User</option>
              <option value="admin">Administrator (Manager)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.85rem', 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 16px var(--accent-glow)'
            }}
          >
            {loading ? 'Processing...' : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
