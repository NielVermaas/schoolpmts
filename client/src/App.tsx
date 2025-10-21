import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';

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
  // AUTHENTICATION DISABLED FOR TESTING
  // All users default to parent view

  return (
    <Router>
      <Routes>
        {/* Parent routes - default view */}
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentDashboard />} />
          <Route path="invoices" element={<ParentInvoices />} />
          <Route path="invoices/:id" element={<ParentInvoiceDetail />} />
          <Route path="payments" element={<ParentPayments />} />
          <Route path="profile" element={<ParentProfile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="families" element={<AdminFamilies />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Redirect to parent portal by default */}
        <Route path="/" element={<Navigate to="/parent" replace />} />
        <Route path="/auth/*" element={<Navigate to="/parent" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
