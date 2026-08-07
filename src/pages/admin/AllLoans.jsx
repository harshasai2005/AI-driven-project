import { useState } from 'react';
import { useLoan } from '../../context/LoanContext';

const STATUS_CONFIG = {
    Approved: { class: 'badge-success', icon: '✅' },
    Rejected: { class: 'badge-danger', icon: '❌' },
    'Under Review': { class: 'badge-warning', icon: '🔍' },
    Submitted: { class: 'badge-blue', icon: '📤' },
};

export default function AllLoans() {
    const { applications } = useLoan();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRisk, setFilterRisk] = useState('All');
    const [selected, setSelected] = useState(null);

    const filtered = applications.filter(app => {
        const matchSearch = !search || app.customerName.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search.toUpperCase());
        const matchStatus = filterStatus === 'All' || app.status === filterStatus;
        const matchRisk = filterRisk === 'All' || app.riskResult?.band === filterRisk;
        return matchSearch && matchStatus && matchRisk;
    });

    return (
        <div className="page-container">
            <div className="page-header page-header-row">
                <div>
                    <h1>All Loan <span>Requests</span></h1>
                    <p>{applications.length} total applications · {filtered.length} shown</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, align: 'center', flexWrap: 'wrap' }}>
                <input className="form-input" style={{ flex: 2, minWidth: 200 }} placeholder="🔍 Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="form-select" style={{ flex: 1, minWidth: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <select className="form-select" style={{ flex: 1, minWidth: 130 }} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                    <option value="All">All Risk Bands</option>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                    <option value="VERY HIGH">Very High Risk</option>
                </select>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>App ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Purpose</th>
                            <th>AI Score</th>
                            <th>Risk Band</th>
                            <th>Fraud</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(app => (
                            <tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === app.id ? null : app)}>
                                <td><span style={{ fontWeight: 700, color: 'var(--indigo-light)' }}>{app.id}</span></td>
                                <td><strong>{app.customerName}</strong></td>
                                <td>₹{app.loanAmount?.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{app.purpose}</td>
                                <td><span style={{ fontWeight: 800, fontSize: 16, color: app.riskResult?.bandColor }}>{app.riskResult?.score}</span></td>
                                <td><span className={`badge ${app.riskResult?.band === 'LOW' ? 'badge-success' : app.riskResult?.band === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>{app.riskResult?.band}</span></td>
                                <td>{app.fraud?.isFlagged ? <span className="badge badge-danger">⚠️ Flagged</span> : <span className="badge badge-success">✓ Clean</span>}</td>
                                <td><span className={`badge ${STATUS_CONFIG[app.status]?.class}`}>{app.status}</span></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(app.submittedAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expand row */}
            {selected && (
                <div className="card" style={{ marginTop: 20 }}>
                    <div className="card-header">
                        <div><div className="card-title">Application Details — {selected.id}</div></div>
                        <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                    </div>
                    <div className="grid-3">
                        {[
                            ['Customer', selected.customerName],
                            ['Loan Amount', `₹${selected.loanAmount?.toLocaleString()}`],
                            ['Purpose', selected.purpose],
                            ['Tenure', `${selected.tenure} months`],
                            ['Monthly Income', `₹${selected.monthlyIncome?.toLocaleString()}`],
                            ['FOIR', `${((selected.existingEMIs / selected.monthlyIncome) * 100).toFixed(1)}%`],
                            ['Employment', selected.employmentType?.replace(/_/g, ' ')],
                            ['AI Score', `${selected.riskResult?.score} — ${selected.riskResult?.band}`],
                            ['Confidence', `${selected.riskResult?.confidence}%`],
                        ].map(([k, v]) => (
                            <div key={k} style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>AI Recommendation:</div>
                        <div className="alert alert-info" style={{ marginBottom: 0 }}>{selected.riskResult?.recommendation}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
