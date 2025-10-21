import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ParentInvoiceDetail() {
  const { id } = useParams();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get(`/invoices/${id}`);
      return response.data.data.invoice;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="mt-1 text-gray-600">Issued: {formatDate(invoice.issueDate)}</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
          Pay Now
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="text-lg font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
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

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Student</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Qty</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Unit Price</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 text-sm text-gray-600">
                    {item.student
                      ? `${item.student.firstName} ${item.student.lastName}`
                      : '-'}
                  </td>
                  <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(invoice.amountPaid)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-red-600">
                <span>Amount Due:</span>
                <span>{formatCurrency(invoice.amountDue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
