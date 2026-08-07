import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    // state
    const [portal, setPortal] = useState('customer'); // 'customer' | 'admin'
    const [mode, setMode] = useState('login');    // 'login' | 'register'

    const [form, setForm] = useState({ name: '', email: '', password: '', adminCode: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let user;
            if (mode === 'login') {
                user = await login(form.email, form.password, portal === 'admin' ? form.adminCode : '');
            } else {
                if (!form.name.trim()) { setError('Full name is required.'); setLoading(false); return; }
                user = await register(
                    form.name, form.email, form.password,
                    portal,
                    portal === 'admin' ? form.adminCode : ''
                );
            }
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const quickCustomer = () => {
        setPortal('customer');
        setMode('login');
        setForm({ name: '', email: 'rahul@example.com', password: 'pass123', adminCode: '' });
        setError('');
    };

    const quickAdmin = () => {
        setPortal('admin');
        setMode('login');
        setForm({ name: '', email: 'admin@lendai.in', password: 'admin123', adminCode: 'LENDAI-ADMIN-2026' });
        setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card card" style={{ padding: 36, position: 'relative' }}>

                {/* Portal Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
                    <button onClick={() => { setPortal('customer'); setError(''); }}
                        style={{
                            flex: 1, padding: 12, borderRadius: 12, border: '2px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                            background: portal === 'customer' ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                            borderColor: portal === 'customer' ? 'var(--indigo)' : 'var(--border)',
                            color: portal === 'customer' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}>
                        👤 Customer
                    </button>
                    <button onClick={() => { setPortal('admin'); setError(''); }}
                        style={{
                            flex: 1, padding: 12, borderRadius: 12, border: '2px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                            background: portal === 'admin' ? 'rgba(244,63,94,0.1)' : 'var(--bg-secondary)',
                            borderColor: portal === 'admin' ? 'var(--rose)' : 'var(--border)',
                            color: portal === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}>
                        🔐 Admin
                    </button>
                </div>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>🏦</div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
                        {portal === 'admin' ? 'Admin Portal' : 'Customer Portal'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        AI-Driven Dynamic Underwriting Platform
                    </p>
                </div>

                {/* Action Toggle (Sign In / Register) */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, marginBottom: 20 }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }}
                            style={{
                                flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                                background: mode === m ? 'var(--gradient-primary)' : 'transparent',
                                color: mode === m ? 'white' : 'var(--text-secondary)'
                            }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {portal === 'admin' && (
                        <div className="form-group">
                            <label className="form-label" style={{ color: '#f43f5e' }}>Admin Invite Code (Required)</label>
                            <input className="form-input" type="text" placeholder="LENDAI-ADMIN-XXXX"
                                value={form.adminCode} onChange={e => set('adminCode', e.target.value)} required
                                style={{ fontFamily: 'monospace', borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.02)' }} />
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" type="text" placeholder="Full Name"
                                value={form.name} onChange={e => set('name', e.target.value)} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" placeholder="you@example.com"
                            value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="••••••••"
                            value={form.password} onChange={e => set('password', e.target.value)} required
                            minLength={mode === 'register' ? 6 : undefined} />
                    </div>

                    <button className={`btn ${portal === 'admin' ? 'btn-danger' : 'btn-primary'}`} type="submit" disabled={loading}
                        style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 8 }}>
                        {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
                    </button>
                </form>

                {/* Quick demo buttons */}
                <div className="auth-divider" style={{ marginTop: 28, marginBottom: 20 }}>Quick Demo Login</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={quickCustomer}>👤 Customer</button>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: 12, borderColor: 'rgba(244,63,94,0.3)' }} onClick={quickAdmin}>🔐 Admin</button>
                </div>

                <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    🔒 JWT Auth · DPDP Act 2023 Compliant
                </div>
            </div>
        </div>
    );
}
