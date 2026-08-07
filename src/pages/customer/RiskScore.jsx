import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoan } from '../../context/LoanContext';
import { Link } from 'react-router-dom';

function FeatureBar({ label, value, color }) {
    const [width, setWidth] = useState(0);
    useEffect(() => { setTimeout(() => setWidth(Math.min(value, 100)), 200); }, [value]);
    return (
        <div className="explain-bar-row">
            <span className="explain-bar-label">{label}</span>
            <div className="explain-bar-track">
                <div className="explain-bar-fill" style={{ width: `${width}%`, background: color || 'var(--gradient-primary)' }}></div>
            </div>
            <span className="explain-bar-value" style={{ color: 'var(--indigo-light)' }}>{Math.round(value)}</span>
        </div>
    );
}

export default function RiskScore() {
    const { user } = useAuth();
    const { getByCustomer } = useLoan();
    const myApps = getByCustomer(user.id);
    const app = myApps[0];

    if (!app) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🎯</div>
                <h2>No Application Found</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Submit a loan application to see your AI risk analysis</p>
                <Link to="/dashboard/apply" className="btn btn-primary">Apply Now →</Link>
            </div>
        );
    }

    const { riskResult, explanation, fraud } = app;
    const { score, band, bandColor, confidence, components, features, recommendation } = riskResult;
    const bandColors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', 'VERY HIGH': '#f43f5e' };

    const compLabels = {
        incomeStability: 'Income Stability',
        digitalEngagement: 'Digital Engagement',
        employmentSeniority: 'Employment Seniority',
        educationLevel: 'Education Level',
        alternativeBehavioral: 'Alt. Behavioural',
    };

    const compColors = {
        incomeStability: 'linear-gradient(90deg,#10b981,#22d3ee)',
        digitalEngagement: 'linear-gradient(90deg,#6366f1,#a855f7)',
        employmentSeniority: 'linear-gradient(90deg,#f59e0b,#f97316)',
        educationLevel: 'linear-gradient(90deg,#22d3ee,#6366f1)',
        alternativeBehavioral: 'linear-gradient(90deg,#a855f7,#ec4899)',
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>AI <span>Risk Analysis</span></h1>
                <p>Explainable AI-generated risk score using alternative data — Application {app.id}</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Score Gauge */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title" style={{ textAlign: 'left', marginBottom: 24 }}>Risk Score</div>
                    <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                        <svg width="200" height="120" viewBox="0 0 200 120">
                            {/* Background arc */}
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
                            {/* Score arc */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke={bandColor}
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={`${(score / 100) * 251} 251`}
                                style={{ filter: `drop-shadow(0 0 8px ${bandColor}88)` }}
                            />
                            {/* Zone markers */}
                            {[
                                { label: 'VH', x: 24, y: 102, color: '#f43f5e' },
                                { label: 'H', x: 58, y: 30, color: '#f97316' },
                                { label: 'M', x: 142, y: 30, color: '#f59e0b' },
                                { label: 'L', x: 176, y: 102, color: '#10b981' },
                            ].map(m => (
                                <text key={m.label} x={m.x} y={m.y} fill={m.color} fontSize="9" fontWeight="700" textAnchor="middle">{m.label}</text>
                            ))}
                        </svg>
                    </div>
                    <div className="risk-score-value" style={{ color: bandColor, marginTop: -16 }}>{score}</div>
                    <div className="risk-score-band" style={{ color: bandColor }}>{band} RISK</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                        Model Confidence: <strong style={{ color: 'var(--text-primary)' }}>{confidence}%</strong>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <span className={`badge ${band === 'LOW' ? 'badge-success' : band === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                            {recommendation.split('—')[0].trim()}
                        </span>
                    </div>
                </div>

                {/* Fraud Check */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>Fraud Check</div>
                    <div style={{ display: 'flex', align: 'center', gap: 12, padding: '14px 16px', background: fraud.isFlagged ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${fraud.isFlagged ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                        <span style={{ fontSize: 28 }}>{fraud.isFlagged ? '⚠️' : '✅'}</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{fraud.isFlagged ? 'Anomalies Detected' : 'No Fraud Indicators'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Fraud Risk Level: <strong style={{ color: fraud.riskLevel === 'LOW' ? '#10b981' : fraud.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b' }}>{fraud.riskLevel}</strong>
                            </div>
                        </div>
                    </div>
                    {fraud.flags.length > 0 ? fraud.flags.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, padding: '10px 12px', background: 'rgba(244,63,94,0.06)', borderRadius: 8, borderLeft: '3px solid #f43f5e' }}>
                            <span style={{ fontSize: 12 }}>🚩</span>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)' }}>{f.code} · {f.severity}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{f.message}</div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>All fraud checks passed ✓</div>
                    )}
                </div>
            </div>

            {/* Feature Importance */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div><div className="card-title">Feature Importance (SHAP-style)</div><div className="card-subtitle">Weighted contribution of each factor to the risk score</div></div>
                </div>
                {Object.entries(components).map(([key, val]) => (
                    <FeatureBar key={key} label={compLabels[key] || key} value={val} color={compColors[key]} />
                ))}
            </div>

            {/* Plain-Language Explanation */}
            <div className="card">
                <div className="card-header">
                    <div><div className="card-title">📖 AI Decision Explanation</div><div className="card-subtitle">Plain-language rationale you can share with regulators</div></div>
                </div>
                <div className="alert alert-info" style={{ marginBottom: 20 }}>{explanation.summary}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {explanation.reasons.map((r, i) => (
                        <div key={i} style={{ fontSize: 13, padding: '10px 14px', background: r.startsWith('✅') ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${r.startsWith('✅') ? '#10b981' : '#f59e0b'}` }}>
                            {r}
                        </div>
                    ))}
                </div>
                <div className="alert alert-warning" style={{ marginTop: 20, fontSize: 12 }}>
                    ⚖️ {explanation.fairnessNote}
                </div>
            </div>
        </div>
    );
}
