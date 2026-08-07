import { useLoan } from '../../context/LoanContext';

const SEVERITY_CONFIG = {
    HIGH: { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    LOW: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
};

export default function FraudAlerts() {
    const { applications } = useLoan();
    const flagged = applications.filter(a => a.fraud?.isFlagged);
    const clean = applications.filter(a => !a.fraud?.isFlagged);

    const totalFlags = flagged.reduce((s, a) => s + (a.fraud?.flags?.length || 0), 0);
    const criticalCount = flagged.filter(a => a.fraud?.riskLevel === 'CRITICAL').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🚨 Fraud <span>Alerts</span></h1>
                <p>AI-powered anomaly detection flags for manual review</p>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
                {[
                    { label: 'Flagged Apps', value: flagged.length, color: '#f43f5e', icon: '⚠️' },
                    { label: 'Critical Alerts', value: criticalCount, color: '#f43f5e', icon: '🔴' },
                    { label: 'Total Flags', value: totalFlags, color: '#f97316', icon: '🚩' },
                    { label: 'Clean Applications', value: clean.length, color: '#10b981', icon: '✅' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}20`, fontSize: 22 }}>{s.icon}</div>
                        <div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {flagged.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                    <h3 style={{ marginBottom: 8 }}>No Fraud Alerts</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>All applications have passed automated fraud checks</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {flagged.map(app => (
                        <div key={app.id} className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', align: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 24 }}>⚠️</span>
                                    <div>
                                        <div style={{ display: 'flex', gap: 10, align: 'center' }}>
                                            <span style={{ fontWeight: 800, fontSize: 15 }}>{app.customerName}</span>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>({app.id})</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                            ₹{app.loanAmount?.toLocaleString()} · {app.purpose} · Submitted {new Date(app.submittedAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                                    <span className={`badge ${app.fraud.riskLevel === 'CRITICAL' ? 'badge-danger' : app.fraud.riskLevel === 'HIGH' ? 'badge-warning' : 'badge-blue'}`}>
                                        {app.fraud.riskLevel} RISK
                                    </span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: app.riskResult?.bandColor }}>{app.riskResult?.score}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Score</div>
                                    </div>
                                </div>
                            </div>

                            {/* Fraud Flags */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {app.fraud.flags.map((flag, i) => {
                                    const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.LOW;
                                    return (
                                        <div key={i} style={{ padding: '12px 16px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 'var(--radius-sm)', display: 'flex', gap: 12, align: 'flex-start' }}>
                                            <span style={{ fontSize: 14 }}>🚩</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 12, color: cfg.color, marginBottom: 4 }}>{flag.code} — {flag.severity} SEVERITY</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{flag.message}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Fraud score */}
                            <div style={{ marginTop: 14, display: 'flex', align: 'center', gap: 12 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fraud Score:</span>
                                <div style={{ flex: 1, maxWidth: 200 }}>
                                    <div className="progress-bar" style={{ height: 8 }}>
                                        <div className="progress-fill" style={{ width: `${app.fraud.fraudScore}%`, background: 'var(--gradient-danger)' }}></div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700, color: '#f43f5e', fontSize: 14 }}>{app.fraud.fraudScore}/100</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
