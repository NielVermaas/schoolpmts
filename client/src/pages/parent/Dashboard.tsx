import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { AlertCircle, DollarSign, FileText, CheckCircle } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['parent-dashboard', user?.familyId],
    queryFn: async () => {
      const response = await api.get(`/dashboard/parent/${user?.familyId}`);
      return response.data.data;
    },
    enabled: !!user?.familyId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { summary, invoices, payments } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Amount Owed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.totalOwed || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.totalPaid || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalInvoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {invoices?.slice(0, 5).map((invoice: any) => (
            <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">{formatDate(invoice.issueDate)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(invoice.amountDue)}
                  </p>
                  <p className="text-sm text-gray-600">Due: {formatDate(invoice.dueDate)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {payments?.slice(0, 5).map((payment: any) => (
            <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{payment.paymentReference}</p>
                <p className="text-sm text-gray-600">
                  {payment.invoice?.invoiceNumber || 'General Payment'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-gray-600">{formatDate(payment.completedAt)}</p>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {payment.method}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
