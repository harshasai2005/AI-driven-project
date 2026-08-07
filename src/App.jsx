import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import LoanApplication from './pages/customer/LoanApplication';
import UploadDocuments from './pages/customer/UploadDocuments';
import RiskScore from './pages/customer/RiskScore';
import ApplicationStatus from './pages/customer/ApplicationStatus';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllLoans from './pages/admin/AllLoans';
import FraudAlerts from './pages/admin/FraudAlerts';
import CustomerProfiles from './pages/admin/CustomerProfiles';
import RiskCharts from './pages/admin/RiskCharts';
import ApprovalControls from './pages/admin/ApprovalControls';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  // Prevent unapproved customers from accessing the dashboard routes
  if (user.role === 'customer' && !user.approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}

function PendingApproval() {
  const { user, logout } = useAuth();
  if (!user || user.role !== 'customer') return <Navigate to="/" replace />;
  if (user.approved) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-container">
      <div className="auth-card card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Account Pending Approval</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Thank you for registering, <strong>{user.name}</strong>. Your customer account is currently under review.
          An admin will verify and approve your access shortly.
        </p>
        <button className="btn btn-secondary" onClick={logout} style={{ width: '100%' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          user.role === 'admin' ? <Navigate to="/admin" /> :
            user.approved ? <Navigate to="/dashboard" /> : <Navigate to="/pending-approval" />
        ) : <Login />
      } />

      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Customer Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="customer">
          <AppLayout><CustomerDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/apply" element={
        <ProtectedRoute requiredRole="customer">
          <AppLayout><LoanApplication /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/documents" element={
        <ProtectedRoute requiredRole="customer">
          <AppLayout><UploadDocuments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/risk" element={
        <ProtectedRoute requiredRole="customer">
          <AppLayout><RiskScore /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/status" element={
        <ProtectedRoute requiredRole="customer">
          <AppLayout><ApplicationStatus /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/loans" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><AllLoans /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/fraud" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><FraudAlerts /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><CustomerProfiles /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/charts" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><RiskCharts /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/approvals" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout><ApprovalControls /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
