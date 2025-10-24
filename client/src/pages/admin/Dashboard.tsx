import { Users, FileText, CreditCard, DollarSign, TrendingUp, School, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Families</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFamilies}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">0% this month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">0% this month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <School className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Invoices</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInvoices}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">0% this month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R {(stats.pendingPayments / 100).toFixed(2)}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-amber-500 mr-1" />
                <span className="text-amber-600 font-medium">Track payments</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/schools"
            className="group relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-transparent hover:border-blue-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center">
                Manage Schools
                <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-600">Add and configure schools with pricing</p>
            </div>
          </Link>

          <Link
            to="/admin/families"
            className="group relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-transparent hover:border-purple-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center">
                Manage Families
                <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-600">Add families and students/pupils</p>
            </div>
          </Link>

          <Link
            to="/admin/invoices"
            className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-transparent hover:border-green-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center">
                Create Invoice
                <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-600">Generate invoices for school fees</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-br from-primary-50 to-cyan-50 rounded-2xl p-8 border-2 border-primary-100 shadow-soft">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <School className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h3>
            <ol className="space-y-3">
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-sm mr-3 group-hover:scale-110 transition-transform">1</span>
                <span className="text-gray-700">
                  Go to <Link to="/admin/schools" className="text-primary-600 hover:text-primary-700 font-semibold underline">Schools</Link> and add your first school with pricing
                </span>
              </li>
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-sm mr-3 group-hover:scale-110 transition-transform">2</span>
                <span className="text-gray-700">
                  Add families and students in the <Link to="/admin/families" className="text-primary-600 hover:text-primary-700 font-semibold underline">Families</Link> section
                </span>
              </li>
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-sm mr-3 group-hover:scale-110 transition-transform">3</span>
                <span className="text-gray-700">
                  Create invoices for school fees in the <Link to="/admin/invoices" className="text-primary-600 hover:text-primary-700 font-semibold underline">Invoices</Link> section
                </span>
              </li>
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-sm mr-3 group-hover:scale-110 transition-transform">4</span>
                <span className="text-gray-700">
                  Track payments and send statements from <Link to="/admin/payments" className="text-primary-600 hover:text-primary-700 font-semibold underline">Payments</Link>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
