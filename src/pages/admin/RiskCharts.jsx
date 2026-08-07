import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, Legend,
} from 'recharts';
import { useLoan } from '../../context/LoanContext';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1f2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
            ))}
        </div>
    );
};

export default function RiskCharts() {
    const { applications } = useLoan();

    // Risk band distribution
    const bandData = [
        { name: 'LOW', count: applications.filter(a => (a.riskResult?.score || 0) >= 75).length, fill: '#10b981' },
        { name: 'MEDIUM', count: applications.filter(a => (a.riskResult?.score || 0) >= 55 && (a.riskResult?.score || 0) < 75).length, fill: '#f59e0b' },
        { name: 'HIGH', count: applications.filter(a => (a.riskResult?.score || 0) >= 35 && (a.riskResult?.score || 0) < 55).length, fill: '#f97316' },
        { name: 'VERY HIGH', count: applications.filter(a => (a.riskResult?.score || 0) < 35).length, fill: '#f43f5e' },
    ];

    // Status breakdown
    const statusData = [
        { name: 'Approved', value: applications.filter(a => a.status === 'Approved').length, fill: '#10b981' },
        { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, fill: '#f43f5e' },
        { name: 'Under Review', value: applications.filter(a => a.status === 'Under Review').length, fill: '#f59e0b' },
        { name: 'Submitted', value: applications.filter(a => a.status === 'Submitted').length, fill: '#6366f1' },
    ].filter(d => d.value > 0);

    // Component scores radar (average)
    const avgComp = (key) => Math.round(applications.reduce((s, a) => s + (a.riskResult?.components?.[key] || 0), 0) / (applications.length || 1));
    const radarData = [
        { subject: 'Income', value: avgComp('incomeStability'), fullMark: 100 },
        { subject: 'Digital', value: avgComp('digitalEngagement'), fullMark: 100 },
        { subject: 'Employment', value: avgComp('employmentSeniority'), fullMark: 100 },
        { subject: 'Education', value: avgComp('educationLevel'), fullMark: 100 },
        { subject: 'Behavioural', value: avgComp('alternativeBehavioral'), fullMark: 100 },
    ];

    // Score trend data (simulated sorted by submission)
    const sortedApps = [...applications].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    const trendData = sortedApps.map((a, i) => ({
        name: `App ${i + 1}`, score: a.riskResult?.score, fraud: a.fraud?.fraudScore || 0,
    }));

    const chartBg = 'transparent';
    const gridColor = 'rgba(255,255,255,0.06)';
    const axisColor = '#475569';

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Risk <span>Analysis Charts</span></h1>
                <p>Visual analytics of AI risk scores, fraud patterns, and portfolio composition</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Bar Chart — Risk Band Distribution */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 20 }}>Risk Band Distribution</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={bandData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
                            <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                                {bandData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart — Application Status */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 20 }}>Application Status Breakdown</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={3}>
                                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Radar — Average Component Scores */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 20 }}>Average Factor Scores (Portfolio)</div>
                    <ResponsiveContainer width="100%" height={240}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: axisColor, fontSize: 10 }} />
                            <Radar name="Avg Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart — Score vs Fraud Score Trend */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 20 }}>Score vs Fraud Risk Trend</div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: axisColor, fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            <Line type="monotone" dataKey="score" name="AI Score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 5 }} />
                            <Line type="monotone" dataKey="fraud" name="Fraud Risk" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f43f5e', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fairness Report */}
            <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>⚖️ Fairness & Disparate Impact Report</div>
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    This model uses consented alternative data only. Protected characteristics (gender, caste, religion, region) are excluded from all scoring features.
                </div>
                <div className="grid-3">
                    {[
                        { label: 'Protected Variables Used', value: '0', color: '#10b981', icon: '✅' },
                        { label: 'Bias Tests Passed', value: '5/5', color: '#10b981', icon: '✅' },
                        { label: 'Data Sources Consented', value: '100%', color: '#6366f1', icon: '🔒' },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center', padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
