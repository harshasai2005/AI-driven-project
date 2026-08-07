import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const CustomerNav = [
    { path: '/dashboard', icon: '⊞', label: 'Overview' },
    { path: '/dashboard/apply', icon: '📋', label: 'Loan Application' },
    { path: '/dashboard/documents', icon: '📁', label: 'Upload Documents' },
    { path: '/dashboard/risk', icon: '🎯', label: 'Risk Score & AI' },
    { path: '/dashboard/status', icon: '📊', label: 'Application Status' },
];

const AdminNav = [
    { path: '/admin', icon: '⊞', label: 'Overview' },
    { path: '/admin/loans', icon: '📋', label: 'All Loan Requests', badgeKey: 'total' },
    { path: '/admin/fraud', icon: '🚨', label: 'Fraud Alerts', badgeKey: 'fraud' },
    { path: '/admin/customers', icon: '👥', label: 'Customer Profiles' },
    { path: '/admin/charts', icon: '📈', label: 'Risk Analysis' },
    { path: '/admin/approvals', icon: '✅', label: 'Approvals / Rejections' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { applications } = useLoan();
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';
    const navItems = isAdmin ? AdminNav : CustomerNav;

    const getBadge = (badgeKey) => {
        if (!badgeKey) return null;
        let count = 0;
        if (badgeKey === 'fraud') {
            count = applications.filter(a => a.fraud?.isFlagged).length;
        } else {
            count = applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length;
        }
        return count > 0 ? <span className="badge" style={{ background: 'var(--rose)', color: 'white', marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 20 }}>{count}</span> : null;
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>🏦 LendAI</h2>
                <span>{isAdmin ? 'Admin Console' : 'Customer Portal'}</span>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        {item.label}
                        {getBadge(item.badgeKey)}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{user?.avatar}</div>
                    <div>
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 10, fontSize: 12 }}
                    onClick={() => { logout(); navigate('/'); }}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    );
}
