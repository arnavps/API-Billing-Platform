import React, { useEffect } from 'react';
import { useBillingStore } from '../store/useBillingStore';
import { 
  CreditCard, 
  History, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const BillingDashboard: React.FC = () => {
  const { 
    subscription, 
    invoices, 
    loading, 
    fetchSubscription, 
    fetchInvoices,
    createPortal 
  } = useBillingStore();

  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, [fetchSubscription, fetchInvoices]);

  const handleManagePortal = async () => {
    try {
      const url = await createPortal();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open portal:', error);
      alert('Failed to open billing portal.');
    }
  };

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-slate-400">Manage your plan, payment methods, and view your billing history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 overflow-hidden relative"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {subscription?.planId?.name || 'Free Tier'}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  {subscription?.status === 'active' ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" />
                      {subscription?.status || 'No Subscription'}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleManagePortal}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage in Stripe
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-700/50 relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Billing Cycle</p>
                  <p className="text-white font-medium capitalize">{subscription.planId.billingCycle}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Next Renewal</p>
                  <p className="text-white font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          </motion.div>

          {/* Payment Method Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                <p className="text-slate-400 text-sm">Manage your saved cards and default payment source.</p>
              </div>
              <button 
                onClick={handleManagePortal}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Quick Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quota Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Monthly Requests</span>
                  <span className="text-white font-medium">
                    0 / {subscription?.planId?.requestsQuota.toLocaleString() || '1,000'}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full w-[2%]"></div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Your quota resets on {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'the 1st of next month'}.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Invoice History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-900/30">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice._id} className="text-sm text-slate-300 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.billingReason || 'Subscription renewal'}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        invoice.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={invoice.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                        <Download className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No billing history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default BillingDashboard;
