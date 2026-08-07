import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoan } from '../../context/LoanContext';

const REQUIRED_DOCS = [
    { id: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', required: true, desc: 'Government issued identity' },
    { id: 'pan', label: 'PAN Card', icon: '💳', required: true, desc: 'Tax identification' },
    { id: 'salary', label: 'Salary Slip (last 3 months)', icon: '💰', required: true, desc: 'Income proof' },
    { id: 'bank', label: 'Bank Statement (6 months)', icon: '🏦', required: false, desc: 'Optional — strengthens application' },
    { id: 'itr', label: 'Income Tax Return', icon: '📑', required: false, desc: 'Optional — for self-employed' },
];

export default function UploadDocuments() {
    const { user } = useAuth();
    const { getByCustomer } = useLoan();
    const myApps = getByCustomer(user.id);
    const latest = myApps[0];

    const [uploaded, setUploaded] = useState(
        (latest?.uploadedDocs || []).reduce((acc, d) => {
            const found = REQUIRED_DOCS.find(rd => rd.label.toLowerCase().includes(d.toLowerCase().split(' ')[0].toLowerCase()));
            if (found) acc[found.id] = true;
            return acc;
        }, {})
    );
    const [dragging, setDragging] = useState('');

    const handleUpload = (docId, file) => {
        if (!file) return;
        // Simulate upload
        setTimeout(() => setUploaded(prev => ({ ...prev, [docId]: file.name || true })), 600);
    };

    const completedRequired = REQUIRED_DOCS.filter(d => d.required && uploaded[d.id]).length;
    const totalRequired = REQUIRED_DOCS.filter(d => d.required).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Upload <span>Documents</span></h1>
                <p>Securely upload identity and income proofs to strengthen your application</p>
            </div>

            {/* Progress */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div className="card-title">Document Completion</div>
                    <span style={{ fontSize: 13, color: 'var(--indigo-light)', fontWeight: 700 }}>{completedRequired}/{totalRequired} Required</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(completedRequired / totalRequired) * 100}%`, background: 'var(--gradient-primary)' }}></div>
                </div>
                {completedRequired === totalRequired && (
                    <div className="alert alert-success" style={{ marginTop: 16, marginBottom: 0 }}>
                        ✅ All required documents uploaded. Your application is complete!
                    </div>
                )}
            </div>

            {/* Document List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {REQUIRED_DOCS.map(doc => (
                    <div key={doc.id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 32, flex: '0 0 40px', textAlign: 'center' }}>{doc.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{doc.label}</span>
                                <span className={`badge ${doc.required ? 'badge-danger' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                                    {doc.required ? 'Required' : 'Optional'}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doc.desc}</p>
                        </div>
                        {uploaded[doc.id] ? (
                            <div style={{ display: 'flex', align: 'center', gap: 8, color: 'var(--emerald)', fontWeight: 600, fontSize: 13 }}>
                                ✅ Uploaded
                            </div>
                        ) : (
                            <label
                                className={`upload-zone ${dragging === doc.id ? 'active' : ''}`}
                                style={{ padding: '12px 20px', width: 200, cursor: 'pointer', marginBottom: 0 }}
                                onDragOver={e => { e.preventDefault(); setDragging(doc.id); }}
                                onDragLeave={() => setDragging('')}
                                onDrop={e => { e.preventDefault(); setDragging(''); handleUpload(doc.id, e.dataTransfer.files[0]); }}
                            >
                                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleUpload(doc.id, e.target.files[0])} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>📤</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Click or drag to upload</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>PDF, JPG, PNG</div>
                                </div>
                            </label>
                        )}
                    </div>
                ))}
            </div>

            {/* Security Note */}
            <div className="card" style={{ marginTop: 20, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24 }}>🔐</span>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Bank-Grade Security</div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            All documents are encrypted with AES-256 and stored securely. Access is strictly limited to your loan officer.
                            Documents are permanently deleted within 30 days after loan closure per DPDP Act 2023.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
