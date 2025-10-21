import { Users, FileText, CreditCard, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - in production this would come from API
  const stats = {
    totalFamilies: 0,
    totalStudents: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">School Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of school finances and activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Families</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFamilies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                R {(stats.pendingPayments / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/families"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Users className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Families</h3>
            <p className="text-sm text-gray-600 mt-1">Add and manage families and students</p>
          </a>

          <a
            href="/admin/invoices"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Create Invoice</h3>
            <p className="text-sm text-gray-600 mt-1">Generate invoices for school fees</p>
          </a>

          <a
            href="/admin/payments"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Payments</h3>
            <p className="text-sm text-gray-600 mt-1">Track and reconcile payments</p>
          </a>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
        <ol className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>
              Go to <a href="/admin/families" className="underline font-medium">Families</a> and add your first family and students/pupils
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>
              Create invoices for school fees in the <a href="/admin/invoices" className="underline font-medium">Invoices</a> section
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>
              Track payments and send statements from <a href="/admin/payments" className="underline font-medium">Payments</a>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>
              Configure school details and branding in <a href="/admin/settings" className="underline font-medium">Settings</a>
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
