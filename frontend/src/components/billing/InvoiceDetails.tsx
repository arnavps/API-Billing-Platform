import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, Receipt, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface LineItem {
  type: 'usage' | 'subscription' | 'addon';
  description: string;
  apiName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'refunded';
  period: {
    start: string;
    end: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  tax: {
    rate: number;
    amount: number;
  };
  discount: {
    code?: string;
    amount: number;
  };
  total: number;
  currency: string;
  paidAt?: string;
  dueDate: string;
}

interface InvoiceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!invoice) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString(undefined, {
      style: 'currency',
      currency: invoice.currency || 'USD',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'failed': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                  <p className="text-sm text-slate-400">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  onClick={() => window.open(`/api/billing/invoices/${invoice._id}/download`, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Top Section: Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium w-fit ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Period</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{formatDate(invoice.period.start)} - {formatDate(invoice.period.end)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</span>
                    <div className="text-slate-300 font-medium">{formatDate(invoice.dueDate)}</div>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid On</span>
                      <div className="text-emerald-400 font-medium">{formatDate(invoice.paidAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Items</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/50 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium text-right">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {invoice.lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-white">{item.description}</div>
                            {item.apiName && <div className="text-xs text-slate-500">API: {item.apiName}</div>}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums">{item.quantity.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-4 text-right tabular-nums font-semibold">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-3 bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white tabular-nums">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax.amount > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Tax ({invoice.tax.rate}%)</span>
                      <span className="text-white tabular-nums">{formatCurrency(invoice.tax.amount)}</span>
                    </div>
                  )}
                  {invoice.discount.amount > 0 && (
                    <div className="flex justify-between text-sm text-rose-400">
                      <span>Discount {invoice.discount.code ? `(${invoice.discount.code})` : ''}</span>
                      <span className="tabular-nums">-{formatCurrency(invoice.discount.amount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-xl font-black text-indigo-400 tabular-nums">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500">
                Questions about this invoice? Contact us at support@meterflow.com
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
