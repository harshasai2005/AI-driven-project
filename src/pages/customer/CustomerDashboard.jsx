import { useAuth } from '../../context/AuthContext';
import { useLoan } from '../../context/LoanContext';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const { getByCustomer } = useLoan();
    const myApps = getByCustomer(user.id);
    const latest = myApps[0];
    const hasApp = myApps.length > 0;

    const statusColor = { Approved: 'badge-success', Rejected: 'badge-danger', 'Under Review': 'badge-warning', Submitted: 'badge-blue' };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><span>Welcome back,</span> {user.name} 👋</h1>
                <p>Your AI-powered underwriting portal — transparent, fair, explainable.</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>📋</div>
                    <div>
                        <div className="stat-value">{myApps.length}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
                    <div>
                        <div className="stat-value">{myApps.filter(a => a.status === 'Approved').length}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>🎯</div>
                    <div>
                        <div className="stat-value">{latest?.riskResult?.score ?? '—'}</div>
                        <div className="stat-label">Latest Risk Score</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>⏳</div>
                    <div>
                        <div className="stat-value">{myApps.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length}</div>
                        <div className="stat-label">Pending Review</div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Latest Application */}
                <div className="card">
                    <div className="card-header">
                        <div><div className="card-title">Latest Application</div><div className="card-subtitle">Most recent submission</div></div>
                        {hasApp && <span className={`badge ${statusColor[latest.status] || 'badge-blue'}`}>{latest.status}</span>}
                    </div>
                    {hasApp ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                {[
                                    ['Application ID', latest.id],
                                    ['Loan Amount', `₹${latest.loanAmount?.toLocaleString()}`],
                                    ['Purpose', latest.purpose],
                                    ['Tenure', `${latest.tenure} months`],
                                    ['Submitted', new Date(latest.submittedAt).toLocaleDateString('en-IN')],
                                ].map(([label, val]) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/dashboard/risk" className="btn btn-primary btn-sm">View AI Analysis →</Link>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No applications yet. Start your loan journey.</p>
                            <Link to="/dashboard/apply" className="btn btn-primary">Apply for Loan →</Link>
                        </div>
                    )}
                </div>

                {/* Risk Score Preview */}
                <div className="card">
                    <div className="card-header">
                        <div><div className="card-title">AI Risk Score</div><div className="card-subtitle">Powered by alternative data</div></div>
                    </div>
                    {latest?.riskResult ? (
                        <>
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div className="risk-score-value" style={{ color: latest.riskResult.bandColor }}>{latest.riskResult.score}</div>
                                <div className="risk-score-band" style={{ color: latest.riskResult.bandColor }}>{latest.riskResult.band} RISK</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Confidence: {latest.riskResult.confidence}%</div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                {latest.riskResult.features.slice(0, 3).map(f => (
                                    <div key={f.key} className="explain-bar-row">
                                        <span className="explain-bar-label" style={{ fontSize: 11 }}>{f.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <div className="explain-bar-track">
                                            <div className="explain-bar-fill" style={{ width: `${f.contribution}%`, background: 'var(--gradient-primary)' }}></div>
                                        </div>
                                        <span className="explain-bar-value" style={{ fontSize: 11, color: 'var(--indigo-light)' }}>{Math.round(f.contribution)}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/dashboard/risk" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>Full Explanation →</Link>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
                            <p>Submit an application to see your AI risk score</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Workflow Guide */}
            <div className="card">
                <div className="card-title" style={{ marginBottom: 20 }}>Your Application Journey</div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {[
                        { icon: '📝', step: '1', title: 'Apply', desc: 'Fill loan details', path: '/dashboard/apply' },
                        { icon: '📁', step: '2', title: 'Upload Docs', desc: 'Identity & income proof', path: '/dashboard/documents' },
                        { icon: '🤖', step: '3', title: 'AI Scoring', desc: 'Automated risk assessment', path: '/dashboard/risk' },
                        { icon: '✅', step: '4', title: 'Decision', desc: 'Approval recommendation', path: '/dashboard/status' },
                    ].map((item, i) => (
                        <Link to={item.path} key={i} style={{ flex: 1, textDecoration: 'none' }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', transition: 'var(--transition)', cursor: 'pointer' }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Step {item.step}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
