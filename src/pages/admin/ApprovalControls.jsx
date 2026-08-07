import { useState } from 'react';
import { useLoan } from '../../context/LoanContext';

const STATUS_CONFIG = {
    Approved: { class: 'badge-success', icon: '✅' },
    Rejected: { class: 'badge-danger', icon: '❌' },
    'Under Review': { class: 'badge-warning', icon: '🔍' },
    Submitted: { class: 'badge-blue', icon: '📤' },
};

export default function ApprovalControls() {
    const { applications, updateStatus } = useLoan();
    const [confirmModal, setConfirmModal] = useState(null); // { app, action }
    const [notes, setNotes] = useState('');
    const [toast, setToast] = useState(null);

    const pending = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review');
    const decided = applications.filter(a => a.status === 'Approved' || a.status === 'Rejected');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleConfirm = () => {
        if (!confirmModal) return;
        updateStatus(confirmModal.app.id, confirmModal.action);
        showToast(
            confirmModal.action === 'Approved'
                ? `✅ ${confirmModal.app.customerName}'s application approved`
                : `❌ ${confirmModal.app.customerName}'s application rejected`,
            confirmModal.action === 'Approved' ? 'success' : 'danger'
        );
        setConfirmModal(null);
        setNotes('');
    };

    const CardRow = ({ app }) => (
        <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{app.customerName}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{app.id}</span>
                        <span className={`badge ${STATUS_CONFIG[app.status]?.class}`}>{app.status}</span>
                        {app.fraud?.isFlagged && <span className="badge badge-danger">⚠️ Fraud Flag</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {[
                            ['Loan Amount', `₹${app.loanAmount?.toLocaleString()}`],
                            ['Purpose', app.purpose],
                            ['Tenure', `${app.tenure} months`],
                            ['Employment', app.employmentType?.replace(/_/g, ' ')],
                        ].map(([l, v]) => (
                            <div key={l}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Score Block */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'center', minWidth: 130 }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: app.riskResult?.bandColor }}>{app.riskResult?.score}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: app.riskResult?.bandColor, textTransform: 'uppercase', letterSpacing: 1 }}>{app.riskResult?.band} RISK</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Confidence {app.riskResult?.confidence}%</div>
                </div>
            </div>

            {/* AI Recommendation */}
            <div className="alert alert-info" style={{ marginTop: 14, marginBottom: 14, fontSize: 12 }}>
                🤖 {app.riskResult?.recommendation}
            </div>

            {/* Fraud flags */}
            {app.fraud?.isFlagged && (
                <div className="alert alert-danger" style={{ marginBottom: 14, fontSize: 12 }}>
                    🚩 {app.fraud.flags.length} fraud flag(s): {app.fraud.flags.map(f => f.code).join(', ')}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-success" onClick={() => setConfirmModal({ app, action: 'Approved' })}>
                    ✅ Approve
                </button>
                <button className="btn btn-danger" onClick={() => setConfirmModal({ app, action: 'Rejected' })}>
                    ❌ Reject
                </button>
                <button className="btn btn-secondary" onClick={() => updateStatus(app.id, 'Under Review')}>
                    🔍 Mark Under Review
                </button>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{confirmModal.action === 'Approved' ? '✅ Approve Loan' : '❌ Reject Application'}</h3>
                            <button className="modal-close" onClick={() => setConfirmModal(null)}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
                            You are about to <strong style={{ color: confirmModal.action === 'Approved' ? '#10b981' : '#f43f5e' }}>{confirmModal.action === 'Approved' ? 'approve' : 'reject'}</strong> the application of <strong>{confirmModal.app.customerName}</strong> for ₹{confirmModal.app.loanAmount?.toLocaleString()}.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Decision Notes (optional)</label>
                            <textarea className="form-textarea" rows={3} placeholder="Add notes for audit trail..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => { setConfirmModal(null); setNotes(''); }}>Cancel</button>
                            <button className={`btn ${confirmModal.action === 'Approved' ? 'btn-success' : 'btn-danger'}`} onClick={handleConfirm}>
                                Confirm {confirmModal.action}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h1>Approval / <span>Rejection Controls</span></h1>
                <p>{pending.length} pending · {decided.length} decided</p>
            </div>

            {/* Pending */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    ⏳ Pending Decision
                    <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: 20, fontSize: 12, fontWeight: 700, padding: '2px 10px' }}>{pending.length}</span>
                </div>
                {pending.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>✅ No pending applications</div>
                ) : (
                    pending.map(app => <CardRow key={app.id} app={app} />)
                )}
            </div>

            {/* Decided */}
            <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                    📋 Recently Decided
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-light)', borderRadius: 20, fontSize: 12, fontWeight: 700, padding: '2px 10px' }}>{decided.length}</span>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Score</th><th>Decision</th><th>Reviewed</th></tr></thead>
                        <tbody>
                            {decided.map(app => (
                                <tr key={app.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--indigo-light)' }}>{app.id}</span></td>
                                    <td><strong>{app.customerName}</strong></td>
                                    <td>₹{app.loanAmount?.toLocaleString()}</td>
                                    <td><span style={{ fontWeight: 800, color: app.riskResult?.bandColor }}>{app.riskResult?.score}</span></td>
                                    <td><span className={`badge ${app.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>{app.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString('en-IN') : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
