import { useLoan } from '../../context/LoanContext';

export default function CustomerProfiles() {
    const { applications } = useLoan();

    // Deduplicate by customer
    const customers = Object.values(
        applications.reduce((acc, app) => {
            if (!acc[app.customerId]) {
                acc[app.customerId] = {
                    id: app.customerId, name: app.customerName,
                    applications: [], totalRequested: 0,
                    avatar: app.customerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                };
            }
            acc[app.customerId].applications.push(app);
            acc[app.customerId].totalRequested += app.loanAmount || 0;
            return acc;
        }, {})
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Customer <span>Profiles</span></h1>
                <p>{customers.length} unique customers in the system</p>
            </div>

            <div className="grid-2">
                {customers.map(customer => {
                    const approvedApps = customer.applications.filter(a => a.status === 'Approved');
                    const latestApp = customer.applications[0];
                    const avgScore = customer.applications.length
                        ? Math.round(customer.applications.reduce((s, a) => s + (a.riskResult?.score || 0), 0) / customer.applications.length)
                        : 0;
                    const hasFraud = customer.applications.some(a => a.fraud?.isFlagged);

                    return (
                        <div key={customer.id} className="card">
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                                    {customer.avatar}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>{customer.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{customer.id}</div>
                                </div>
                                {hasFraud && <span className="badge badge-danger">⚠️ Fraud Flag</span>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                                {[
                                    ['Applications', customer.applications.length],
                                    ['Approved', approvedApps.length],
                                    ['Avg AI Score', avgScore],
                                    ['Total Requested', `₹${customer.totalRequested.toLocaleString()}`],
                                ].map(([l, v]) => (
                                    <div key={l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{v}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Latest application */}
                            {latestApp && (
                                <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Latest Application</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', align: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{latestApp.id} — {latestApp.purpose}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>₹{latestApp.loanAmount?.toLocaleString()} · {latestApp.tenure}mo</div>
                                        </div>
                                        <span className={`badge ${latestApp.status === 'Approved' ? 'badge-success' : latestApp.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                            {latestApp.status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* AI Risk */}
                            {latestApp?.riskResult && (
                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Latest Risk Score</div>
                                    <div>
                                        <span style={{ fontWeight: 800, fontSize: 20, color: latestApp.riskResult.bandColor }}>{latestApp.riskResult.score}</span>
                                        <span className={`badge ${latestApp.riskResult.band === 'LOW' ? 'badge-success' : latestApp.riskResult.band === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`} style={{ marginLeft: 8 }}>{latestApp.riskResult.band}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
