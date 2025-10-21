import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Parent pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentInvoices from './pages/parent/Invoices';
import ParentInvoiceDetail from './pages/parent/InvoiceDetail';
import ParentPayments from './pages/parent/Payments';
import ParentProfile from './pages/parent/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminFamilies from './pages/admin/Families';
import AdminInvoices from './pages/admin/Invoices';
import AdminPayments from './pages/admin/Payments';
import AdminPayouts from './pages/admin/Payouts';
import AdminSettings from './pages/admin/Settings';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Parent routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute roles={['PARENT']}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentDashboard />} />
          <Route path="invoices" element={<ParentInvoices />} />
          <Route path="invoices/:id" element={<ParentInvoiceDetail />} />
          <Route path="payments" element={<ParentPayments />} />
          <Route path="profile" element={<ParentProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'SCHOOL_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="families" element={<AdminFamilies />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Redirect based on role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'PARENT' ? (
                <Navigate to="/parent" replace />
              ) : (
                <Navigate to="/admin" replace />
              )
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
