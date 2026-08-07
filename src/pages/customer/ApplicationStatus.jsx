import { useAuth } from '../../context/AuthContext';
import { useLoan } from '../../context/LoanContext';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
    Submitted: { color: '#6366f1', icon: '📤', step: 0 },
    'Under Review': { color: '#f59e0b', icon: '🔍', step: 1 },
    Approved: { color: '#10b981', icon: '✅', step: 3 },
    Rejected: { color: '#f43f5e', icon: '❌', step: 3 },
};

export default function ApplicationStatus() {
    const { user } = useAuth();
    const { getByCustomer } = useLoan();
    const myApps = getByCustomer(user.id);

    if (!myApps.length) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
                <h2>No Applications Yet</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>You haven't submitted any loan applications</p>
                <Link to="/dashboard/apply" className="btn btn-primary">Apply Now →</Link>
            </div>
        );
    }

    const WORKFLOW = ['Submitted', 'Under Review', 'AI Scoring', 'Decision'];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Application <span>Status</span></h1>
                <p>Track the progress of all your loan applications in real-time</p>
            </div>

            {myApps.map(app => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['Submitted'];
                const currentStep = cfg.step;

                return (
                    <div key={app.id} className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <div>
                                <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 800, fontSize: 15 }}>{app.id}</span>
                                    <span className={`badge ${app.status === 'Approved' ? 'badge-success' : app.status === 'Rejected' ? 'badge-danger' : app.status === 'Under Review' ? 'badge-warning' : 'badge-blue'}`}>
                                        {cfg.icon} {app.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.purpose} — ₹{app.loanAmount?.toLocaleString()} for {app.tenure} months</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: app.riskResult?.bandColor }}>{app.riskResult?.score ?? '—'}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Risk Score</div>
                            </div>
                        </div>

                        {/* Status progress */}
                        <div className="stepper" style={{ marginBottom: 24 }}>
                            {WORKFLOW.map((step, i) => (
                                <div key={step} className={`step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
                                    <div className="step-circle">{i < currentStep ? '✓' : i + 1}</div>
                                    <div className="step-label">{step}</div>
                                </div>
                            ))}
                        </div>

                        {/* Decision box */}
                        {app.status === 'Approved' && (
                            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16, display: 'flex', gap: 16, align: 'center' }}>
                                <span style={{ fontSize: 32 }}>🎉</span>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: '#10b981', marginBottom: 4 }}>Congratulations! Your loan is approved ✓</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Loan amount of <strong>₹{app.loanAmount?.toLocaleString()}</strong> approved. Estimated monthly EMI: <strong>₹{Math.round(app.loanAmount * 0.02).toLocaleString()}</strong>
                                    </div>
                                    {app.reviewedAt && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Reviewed: {new Date(app.reviewedAt).toLocaleString('en-IN')}</div>}
                                </div>
                            </div>
                        )}
                        {app.status === 'Rejected' && (
                            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16 }}>
                                <div style={{ fontWeight: 800, fontSize: 15, color: '#f43f5e', marginBottom: 8 }}>❌ Application Not Approved</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    Based on the AI risk assessment, the current application exceeds acceptable risk thresholds.
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    You may reapply after 90 days or reduce the loan amount. Review your AI explanation for improvement tips.
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-line"><div className="timeline-dot" style={{ background: '#6366f1' }}></div><div className="timeline-connector"></div></div>
                                <div className="timeline-content">
                                    <h4>Application Submitted</h4>
                                    <time>{new Date(app.submittedAt).toLocaleString('en-IN')}</time>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-line"><div className="timeline-dot" style={{ background: currentStep >= 1 ? '#f59e0b' : 'var(--border)' }}></div><div className="timeline-connector"></div></div>
                                <div className="timeline-content">
                                    <h4>AI Risk Scoring</h4>
                                    <p>Score: {app.riskResult?.score} — {app.riskResult?.band} risk band</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-line"><div className="timeline-dot" style={{ background: currentStep >= 2 ? '#a855f7' : 'var(--border)' }}></div><div className="timeline-connector"></div></div>
                                <div className="timeline-content">
                                    <h4>Fraud Check Completed</h4>
                                    <p>{app.fraud?.flags?.length > 0 ? `${app.fraud.flags.length} anomaly flags raised` : 'All checks passed'}</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-line"><div className="timeline-dot" style={{ background: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#f43f5e' : 'var(--border)' }}></div></div>
                                <div className="timeline-content">
                                    <h4>{app.status === 'Approved' ? 'Loan Approved ✓' : app.status === 'Rejected' ? 'Application Rejected' : 'Awaiting Decision'}</h4>
                                    {app.reviewedAt && <time>{new Date(app.reviewedAt).toLocaleString('en-IN')}</time>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
