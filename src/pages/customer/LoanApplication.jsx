import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoan } from '../../context/LoanContext';

const STEPS = ['Personal Details', 'Financial Info', 'Alternative Data', 'Review & Submit'];

const PURPOSES = ['Home Purchase', 'Home Renovation', 'Education', 'Vehicle', 'Business', 'Medical', 'Travel', 'Debt Consolidation', 'Other'];

export default function LoanApplication() {
    const { user } = useAuth();
    const { submitApplication } = useLoan();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        loanAmount: '', purpose: 'Home Renovation', tenure: 36,
        age: '', monthlyIncome: '', existingEMIs: 0,
        employmentType: 'salaried_private', yearsEmployed: '',
        educationLevel: 'bachelor',
        hasLinkedIn: false, linkedInConnections: 0, hasGithub: false,
        hasActiveSocial: false, avgOnlineActivity: 'medium',
        utilityPaymentsOnTime: false, rentPaymentsOnTime: false,
        noInsuranceLapses: false, positiveAltData: false,
        previousApplications: 0, consent: false,
    });

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        submitApplication(
            { ...form, loanAmount: Number(form.loanAmount), monthlyIncome: Number(form.monthlyIncome), existingEMIs: Number(form.existingEMIs), yearsEmployed: Number(form.yearsEmployed), age: Number(form.age) },
            user.id, user.name
        );
        setLoading(false);
        setSubmitted(true);
        setTimeout(() => navigate('/dashboard/risk'), 2000);
    };

    if (submitted) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Application Submitted!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your AI Risk Analysis...</p>
                    <div style={{ marginTop: 20 }}><span className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--indigo)', margin: '0 auto', display: 'block' }}></span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Loan <span>Application</span></h1>
                <p>Complete your application to receive an AI-generated risk score and decision</p>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {STEPS.map((s, i) => (
                    <div key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                        <div className="step-circle">{i < step ? '✓' : i + 1}</div>
                        <div className="step-label">{s}</div>
                    </div>
                ))}
            </div>

            <div className="card">
                {/* Step 0: Personal Details */}
                {step === 0 && (
                    <>
                        <h3 style={{ marginBottom: 24, fontSize: 17, fontWeight: 700 }}>📋 Personal Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Loan Amount (₹)</label>
                                <input className="form-input" type="number" placeholder="500000" value={form.loanAmount} onChange={e => set('loanAmount', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Loan Purpose</label>
                                <select className="form-select" value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                                    {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tenure (months)</label>
                                <select className="form-select" value={form.tenure} onChange={e => set('tenure', Number(e.target.value))}>
                                    {[12, 24, 36, 48, 60, 84, 120].map(t => <option key={t} value={t}>{t} months ({t / 12} yr{t > 12 ? 's' : ''})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input className="form-input" type="number" placeholder="30" value={form.age} onChange={e => set('age', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Education Level</label>
                            <select className="form-select" value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)}>
                                <option value="phd">Ph.D / Doctorate</option>
                                <option value="masters">Masters / MBA / PG</option>
                                <option value="bachelor">Bachelor's Degree</option>
                                <option value="diploma">Diploma</option>
                                <option value="high_school">High School (12th)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </>
                )}

                {/* Step 1: Financial Info */}
                {step === 1 && (
                    <>
                        <h3 style={{ marginBottom: 24, fontSize: 17, fontWeight: 700 }}>💰 Financial Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Monthly Income (₹)</label>
                                <input className="form-input" type="number" placeholder="85000" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Existing EMIs (₹/mo)</label>
                                <input className="form-input" type="number" placeholder="0" value={form.existingEMIs} onChange={e => set('existingEMIs', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Employment Type</label>
                                <select className="form-select" value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                                    <option value="salaried_govt">Salaried — Government</option>
                                    <option value="salaried_private">Salaried — Private</option>
                                    <option value="self_employed">Self Employed</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="business_owner">Business Owner</option>
                                    <option value="student">Student</option>
                                    <option value="unemployed">Unemployed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Years at Current Job</label>
                                <input className="form-input" type="number" placeholder="3" value={form.yearsEmployed} onChange={e => set('yearsEmployed', e.target.value)} />
                            </div>
                        </div>
                        {form.monthlyIncome && form.existingEMIs !== undefined && (
                            <div className="alert alert-info" style={{ marginTop: 8 }}>
                                📊 Your FOIR: <strong>{((Number(form.existingEMIs) / Number(form.monthlyIncome || 1)) * 100).toFixed(1)}%</strong>
                                {' '}— Recommended: below 40%
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Alternative Data */}
                {step === 2 && (
                    <>
                        <h3 style={{ marginBottom: 8, fontSize: 17, fontWeight: 700 }}>🔍 Alternative Data</h3>
                        <div className="alert alert-info" style={{ marginBottom: 20 }}>
                            🔒 By providing this data you consent to its use for creditworthiness assessment under DPDP Act 2023. Only checked items will be used.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>💼 Professional Presence</div>
                                {[
                                    ['hasLinkedIn', 'Has active LinkedIn profile'],
                                    ['hasGithub', 'Has GitHub / portfolio'],
                                    ['hasActiveSocial', 'Active professional social media'],
                                ].map(([key, label]) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--indigo)', width: 15, height: 15 }} />
                                        {label}
                                    </label>
                                ))}
                                {form.hasLinkedIn && (
                                    <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
                                        <label className="form-label">LinkedIn Connections</label>
                                        <input className="form-input" type="number" placeholder="250" value={form.linkedInConnections} onChange={e => set('linkedInConnections', Number(e.target.value))} />
                                    </div>
                                )}
                            </div>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>🧾 Payment Behaviour</div>
                                {[
                                    ['utilityPaymentsOnTime', 'Utility bills paid on time'],
                                    ['rentPaymentsOnTime', 'Rent paid on time'],
                                    ['noInsuranceLapses', 'No insurance lapses'],
                                    ['positiveAltData', 'Other positive data signals'],
                                ].map(([key, label]) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--emerald)', width: 15, height: 15 }} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Online Activity Level</label>
                            <select className="form-select" value={form.avgOnlineActivity} onChange={e => set('avgOnlineActivity', e.target.value)}>
                                <option value="high">High — Multiple platforms, regular posting</option>
                                <option value="medium">Medium — Occasional activity</option>
                                <option value="low">Low — Minimal presence</option>
                            </select>
                        </div>
                    </>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <>
                        <h3 style={{ marginBottom: 20, fontSize: 17, fontWeight: 700 }}>📝 Review & Submit</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                            {[
                                ['Loan Amount', `₹${Number(form.loanAmount).toLocaleString()}`],
                                ['Purpose', form.purpose],
                                ['Tenure', `${form.tenure} months`],
                                ['Monthly Income', `₹${Number(form.monthlyIncome).toLocaleString()}`],
                                ['Existing EMIs', `₹${Number(form.existingEMIs).toLocaleString()}`],
                                ['Employment', form.employmentType.replace(/_/g, ' ')],
                                ['Education', form.educationLevel.replace(/_/g, ' ')],
                                ['Age', form.age + ' years'],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: '14px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 20 }}>
                            <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} style={{ accentColor: 'var(--indigo)', width: 16, height: 16, marginTop: 2 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                I consent to the processing of my personal and alternative data for credit risk assessment as described in the privacy policy, in accordance with the Digital Personal Data Protection Act 2023.
                            </span>
                        </label>
                    </>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                    <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Back</button>
                    {step < 3
                        ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
                        : <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={!form.consent || loading}>
                            {loading ? <><span className="spinner"></span> Submitting...</> : '🚀 Submit Application'}
                        </button>
                    }
                </div>
            </div>
        </div>
    );
}
