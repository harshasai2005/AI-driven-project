import { useEffect, useState } from 'react';
import { useLoan } from '../../context/LoanContext';
import { api } from '../../api/client';

export default function AdminDashboard() {
    const { applications } = useLoan();
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        api.admin.stats().then(setStats).catch(() => { });
        api.notifications.getAll().then(setNotifications).catch(() => { });
    }, []);

    const unread = notifications.filter(n => !n.isRead);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (notif) => {
        try {
            await api.notifications.approveCustomer(notif.payload.userId, notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            showToast(`✅ ${notif.payload.userName}'s account approved successfully!`);
        } catch (err) {
            showToast('❌ Failed to approve customer', 'danger');
        }
    };

    const handleMarkAllRead = async () => {
        await api.notifications.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const recentApps = [...applications].slice(0, 5);
    const fraudCount = applications.filter(a => a.fraud?.isFlagged).length;
    const pendingCount = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
    const approvedCount = applications.filter(a => a.status === 'Approved').length;
    const avgScore = applications.length
        ? Math.round(applications.reduce((s, a) => s + (a.riskResult?.score || 0), 0) / applications.length) : 0;

    const statCards = [
        { label: 'Total Applications', value: stats?.total ?? applications.length, color: '#6366f1', icon: '📋' },
        { label: 'Pending Review', value: stats?.pending ?? pendingCount, color: '#f59e0b', icon: '⏳' },
        { label: 'Approved', value: stats?.approved ?? approvedCount, color: '#10b981', icon: '✅' },
        { label: 'Fraud Alerts', value: stats?.flagged ?? fraudCount, color: '#f43f5e', icon: '🚩' },
        { label: 'Avg AI Score', value: stats?.avgScore ?? avgScore, color: '#22d3ee', icon: '🤖' },
        { label: 'Customers', value: stats?.custCount ?? '—', color: '#a855f7', icon: '👥' },
    ];

    return (
        <div className="page-container">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
                </div>
            )}

            {/* Header + Notification Bell */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Admin <span>Dashboard</span></h1>
                    <p>Real-time portfolio overview and AI risk analytics</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotifPanel(!showNotifPanel)}
                        style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontSize: 20, color: 'var(--text-primary)', transition: 'all 0.2s' }}>
                        🔔
                        {unread.length > 0 && (
                            <span style={{ position: 'absolute', top: -6, right: -6, background: '#f43f5e', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {unread.length}
                            </span>
                        )}
                    </button>

                    {/* Notification Panel */}
                    {showNotifPanel && (
                        <div style={{ position: 'absolute', right: 0, top: 54, width: 380, background: '#0d1117', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>🔔 Notifications {unread.length > 0 && <span style={{ color: '#f43f5e' }}>({unread.length} unread)</span>}</span>
                                {unread.length > 0 && (
                                    <button onClick={handleMarkAllRead}
                                        style={{ background: 'none', border: 'none', color: 'var(--indigo-light)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                        ✅ No notifications
                                    </div>
                                ) : notifications.map(notif => (
                                    <div key={notif.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: notif.isRead ? 'transparent' : 'rgba(99,102,241,0.04)' }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                                                {notif.payload?.userAvatar || '👤'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    {notif.title}
                                                    {!notif.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{notif.message}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: notif.type === 'NEW_CUSTOMER' && !notif.isRead ? 10 : 0 }}>
                                                    {new Date(notif.created_at).toLocaleString('en-IN')}
                                                </div>
                                                {notif.type === 'NEW_CUSTOMER' && !notif.isRead && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button className="btn btn-success btn-sm" style={{ fontSize: 12 }} onClick={() => handleApprove(notif)}>
                                                            ✅ Approve Account
                                                        </button>
                                                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}
                                                            onClick={async () => { await api.notifications.markRead(notif.id); setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)); }}>
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {statCards.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}20`, fontSize: 22 }}>{s.icon}</div>
                        <div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending approvals from notifications */}
            {unread.filter(n => n.type === 'NEW_CUSTOMER').length > 0 && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
                    <div className="card-title" style={{ marginBottom: 16, color: '#f59e0b' }}>⏳ Pending Customer Approvals</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {unread.filter(n => n.type === 'NEW_CUSTOMER').map(notif => (
                            <div key={notif.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                    {notif.payload?.userAvatar || '👤'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{notif.payload?.userName}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{notif.payload?.userEmail} · Awaiting approval</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(notif)}>✅ Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Applications */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 16 }}>Recent Applications</div>
                {recentApps.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No applications yet</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>AI Score</th><th>Fraud</th><th>Status</th></tr></thead>
                            <tbody>
                                {recentApps.map(app => (
                                    <tr key={app.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--indigo-light)' }}>{app.id}</td>
                                        <td><strong>{app.customerName}</strong></td>
                                        <td>₹{app.loanAmount?.toLocaleString()}</td>
                                        <td><span style={{ fontWeight: 800, color: app.riskResult?.bandColor }}>{app.riskResult?.score}</span> <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.riskResult?.band}</span></td>
                                        <td>{app.fraud?.isFlagged ? <span className="badge badge-danger">⚠️ Flagged</span> : <span className="badge badge-success">✅ Clean</span>}</td>
                                        <td><span className={`badge ${app.status === 'Approved' ? 'badge-success' : app.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{app.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
